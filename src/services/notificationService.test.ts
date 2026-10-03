import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  hasNotificationPermission,
  requestNotificationPermission,
  calculateDueReminders,
  dispatchTaskReminders,
  getNotificationSettings,
  saveNotificationSettings,
} from './notificationService';
import { Task } from '../types/task';

describe('NotificationService (TDD - Task 2.4)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('1. Permissões de Notificação', () => {
    it('hasNotificationPermission deve retornar false quando a permissão for default ou denied', () => {
      // @ts-expect-error Mocking Notification
      globalThis.Notification = {
        permission: 'default',
        requestPermission: vi.fn(),
      };
      expect(hasNotificationPermission()).toBe(false);

      (globalThis.Notification as unknown as { permission: string }).permission = 'denied';
      expect(hasNotificationPermission()).toBe(false);
    });

    it('hasNotificationPermission deve retornar true quando a permissão for granted', () => {
      // @ts-expect-error Mocking Notification
      globalThis.Notification = {
        permission: 'granted',
        requestPermission: vi.fn(),
      };
      expect(hasNotificationPermission()).toBe(true);
    });

    it('requestNotificationPermission deve chamar requestPermission nativo e atualizar status', async () => {
      const mockRequest = vi.fn().mockResolvedValue('granted');
      // @ts-expect-error Mocking Notification
      globalThis.Notification = {
        permission: 'default',
        requestPermission: mockRequest,
      };

      const result = await requestNotificationPermission();
      expect(mockRequest).toHaveBeenCalled();
      expect(result).toBe('granted');
    });
  });

  describe('2. Cálculo de Lembretes de Tarefas', () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    const sampleTasks: Task[] = [
      {
        id: 't-1',
        title: 'Tarefa Atrasada',
        status: 'pending',
        priority: 'urgent',
        dueDate: yesterday,
        tags: [],
        subtasks: [],
        createdAt: '2026-10-01T00:00:00Z',
        updatedAt: '2026-10-01T00:00:00Z',
      },
      {
        id: 't-2',
        title: 'Tarefa de Hoje',
        status: 'pending',
        priority: 'high',
        dueDate: today,
        tags: [],
        subtasks: [],
        createdAt: '2026-10-01T00:00:00Z',
        updatedAt: '2026-10-01T00:00:00Z',
      },
      {
        id: 't-3',
        title: 'Tarefa Futura',
        status: 'pending',
        priority: 'medium',
        dueDate: nextWeek,
        tags: [],
        subtasks: [],
        createdAt: '2026-10-01T00:00:00Z',
        updatedAt: '2026-10-01T00:00:00Z',
      },
      {
        id: 't-4',
        title: 'Tarefa de Hoje Concluída',
        status: 'completed',
        priority: 'high',
        dueDate: today,
        tags: [],
        subtasks: [],
        createdAt: '2026-10-01T00:00:00Z',
        updatedAt: '2026-10-01T00:00:00Z',
      },
      {
        id: 't-5',
        title: 'Sem Data',
        status: 'pending',
        priority: 'low',
        tags: [],
        subtasks: [],
        createdAt: '2026-10-01T00:00:00Z',
        updatedAt: '2026-10-01T00:00:00Z',
      },
    ];

    it('calculateDueReminders deve filtrar apenas tarefas pendentes que vencem hoje ou estão atrasadas', () => {
      const dueReminders = calculateDueReminders(sampleTasks);
      const titles = dueReminders.map((t) => t.title);

      expect(titles).toContain('Tarefa Atrasada');
      expect(titles).toContain('Tarefa de Hoje');
      expect(titles).not.toContain('Tarefa Futura');
      expect(titles).not.toContain('Tarefa de Hoje Concluída');
      expect(titles).not.toContain('Sem Data');
    });
  });

  describe('3. Disparo de Notificações', () => {
    it('não deve disparar notificação se a permissão não for granted', () => {
      const mockNotificationConstructor = vi.fn();
      // @ts-expect-error Mocking Notification
      globalThis.Notification = mockNotificationConstructor;
      (globalThis.Notification as unknown as { permission: string }).permission = 'denied';

      const count = dispatchTaskReminders([
        {
          id: '1',
          title: 'Urgente',
          status: 'pending',
          priority: 'urgent',
          dueDate: new Date().toISOString().split('T')[0],
          tags: [],
          subtasks: [],
          createdAt: '2026-10-01T00:00:00Z',
          updatedAt: '2026-10-01T00:00:00Z',
        },
      ]);

      expect(count).toBe(0);
      expect(mockNotificationConstructor).not.toHaveBeenCalled();
    });

    it('deve disparar notificação com resumo quando houver tarefas com prazo e permissão granted', () => {
      const mockNotificationConstructor = vi.fn();
      // @ts-expect-error Mocking Notification
      globalThis.Notification = mockNotificationConstructor;
      (globalThis.Notification as unknown as { permission: string }).permission = 'granted';

      const count = dispatchTaskReminders([
        {
          id: '1',
          title: 'Entrega de Projeto',
          status: 'pending',
          priority: 'urgent',
          dueDate: new Date().toISOString().split('T')[0],
          tags: [],
          subtasks: [],
          createdAt: '2026-10-01T00:00:00Z',
          updatedAt: '2026-10-01T00:00:00Z',
        },
      ]);

      expect(count).toBe(1);
      expect(mockNotificationConstructor).toHaveBeenCalledWith(
        expect.stringContaining('TasksAnywhere'),
        expect.objectContaining({
          body: expect.stringContaining('Entrega de Projeto'),
        })
      );
    });
  });

  describe('4. Configurações de Lembrete', () => {
    it('deve retornar valores padrão quando não houver preferências salvas', () => {
      const settings = getNotificationSettings();
      expect(settings.enabled).toBe(false);
      expect(settings.leadHours).toBe(12);
    });

    it('deve salvar e recuperar configurações do localStorage', () => {
      saveNotificationSettings({ enabled: true, leadHours: 24 });
      const settings = getNotificationSettings();
      expect(settings.enabled).toBe(true);
      expect(settings.leadHours).toBe(24);
    });
  });
});
