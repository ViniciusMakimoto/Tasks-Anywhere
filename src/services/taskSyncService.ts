import { supabase } from '../lib/supabase';
import { Task, TaskPriority, TaskStatus, Subtask } from '../types/task';

export interface DbTask {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  tags: string[];
  subtasks: Subtask[];
  source: 'manual' | 'audio' | 'image' | 'chat';
  image_url?: string;
  clarification_needed?: boolean;
  clarification_question?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Converte um objeto Task (camelCase) do frontend para a estrutura DbTask (snake_case) do PostgreSQL.
 */
export function toDbTask(task: Task, userId: string): DbTask {
  return {
    id: task.id,
    user_id: userId,
    title: task.title,
    description: task.description || undefined,
    status: task.status,
    priority: task.priority,
    due_date: task.dueDate || undefined,
    tags: task.tags || [],
    subtasks: task.subtasks || [],
    source: task.source || 'manual',
    image_url: task.imageUrl || undefined,
    clarification_needed: task.clarificationNeeded,
    clarification_question: task.clarificationQuestion || undefined,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
  };
}

/**
 * Converte um registro DbTask (snake_case) do PostgreSQL para a interface Task (camelCase) do SolidJS.
 */
export function fromDbTask(row: DbTask): Task {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description || undefined,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date || undefined,
    tags: row.tags || [],
    subtasks: (row.subtasks || []) as Subtask[],
    source: row.source || 'manual',
    imageUrl: row.image_url || undefined,
    clarificationNeeded: row.clarification_needed,
    clarificationQuestion: row.clarification_question || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Busca todas as tarefas do usuário autenticado no Supabase.
 */
export async function fetchUserTasks(userId: string): Promise<{ data: Task[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    const tasks = (data || []).map((row: DbTask) => fromDbTask(row));
    return { data: tasks, error: null };
  } catch (err: any) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Salva ou atualiza uma tarefa no Supabase (Upsert).
 */
export async function syncTaskToCloud(task: Task, userId: string): Promise<{ error: Error | null }> {
  try {
    const dbPayload = toDbTask(task, userId);
    const { error } = await supabase.from('tasks').upsert(dbPayload);

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err: any) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Remove uma tarefa da nuvem no Supabase.
 */
export async function deleteTaskFromCloud(taskId: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err: any) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}
