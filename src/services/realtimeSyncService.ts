import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { fromDbTask, DbTask } from './taskSyncService';
import { Task } from '../types/task';

export interface RealtimeSyncCallbacks {
  onInsert: (task: Task) => void;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

/**
 * Conecta e escuta mudanças em tempo real na tabela 'tasks' do Supabase,
 * filtrando exclusivamente pelo ID do usuário autenticado.
 */
export function setupRealtimeTaskSubscription(
  userId: string,
  callbacks: RealtimeSyncCallbacks
): RealtimeChannel {
  const channelName = `tasks_${userId}`;

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;

        if (eventType === 'INSERT' && newRecord) {
          const task = fromDbTask(newRecord as DbTask);
          callbacks.onInsert(task);
        } else if (eventType === 'UPDATE' && newRecord) {
          const task = fromDbTask(newRecord as DbTask);
          callbacks.onUpdate(task);
        } else if (eventType === 'DELETE' && oldRecord && (oldRecord as any).id) {
          callbacks.onDelete((oldRecord as any).id);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[Realtime] Sincronização ativa para usuário ${userId}`);
      }
    });

  return channel;
}

/**
 * Encerra e remove o canal de sincronização Realtime.
 */
export async function unsubscribeRealtimeTaskSubscription(
  channel: RealtimeChannel | null
): Promise<void> {
  if (channel) {
    await supabase.removeChannel(channel);
  }
}
