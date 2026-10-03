import { createSignal, createMemo, createRoot } from 'solid-js';
import { Task, TaskStatus, TaskPriority, CreateTaskInput, UpdateTaskInput, Subtask } from '../types/task';
import { syncTaskToCloud, deleteTaskFromCloud, fetchUserTasks } from '../services/taskSyncService';
import {
  setupRealtimeTaskSubscription,
  unsubscribeRealtimeTaskSubscription,
} from '../services/realtimeSyncService';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type RealtimeTaskChangeEvent =
  | { type: 'INSERT'; task: Task }
  | { type: 'UPDATE'; task: Task }
  | { type: 'DELETE'; taskId: string };

const STORAGE_KEY = 'tasksanywhere_tasks';

const priorityWeight: Record<TaskPriority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function sortTasksByPriority(taskList: Task[]): Task[] {
  const today = getTodayDateString();

  return [...taskList].sort((a, b) => {
    // 1. Status: pendentes antes de concluídas
    if (a.status !== b.status) {
      if (a.status === 'completed') return 1;
      if (b.status === 'completed') return -1;
    }

    // 2. Classificação por Prazo / Urgência Real (Opção 1)
    // Tier 0: Atrasadas (dueDate < today)
    // Tier 1: Vencem Hoje (dueDate === today)
    // Tier 2: Próximos dias (dueDate > today)
    // Tier 3: Sem prazo definido (Backlog)
    const getTier = (t: Task): number => {
      if (!t.dueDate) return 3;
      if (t.dueDate < today) return 0;
      if (t.dueDate === today) return 1;
      return 2;
    };

    const tierA = getTier(a);
    const tierB = getTier(b);

    if (tierA !== tierB) {
      return tierA - tierB;
    }

    // Dentro do mesmo Tier:
    if (tierA === 0) {
      // Atrasadas: maior prioridade primeiro; se empatar prioridade, data mais antiga primeiro
      const weightDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (weightDiff !== 0) return weightDiff;
      if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) {
        return a.dueDate.localeCompare(b.dueDate);
      }
    } else if (tierA === 1) {
      // Vencem Hoje: maior prioridade primeiro
      const weightDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (weightDiff !== 0) return weightDiff;
    } else if (tierA === 2) {
      // Próximos dias: cronológico mais próximo primeiro; se mesma data, maior prioridade
      if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) {
        return a.dueDate.localeCompare(b.dueDate);
      }
      const weightDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (weightDiff !== 0) return weightDiff;
    } else if (tierA === 3) {
      // Sem data (Backlog): maior prioridade primeiro
      const weightDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (weightDiff !== 0) return weightDiff;
    }

    // 3. Critério final de desempate: mais recente criado primeiro
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `task_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

function persist(taskList: Task[]) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(taskList));
    } catch (e) {
      console.error('Falha ao salvar tarefas no localStorage:', e);
    }
  }
}

function createTaskStore() {
  const [tasks, setTasks] = createSignal<Task[]>([]);
  const [cloudUserId, setCloudUserId] = createSignal<string | null>(null);
  let activeChannel: RealtimeChannel | null = null;

  function initTaskStore(): Task[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setTasks(parsed);
            return parsed;
          }
        } catch (e) {
          console.error('Falha ao carregar tarefas do localStorage:', e);
        }
      }
    }
    return tasks();
  }

  function clearTasks() {
    setTasks([]);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function addTask(input: CreateTaskInput): Task {
    const now = new Date().toISOString();

    const formattedSubtasks: Subtask[] = (input.subtasks || []).map((sub) => {
      if (typeof sub === 'string') {
        return { id: generateId(), title: sub, completed: false };
      }
      return { id: generateId(), title: sub.title, completed: sub.completed || false };
    });

    const newTask: Task = {
      id: generateId(),
      title: input.title,
      description: input.description,
      status: 'pending',
      priority: input.priority || 'medium',
      dueDate: input.dueDate,
      tags: input.tags || [],
      subtasks: formattedSubtasks,
      createdAt: now,
      updatedAt: now,
      source: input.source || 'manual',
      imageUrl: input.imageUrl,
      clarificationNeeded: input.clarificationNeeded ?? false,
      clarificationQuestion: input.clarificationQuestion,
    };

    const nextTasks = [newTask, ...tasks()];
    setTasks(nextTasks);
    persist(nextTasks);

    const uid = cloudUserId();
    if (uid) {
      syncTaskToCloud(newTask, uid).catch((err) => console.warn('Erro ao sincronizar nova tarefa:', err));
    }

    return newTask;
  }

  function updateTask(id: string, updates: UpdateTaskInput): Task | undefined {
    let updatedTask: Task | undefined;

    const nextTasks = tasks().map((task) => {
      if (task.id === id) {
        updatedTask = {
          ...task,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        return updatedTask;
      }
      return task;
    });

    if (updatedTask) {
      setTasks(nextTasks);
      persist(nextTasks);

      const uid = cloudUserId();
      if (uid) {
        syncTaskToCloud(updatedTask, uid).catch((err) => console.warn('Erro ao sincronizar atualização de tarefa:', err));
      }
    }

    return updatedTask;
  }

  function deleteTask(id: string): boolean {
    const initialLength = tasks().length;
    const nextTasks = tasks().filter((task) => task.id !== id);

    if (nextTasks.length !== initialLength) {
      setTasks(nextTasks);
      persist(nextTasks);

      const uid = cloudUserId();
      if (uid) {
        deleteTaskFromCloud(id).catch((err) => console.warn('Erro ao sincronizar exclusão de tarefa:', err));
      }
      return true;
    }

    return false;
  }

  function setTaskStatus(id: string, status: TaskStatus): Task | undefined {
    return updateTask(id, { status });
  }

  function toggleTaskStatus(id: string): Task | undefined {
    const current = tasks().find((t) => t.id === id);
    if (!current) return undefined;

    const nextStatus: TaskStatus = current.status === 'completed' ? 'pending' : 'completed';
    return setTaskStatus(id, nextStatus);
  }

  function addSubtask(taskId: string, title: string): Task | undefined {
    const task = tasks().find((t) => t.id === taskId);
    if (!task) return undefined;

    const newSubtask: Subtask = {
      id: generateId(),
      title,
      completed: false,
    };

    const subtasks = [...task.subtasks, newSubtask];
    const updated = { ...task, subtasks };
    const nextTasks = tasks().map((t) => (t.id === taskId ? updated : t));
    setTasks(nextTasks);
    persist(nextTasks);
    return updated;
  }

  function toggleSubtask(taskId: string, subtaskId: string): Task | undefined {
    const task = tasks().find((t) => t.id === taskId);
    if (!task) return undefined;

    const subtasks = task.subtasks.map((sub) =>
      sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
    );

    const updated = { ...task, subtasks };
    const nextTasks = tasks().map((t) => (t.id === taskId ? updated : t));
    setTasks(nextTasks);
    persist(nextTasks);
    return updated;
  }

  function deleteSubtask(taskId: string, subtaskId: string): Task | undefined {
    const task = tasks().find((t) => t.id === taskId);
    if (!task) return undefined;

    const subtasks = task.subtasks.filter((sub) => sub.id !== subtaskId);
    const updated = { ...task, subtasks };
    const nextTasks = tasks().map((t) => (t.id === taskId ? updated : t));
    setTasks(nextTasks);
    persist(nextTasks);
    return updated;
  }

  function handleRealtimeTaskChange(event: RealtimeTaskChangeEvent) {
    if (event.type === 'INSERT') {
      const current = tasks();
      if (!current.some((t) => t.id === event.task.id)) {
        const next = [event.task, ...current];
        setTasks(next);
        persist(next);
      }
    } else if (event.type === 'UPDATE') {
      const next = tasks().map((t) => (t.id === event.task.id ? event.task : t));
      setTasks(next);
      persist(next);
    } else if (event.type === 'DELETE') {
      const next = tasks().filter((t) => t.id !== event.taskId);
      setTasks(next);
      persist(next);
    }
  }

  async function initCloudSync(userId: string) {
    setCloudUserId(userId);

    // 1. Carrega tarefas existentes da nuvem e mescla com locais
    try {
      const { data: cloudTasks } = await fetchUserTasks(userId);
      if (cloudTasks && cloudTasks.length > 0) {
        const currentMap = new Map(tasks().map((t) => [t.id, t]));
        for (const ct of cloudTasks) {
          const local = currentMap.get(ct.id);
          if (!local || new Date(ct.updatedAt).getTime() >= new Date(local.updatedAt).getTime()) {
            currentMap.set(ct.id, ct);
          }
        }
        const merged = Array.from(currentMap.values());
        setTasks(merged);
        persist(merged);
      }
    } catch (e) {
      console.warn('Erro ao carregar tarefas da nuvem no initCloudSync:', e);
    }

    // 2. Se já tinha um canal ativo, desinscreve antes
    if (activeChannel) {
      await unsubscribeRealtimeTaskSubscription(activeChannel);
      activeChannel = null;
    }

    // 3. Inscreve no canal realtime
    activeChannel = setupRealtimeTaskSubscription(userId, {
      onInsert: (task) => handleRealtimeTaskChange({ type: 'INSERT', task }),
      onUpdate: (task) => handleRealtimeTaskChange({ type: 'UPDATE', task }),
      onDelete: (taskId) => handleRealtimeTaskChange({ type: 'DELETE', taskId }),
    });
  }

  async function stopCloudSync() {
    setCloudUserId(null);
    if (activeChannel) {
      await unsubscribeRealtimeTaskSubscription(activeChannel);
      activeChannel = null;
    }
  }

  function resolveClarification(id: string, answer: string): Task | undefined {
    const task = tasks().find((t) => t.id === id);
    if (!task) return undefined;

    const trimmed = answer.trim();
    const updatedDescription = task.description
      ? `${task.description}\n\n[Esclarecimento]: ${trimmed}`
      : `[Esclarecimento]: ${trimmed}`;

    return updateTask(id, {
      description: updatedDescription,
      clarificationNeeded: false,
    });
  }

  // Sinais Derivados (createMemo dentro de createRoot)
  const pendingTasks = createMemo(() => tasks().filter((t) => t.status === 'pending'));

  const completedTasks = createMemo(() => tasks().filter((t) => t.status === 'completed'));

  const archivedTasks = createMemo(() => tasks().filter((t) => t.status === 'archived'));

  const incompleteTasks = createMemo(() =>
    tasks().filter((t) => Boolean(t.clarificationNeeded) && t.status !== 'archived')
  );

  const todayTasks = createMemo(() => {
    const today = getTodayDateString();
    return tasks().filter((t) => t.dueDate === today);
  });

  const todayTasksSorted = createMemo(() => sortTasksByPriority(todayTasks()));

  const tasksByPriority = createMemo((): Record<TaskPriority, Task[]> => ({
    urgent: tasks().filter((t) => t.priority === 'urgent'),
    high: tasks().filter((t) => t.priority === 'high'),
    medium: tasks().filter((t) => t.priority === 'medium'),
    low: tasks().filter((t) => t.priority === 'low'),
  }));

  const pendingCount = createMemo(() => pendingTasks().length);

  const completedCount = createMemo(() => completedTasks().length);

  const incompleteCount = createMemo(() => incompleteTasks().length);

  return {
    tasks,
    setTasks,
    initTaskStore,
    clearTasks,
    addTask,
    updateTask,
    deleteTask,
    setTaskStatus,
    toggleTaskStatus,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    resolveClarification,
    handleRealtimeTaskChange,
    initCloudSync,
    stopCloudSync,
    pendingTasks,
    completedTasks,
    archivedTasks,
    incompleteTasks,
    todayTasks,
    todayTasksSorted,
    tasksByPriority,
    pendingCount,
    completedCount,
    incompleteCount,
  };
}

export const {
  tasks,
  setTasks,
  initTaskStore,
  clearTasks,
  addTask,
  updateTask,
  deleteTask,
  setTaskStatus,
  toggleTaskStatus,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  resolveClarification,
  handleRealtimeTaskChange,
  initCloudSync,
  stopCloudSync,
  pendingTasks,
  completedTasks,
  archivedTasks,
  incompleteTasks,
  todayTasks,
  todayTasksSorted,
  tasksByPriority,
  pendingCount,
  completedCount,
  incompleteCount,
} = createRoot(createTaskStore);
