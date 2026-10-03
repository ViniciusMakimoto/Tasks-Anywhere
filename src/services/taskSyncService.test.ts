import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  toDbTask,
  fromDbTask,
  fetchUserTasks,
  syncTaskToCloud,
  deleteTaskFromCloud,
  DbTask,
} from './taskSyncService';
import { Task } from '../types/task';

// Mock do supabase client
vi.mock('../lib/supabase', () => {
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockOrder = vi.fn();
  const mockUpsert = vi.fn();
  const mockDelete = vi.fn();

  return {
    supabase: {
      from: vi.fn(() => ({
        select: mockSelect,
        upsert: mockUpsert,
        delete: mockDelete,
      })),
      _mocks: { mockSelect, mockEq, mockOrder, mockUpsert, mockDelete },
    },
  };
});

import { supabase } from '../lib/supabase';

describe('TaskSyncService (TDD - Task 4.2)', () => {
  const sampleTask: Task = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Migração Supabase',
    description: 'Criar tabelas e RLS',
    status: 'pending',
    priority: 'high',
    dueDate: '2026-10-05',
    tags: ['supabase', 'backend'],
    subtasks: [{ id: 'sub-1', title: 'Subtarefa', completed: false }],
    createdAt: '2026-10-01T12:00:00Z',
    updatedAt: '2026-10-01T12:00:00Z',
    userId: 'user-abc',
    source: 'chat',
    imageUrl: 'https://example.com/img.png',
  };

  const sampleDbRow: DbTask = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    user_id: 'user-abc',
    title: 'Migração Supabase',
    description: 'Criar tabelas e RLS',
    status: 'pending',
    priority: 'high',
    due_date: '2026-10-05',
    tags: ['supabase', 'backend'],
    subtasks: [{ id: 'sub-1', title: 'Subtarefa', completed: false }],
    created_at: '2026-10-01T12:00:00Z',
    updated_at: '2026-10-01T12:00:00Z',
    source: 'chat',
    image_url: 'https://example.com/img.png',
  };

  describe('1. Serialização Bidirecional (toDbTask & fromDbTask)', () => {
    it('deve converter Task para DbTask com mapeamento snake_case correto', () => {
      const dbTask = toDbTask(sampleTask, 'user-abc');

      expect(dbTask.id).toBe(sampleTask.id);
      expect(dbTask.user_id).toBe('user-abc');
      expect(dbTask.due_date).toBe(sampleTask.dueDate);
      expect(dbTask.image_url).toBe(sampleTask.imageUrl);
      expect(dbTask.created_at).toBe(sampleTask.createdAt);
      expect(dbTask.updated_at).toBe(sampleTask.updatedAt);
    });

    it('deve converter DbTask retornado do banco para Task do frontend em camelCase', () => {
      const task = fromDbTask(sampleDbRow);

      expect(task.id).toBe(sampleDbRow.id);
      expect(task.userId).toBe(sampleDbRow.user_id);
      expect(task.dueDate).toBe(sampleDbRow.due_date);
      expect(task.imageUrl).toBe(sampleDbRow.image_url);
      expect(task.createdAt).toBe(sampleDbRow.created_at);
      expect(task.updatedAt).toBe(sampleDbRow.updated_at);
    });
  });

  describe('2. Operações de Sincronização na Nuvem', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('deve consultar tarefas do usuário ordenadas por updated_at descendente', async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: [sampleDbRow], error: null });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      const { data, error } = await fetchUserTasks('user-abc');

      expect(supabase.from).toHaveBeenCalledWith('tasks');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-abc');
      expect(mockOrder).toHaveBeenCalledWith('updated_at', { ascending: false });
      expect(data).toHaveLength(1);
      expect(data![0].title).toBe('Migração Supabase');
      expect(error).toBeNull();
    });

    it('deve realizar upsert da tarefa no Supabase', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(supabase.from).mockReturnValue({
        upsert: mockUpsert,
      } as any);

      const { error } = await syncTaskToCloud(sampleTask, 'user-abc');

      expect(supabase.from).toHaveBeenCalledWith('tasks');
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: sampleTask.id,
          user_id: 'user-abc',
        })
      );
      expect(error).toBeNull();
    });

    it('deve excluir tarefa no Supabase pelo id', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
      } as any);

      const { error } = await deleteTaskFromCloud(sampleTask.id);

      expect(supabase.from).toHaveBeenCalledWith('tasks');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', sampleTask.id);
      expect(error).toBeNull();
    });
  });
});
