import { describe, it, expect, beforeEach } from 'vitest';
import {
  tasks,
  addTask,
  updateTask,
  deleteTask,
  setTaskStatus,
  toggleTaskStatus,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  pendingTasks,
  completedTasks,
  archivedTasks,
  todayTasks,
  tasksByPriority,
  pendingCount,
  completedCount,
  initTaskStore,
  clearTasks,
} from './taskStore';

describe('TaskStore (SolidJS Signals & Memos)', () => {
  beforeEach(() => {
    localStorage.clear();
    clearTasks();
  });

  describe('1. Criação de tarefas com defaults', () => {
    it('deve criar uma nova tarefa com defaults (status: pending, priority: medium)', () => {
      const task = addTask({ title: 'Comprar café' });

      expect(task).toBeDefined();
      expect(task.id).toBeTruthy();
      expect(task.title).toBe('Comprar café');
      expect(task.status).toBe('pending');
      expect(task.priority).toBe('medium');
      expect(task.tags).toEqual([]);
      expect(task.subtasks).toEqual([]);
      expect(task.createdAt).toBeTruthy();
      expect(task.updatedAt).toBeTruthy();

      expect(tasks()).toHaveLength(1);
      expect(tasks()[0]).toEqual(task);
    });

    it('deve aceitar prioridade, descrição, tags e data de vencimento personalizadas', () => {
      const task = addTask({
        title: 'Entregar relatório',
        description: 'Relatório financeiro trimestral',
        priority: 'urgent',
        dueDate: '2026-10-10',
        tags: ['trabalho', 'finanças'],
        source: 'audio',
      });

      expect(task.priority).toBe('urgent');
      expect(task.description).toBe('Relatório financeiro trimestral');
      expect(task.dueDate).toBe('2026-10-10');
      expect(task.tags).toEqual(['trabalho', 'finanças']);
      expect(task.source).toBe('audio');
    });
  });

  describe('2. Atualização de status', () => {
    it('deve atualizar o status para completed e arquivar com setTaskStatus', () => {
      const task = addTask({ title: 'Estudar SolidJS' });

      const updated = setTaskStatus(task.id, 'completed');
      expect(updated?.status).toBe('completed');
      expect(tasks()[0].status).toBe('completed');

      const archived = setTaskStatus(task.id, 'archived');
      expect(archived?.status).toBe('archived');
      expect(tasks()[0].status).toBe('archived');
    });

    it('deve alternar status entre pending e completed com toggleTaskStatus', () => {
      const task = addTask({ title: 'Fazer caminhada' });
      expect(task.status).toBe('pending');

      toggleTaskStatus(task.id);
      expect(tasks()[0].status).toBe('completed');

      toggleTaskStatus(task.id);
      expect(tasks()[0].status).toBe('pending');
    });
  });

  describe('3. Edição e Exclusão', () => {
    it('deve editar campos específicos da tarefa com updateTask', () => {
      const task = addTask({ title: 'Título original', tags: ['antiga'] });

      const updated = updateTask(task.id, {
        title: 'Título atualizado',
        description: 'Nova descrição',
        tags: ['nova'],
        priority: 'high',
      });

      expect(updated?.title).toBe('Título atualizado');
      expect(updated?.description).toBe('Nova descrição');
      expect(updated?.tags).toEqual(['nova']);
      expect(updated?.priority).toBe('high');
      expect(tasks()[0].title).toBe('Título atualizado');
    });

    it('deve excluir uma tarefa existente e retornar true', () => {
      const task = addTask({ title: 'Tarefa para deletar' });
      expect(tasks()).toHaveLength(1);

      const deleted = deleteTask(task.id);
      expect(deleted).toBe(true);
      expect(tasks()).toHaveLength(0);
    });

    it('deve retornar false ao tentar deletar uma tarefa inexistente', () => {
      const deleted = deleteTask('id-inexistente');
      expect(deleted).toBe(false);
    });
  });

  describe('4. Sinais Derivados (createMemo)', () => {
    it('deve computar pendingCount e completedCount reativamente', () => {
      expect(pendingCount()).toBe(0);
      expect(completedCount()).toBe(0);

      const t1 = addTask({ title: 'Task 1' });
      addTask({ title: 'Task 2' });

      expect(pendingCount()).toBe(2);
      expect(completedCount()).toBe(0);

      toggleTaskStatus(t1.id);
      expect(pendingCount()).toBe(1);
      expect(completedCount()).toBe(1);
    });

    it('deve filtrar pendingTasks, completedTasks e archivedTasks', () => {
      const t1 = addTask({ title: 'Task 1' });
      const t2 = addTask({ title: 'Task 2' });
      const t3 = addTask({ title: 'Task 3' });

      setTaskStatus(t2.id, 'completed');
      setTaskStatus(t3.id, 'archived');

      expect(pendingTasks()).toHaveLength(1);
      expect(pendingTasks()[0].id).toBe(t1.id);

      expect(completedTasks()).toHaveLength(1);
      expect(completedTasks()[0].id).toBe(t2.id);

      expect(archivedTasks()).toHaveLength(1);
      expect(archivedTasks()[0].id).toBe(t3.id);
    });

    it('deve filtrar todayTasks com base na data de hoje', () => {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      const tToday = addTask({ title: 'Hoje', dueDate: today });
      addTask({ title: 'Amanhã', dueDate: tomorrow });
      addTask({ title: 'Sem data' });

      const todays = todayTasks();
      expect(todays).toHaveLength(1);
      expect(todays[0].id).toBe(tToday.id);
    });

    it('deve agrupar tarefas por prioridade com tasksByPriority', () => {
      addTask({ title: 'Baixa', priority: 'low' });
      addTask({ title: 'Média 1', priority: 'medium' });
      addTask({ title: 'Média 2', priority: 'medium' });
      addTask({ title: 'Alta', priority: 'high' });
      addTask({ title: 'Urgente', priority: 'urgent' });

      const grouped = tasksByPriority();
      expect(grouped.low).toHaveLength(1);
      expect(grouped.medium).toHaveLength(2);
      expect(grouped.high).toHaveLength(1);
      expect(grouped.urgent).toHaveLength(1);
    });
  });

  describe('5. Subtarefas (Checklist)', () => {
    it('deve adicionar, alternar e remover subtarefas', () => {
      const task = addTask({ title: 'Comprar mantimentos' });

      const withSubtask = addSubtask(task.id, 'Comprar leite');
      expect(withSubtask?.subtasks).toHaveLength(1);
      expect(withSubtask?.subtasks[0].title).toBe('Comprar leite');
      expect(withSubtask?.subtasks[0].completed).toBe(false);

      const subtaskId = withSubtask!.subtasks[0].id;
      const toggled = toggleSubtask(task.id, subtaskId);
      expect(toggled?.subtasks[0].completed).toBe(true);

      const removed = deleteSubtask(task.id, subtaskId);
      expect(removed?.subtasks).toHaveLength(0);
    });
  });

  describe('6. Persistência Local (LocalStorage)', () => {
    it('deve salvar tarefas no localStorage a cada modificação', () => {
      const task = addTask({ title: 'Persistente' });
      const raw = localStorage.getItem('tasksanywhere_tasks');
      expect(raw).toBeTruthy();

      const parsed = JSON.parse(raw!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe(task.id);
    });

    it('deve carregar tarefas do localStorage ao inicializar o store', () => {
      const fakeTasks = [
        {
          id: 'task-123',
          title: 'Carregado do cache',
          status: 'pending',
          priority: 'medium',
          tags: [],
          subtasks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem('tasksanywhere_tasks', JSON.stringify(fakeTasks));

      initTaskStore();

      expect(tasks()).toHaveLength(1);
      expect(tasks()[0].title).toBe('Carregado do cache');
      expect(tasks()[0].id).toBe('task-123');
    });
  });
});
