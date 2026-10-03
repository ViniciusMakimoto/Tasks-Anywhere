import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { StickyWidget } from './StickyWidget';
import { Task } from '../../types/task';

const mockTasks: Task[] = [
  {
    id: 'sticky-1',
    title: 'Revisar pull request',
    status: 'pending',
    priority: 'urgent',
    dueDate: '2026-10-03',
    tags: ['dev'],
    subtasks: [],
    createdAt: '2026-10-01T12:00:00Z',
    updatedAt: '2026-10-01T12:00:00Z',
  },
  {
    id: 'sticky-2',
    title: 'Enviar e-mail para cliente',
    status: 'completed',
    priority: 'medium',
    tags: ['work'],
    subtasks: [],
    createdAt: '2026-10-01T12:00:00Z',
    updatedAt: '2026-10-01T12:00:00Z',
  },
];

describe('StickyWidget Component (TDD - Task 2.3)', () => {
  it('renderiza o cabeçalho do widget com título e contador de tarefas pendentes', () => {
    render(() => <StickyWidget tasks={mockTasks} />);

    expect(screen.getByText(/Sticky Note/i)).toBeInTheDocument();
    expect(screen.getByText(/1 pendente/i)).toBeInTheDocument();
  });

  it('renderiza a lista de tarefas e permite alternar status pelo checkbox', async () => {
    const handleToggleStatus = vi.fn();
    render(() => <StickyWidget tasks={mockTasks} onToggleStatus={handleToggleStatus} />);

    expect(screen.getByText('Revisar pull request')).toBeInTheDocument();
    expect(screen.getByText('Enviar e-mail para cliente')).toBeInTheDocument();

    const checkbox = screen.getByRole('checkbox', { name: /Revisar pull request/i });
    expect(checkbox).not.toBeChecked();

    await fireEvent.click(checkbox);
    expect(handleToggleStatus).toHaveBeenCalledWith('sticky-1');
  });

  it('permite alternar entre modo compacto e expandido', async () => {
    const handleToggleMode = vi.fn();
    render(() => <StickyWidget tasks={mockTasks} onToggleMode={handleToggleMode} isExpandedMode={false} />);

    const toggleBtn = screen.getByRole('button', { name: /Alternar para modo expandido|Expandir tela/i });
    await fireEvent.click(toggleBtn);

    expect(handleToggleMode).toHaveBeenCalled();
  });

  it('permite adicionar uma tarefa rápida digitando e enviando pelo formulário', async () => {
    const handleAddTask = vi.fn();
    render(() => <StickyWidget tasks={mockTasks} onAddTask={handleAddTask} />);

    const input = screen.getByPlaceholderText(/Adicionar nota rápida/i);
    await fireEvent.input(input, { target: { value: 'Comprar café na volta' } });
    await fireEvent.submit(input.closest('form')!);

    expect(handleAddTask).toHaveBeenCalledWith('Comprar café na volta');
  });

  it('permite excluir uma tarefa pelo botão de exclusão', async () => {
    const handleDelete = vi.fn();
    render(() => <StickyWidget tasks={mockTasks} onDelete={handleDelete} />);

    const deleteBtn = screen.getByRole('button', { name: /Excluir nota Revisar pull request/i });
    await fireEvent.click(deleteBtn);

    expect(handleDelete).toHaveBeenCalledWith('sticky-1');
  });

  it('exibe mensagem quando não há tarefas pendentes', () => {
    render(() => <StickyWidget tasks={[]} />);

    expect(screen.getByText(/Nenhuma tarefa/i)).toBeInTheDocument();
  });
});
