import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { TaskList } from './TaskList';
import { Task } from '../../types/task';

const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Primeira tarefa',
    status: 'pending',
    priority: 'medium',
    tags: ['tag1'],
    subtasks: [],
    createdAt: '2026-10-01T12:00:00Z',
    updatedAt: '2026-10-01T12:00:00Z',
  },
  {
    id: 'task-2',
    title: 'Segunda tarefa',
    status: 'completed',
    priority: 'urgent',
    tags: ['tag2'],
    subtasks: [],
    createdAt: '2026-10-01T12:00:00Z',
    updatedAt: '2026-10-01T12:00:00Z',
  },
];

describe('TaskList Component (TDD)', () => {
  it('renderiza mensagem de lista vazia quando não há tarefas', () => {
    render(() => <TaskList tasks={[]} emptyMessage="Nenhuma tarefa encontrada" />);

    expect(screen.getByText('Nenhuma tarefa encontrada')).toBeInTheDocument();
  });

  it('renderiza lista de tarefas corretamente', () => {
    render(() => <TaskList tasks={mockTasks} />);

    expect(screen.getByText('Primeira tarefa')).toBeInTheDocument();
    expect(screen.getByText('Segunda tarefa')).toBeInTheDocument();
  });

  it('propaga evento de toggleStatus para o handler correspondente', async () => {
    const handleToggleStatus = vi.fn();
    render(() => <TaskList tasks={mockTasks} onToggleStatus={handleToggleStatus} />);

    const checkbox = screen.getByRole('checkbox', { name: /Primeira tarefa/i });
    await fireEvent.click(checkbox);

    expect(handleToggleStatus).toHaveBeenCalledWith('task-1');
  });

  it('propaga evento de exclusão para o handler correspondente', async () => {
    const handleDelete = vi.fn();
    render(() => <TaskList tasks={mockTasks} onDelete={handleDelete} />);

    const deleteBtn = screen.getByRole('button', { name: /Excluir tarefa Primeira tarefa/i });
    await fireEvent.click(deleteBtn);

    expect(handleDelete).toHaveBeenCalledWith('task-1');
  });
});
