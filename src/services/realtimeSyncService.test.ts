import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  setupRealtimeTaskSubscription,
  unsubscribeRealtimeTaskSubscription,
} from './realtimeSyncService';
import { DbTask } from './taskSyncService';

// Mock do supabase client
vi.mock('../lib/supabase', () => {
  return {
    supabase: {
      channel: vi.fn(),
      removeChannel: vi.fn().mockResolvedValue('ok'),
    },
  };
});

import { supabase } from '../lib/supabase';

describe('RealtimeSyncService (TDD - Task 4.4)', () => {
  let mockChannel: any;
  let eventHandlers: Record<string, (payload: any) => void> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    eventHandlers = {};

    mockChannel = {
      on: vi.fn((_type: string, filter: any, callback: (payload: any) => void) => {
        const eventName = filter.event || 'all';
        eventHandlers[eventName] = callback;
        return mockChannel;
      }),
      subscribe: vi.fn((callback?: (status: string) => void) => {
        if (callback) callback('SUBSCRIBED');
        return mockChannel;
      }),
      unsubscribe: vi.fn().mockResolvedValue('ok'),
    };

    vi.mocked(supabase.channel).mockReturnValue(mockChannel);
  });

  it('deve criar canal postgres_changes filtrado pelo user_id', () => {
    const channel = setupRealtimeTaskSubscription('user-123', {
      onInsert: vi.fn(),
      onUpdate: vi.fn(),
      onDelete: vi.fn(),
    });

    expect(supabase.channel).toHaveBeenCalledWith('tasks_user-123');
    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: 'user_id=eq.user-123',
      }),
      expect.any(Function)
    );
    expect(mockChannel.subscribe).toHaveBeenCalled();
    expect(channel).toBe(mockChannel);
  });

  it('deve acionar callback onInsert ao receber evento INSERT do PostgreSQL', () => {
    const onInsert = vi.fn();
    setupRealtimeTaskSubscription('user-123', {
      onInsert,
      onUpdate: vi.fn(),
      onDelete: vi.fn(),
    });

    const dbRow: DbTask = {
      id: 'task-realtime-1',
      user_id: 'user-123',
      title: 'Tarefa criada no celular',
      status: 'pending',
      priority: 'high',
      tags: ['celular'],
      subtasks: [],
      source: 'chat',
      created_at: '2026-10-03T18:00:00Z',
      updated_at: '2026-10-03T18:00:00Z',
    };

    // Dispara o callback capturado
    eventHandlers['*']({
      eventType: 'INSERT',
      new: dbRow,
      old: {},
    });

    expect(onInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'task-realtime-1',
        title: 'Tarefa criada no celular',
        priority: 'high',
      })
    );
  });

  it('deve acionar callback onUpdate ao receber evento UPDATE do PostgreSQL', () => {
    const onUpdate = vi.fn();
    setupRealtimeTaskSubscription('user-123', {
      onInsert: vi.fn(),
      onUpdate,
      onDelete: vi.fn(),
    });

    const updatedRow: DbTask = {
      id: 'task-realtime-1',
      user_id: 'user-123',
      title: 'Tarefa atualizada no PC',
      status: 'completed',
      priority: 'urgent',
      tags: ['celular'],
      subtasks: [],
      source: 'chat',
      created_at: '2026-10-03T18:00:00Z',
      updated_at: '2026-10-03T18:05:00Z',
    };

    eventHandlers['*']({
      eventType: 'UPDATE',
      new: updatedRow,
      old: {},
    });

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'task-realtime-1',
        status: 'completed',
        priority: 'urgent',
      })
    );
  });

  it('deve acionar callback onDelete ao receber evento DELETE do PostgreSQL', () => {
    const onDelete = vi.fn();
    setupRealtimeTaskSubscription('user-123', {
      onInsert: vi.fn(),
      onUpdate: vi.fn(),
      onDelete,
    });

    eventHandlers['*']({
      eventType: 'DELETE',
      new: {},
      old: { id: 'task-deleted-id' },
    });

    expect(onDelete).toHaveBeenCalledWith('task-deleted-id');
  });

  it('deve remover e encerrar o canal ao invocar unsubscribeRealtimeTaskSubscription', async () => {
    const channel = setupRealtimeTaskSubscription('user-123', {
      onInsert: vi.fn(),
      onUpdate: vi.fn(),
      onDelete: vi.fn(),
    });

    await unsubscribeRealtimeTaskSubscription(channel);

    expect(supabase.removeChannel).toHaveBeenCalledWith(channel);
  });
});
