import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { TodayFocus } from './TodayFocus';
import { Task } from '../../types/task';

const today = new Date().toISOString().split('T')[0];

const mockTodayTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Finalizar relatório diário',
    status: 'pending',
    priority: 'urgent',
    dueDate: today,
    tags: ['trabalho'],
    subtasks: [],
    createdAt: '2026-10-01T12:00:00Z',
    updatedAt: '2026-10-01T12:00:00Z',
  },
  {
    id: 'task-2',
    title: 'Responder e-mails',
    status: 'completed',
    priority: 'medium',
    dueDate: today,
    tags: ['comunicação'],
    subtasks: [],
    createdAt: '2026-10-01T12:00:00Z',
    updatedAt: '2026-10-01T12:00:00Z',
  },
];

describe('TodayFocus Component (TDD)', () => {
  it('renderiza o cabeçalho de foco do dia e taxa de conclusão', () => {
    render(() => <TodayFocus tasks={mockTodayTasks} />);

    expect(screen.getByText(/Foco de Hoje/i)).toBeInTheDocument();
    expect(screen.getByText(/1 de 2 concluídas/i)).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('renderiza as tarefas de hoje ordenadas', () => {
    render(() => <TodayFocus tasks={mockTodayTasks} />);

    expect(screen.getByText('Finalizar relatório diário')).toBeInTheDocument();
    expect(screen.getByText('Responder e-mails')).toBeInTheDocument();
  });

  it('exibe estado de celebração quando todas as tarefas de hoje estiverem concluídas', () => {
    const completedList: Task[] = mockTodayTasks.map((t) => ({ ...t, status: 'completed' }));
    render(() => <TodayFocus tasks={completedList} />);

    expect(screen.getByText(/Tudo pronto por hoje!/i)).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('exibe mensagem amigável quando não houver tarefas para hoje', () => {
    render(() => <TodayFocus tasks={[]} />);

    expect(screen.getByText(/Nenhuma tarefa agendada para hoje/i)).toBeInTheDocument();
  });

  it('propaga evento de alternância de status da tarefa', async () => {
    const handleToggle = vi.fn();
    render(() => <TodayFocus tasks={mockTodayTasks} onToggleStatus={handleToggle} />);

    const checkbox = screen.getByRole('checkbox', { name: /Finalizar relatório diário/i });
    await fireEvent.click(checkbox);

    expect(handleToggle).toHaveBeenCalledWith('task-1');
  });
});
