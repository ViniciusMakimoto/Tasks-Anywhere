import { Task } from '../types/task';
import { getTodayDateString } from '../store/taskStore';

export interface NotificationSettings {
  enabled: boolean;
  leadHours: number;
}

const SETTINGS_KEY = 'tasksanywhere_notification_settings';

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  leadHours: 12,
};

export function hasNotificationPermission(): boolean {
  if (typeof globalThis.Notification === 'undefined') {
    return false;
  }
  return globalThis.Notification.permission === 'granted';
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof globalThis.Notification === 'undefined') {
    return 'denied';
  }
  return await globalThis.Notification.requestPermission();
}

export function calculateDueReminders(tasks: Task[]): Task[] {
  const today = getTodayDateString();

  return tasks.filter((task) => {
    if (task.status !== 'pending' || !task.dueDate) return false;
    return task.dueDate <= today;
  });
}

export function dispatchTaskReminders(tasks: Task[]): number {
  if (!hasNotificationPermission()) {
    return 0;
  }

  const dueTasks = calculateDueReminders(tasks);
  if (dueTasks.length === 0) {
    return 0;
  }

  const firstTask = dueTasks[0];
  const remaining = dueTasks.length - 1;
  const body =
    remaining > 0
      ? `"${firstTask.title}" e mais ${remaining} tarefa(s) precisam da sua atenção hoje.`
      : `Lembrete: "${firstTask.title}" está pronta para ser concluída hoje!`;

  new globalThis.Notification('TasksAnywhere • Lembretes', {
    body,
    icon: '/icon-192.png',
  });

  return dueTasks.length;
}

export function getNotificationSettings(): NotificationSettings {
  if (typeof window !== 'undefined' && window.localStorage) {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed.enabled === 'boolean') {
          return {
            enabled: parsed.enabled,
            leadHours: parsed.leadHours || DEFAULT_SETTINGS.leadHours,
          };
        }
      } catch (e) {
        console.error('Falha ao carregar configurações de notificação:', e);
      }
    }
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Falha ao salvar configurações de notificação:', e);
    }
  }
}
