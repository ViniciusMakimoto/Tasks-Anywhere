import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { TaskCard } from './TaskCard';
import { Task } from '../../types/task';

const mockTask: Task = {
  id: 'task-1',
  title: 'Implementar TaskCard component',
  description: 'Criar componente com checklist de subtarefas e visual moderno.',
  status: 'pending',
  priority: 'high',
  dueDate: '2026-10-10',
  tags: ['frontend', 'tdd'],
  subtasks: [
    { id: 'sub-1', title: 'Criar testes unitários', completed: true },
    { id: 'sub-2', title: 'Escrever componente SolidJS', completed: false },
  ],
  createdAt: '2026-10-01T12:00:00Z',
  updatedAt: '2026-10-01T12:00:00Z',
};

describe('TaskCard Component (TDD)', () => {
  it('renderiza título, prioridade, data de vencimento e tags da tarefa', () => {
    render(() => <TaskCard task={mockTask} />);

    expect(screen.getByText('Implementar TaskCard component')).toBeInTheDocument();
    expect(screen.getByText(/Alta/i)).toBeInTheDocument();
    expect(screen.getByText('2026-10-10')).toBeInTheDocument();
    expect(screen.getByText('frontend')).toBeInTheDocument();
    expect(screen.getByText('tdd')).toBeInTheDocument();
    expect(screen.getByText('1/2')).toBeInTheDocument(); // contador de subtarefas
  });

  it('chama onToggleStatus ao clicar no checkbox de status', async () => {
    const handleToggleStatus = vi.fn();
    render(() => <TaskCard task={mockTask} onToggleStatus={handleToggleStatus} />);

    const checkbox = screen.getByRole('checkbox', { name: /Implementar TaskCard component/i });
    expect(checkbox).not.toBeChecked();

    await fireEvent.click(checkbox);
    expect(handleToggleStatus).toHaveBeenCalledWith('task-1');
  });

  it('exibe estilo concluído e checkbox marcado quando status é completed', () => {
    const completedTask: Task = { ...mockTask, status: 'completed' };
    render(() => <TaskCard task={completedTask} />);

    const checkbox = screen.getByRole('checkbox', { name: /Implementar TaskCard component/i });
    expect(checkbox).toBeChecked();

    const titleEl = screen.getByText('Implementar TaskCard component');
    expect(titleEl.className).toContain('line-through');
  });

  it('permite expandir e recolher detalhes e checklist de subtarefas', async () => {
    render(() => <TaskCard task={mockTask} />);

    // Por padrão pode iniciar recolhido ou com botão para expandir
    const expandBtn = screen.getByRole('button', { name: /subtarefas|detalhes/i });
    await fireEvent.click(expandBtn);

    expect(screen.getByText('Criar testes unitários')).toBeInTheDocument();
    expect(screen.getByText('Escrever componente SolidJS')).toBeInTheDocument();
  });

  it('chama onToggleSubtask ao clicar no checkbox de uma subtarefa', async () => {
    const handleToggleSubtask = vi.fn();
    render(() => (
      <TaskCard
        task={mockTask}
        isExpanded={true}
        onToggleSubtask={handleToggleSubtask}
      />
    ));

    const subtaskCheckbox = screen.getByRole('checkbox', { name: /Escrever componente SolidJS/i });
    expect(subtaskCheckbox).not.toBeChecked();

    await fireEvent.click(subtaskCheckbox);
    expect(handleToggleSubtask).toHaveBeenCalledWith('task-1', 'sub-2');
  });

  it('permite adicionar uma nova subtarefa via formulário inline e dispara onAddSubtask', async () => {
    const handleAddSubtask = vi.fn();
    render(() => (
      <TaskCard
        task={mockTask}
        isExpanded={true}
        onAddSubtask={handleAddSubtask}
      />
    ));

    const input = screen.getByPlaceholderText(/Adicionar subtarefa/i);
    const addBtn = screen.getByRole('button', { name: /Adicionar subtarefa/i });

    await fireEvent.input(input, { target: { value: 'Nova subtarefa de teste' } });
    await fireEvent.click(addBtn);

    expect(handleAddSubtask).toHaveBeenCalledWith('task-1', 'Nova subtarefa de teste');
  });

  it('chama onDeleteSubtask ao clicar no botão de remover subtarefa', async () => {
    const handleDeleteSubtask = vi.fn();
    render(() => (
      <TaskCard
        task={mockTask}
        isExpanded={true}
        onDeleteSubtask={handleDeleteSubtask}
      />
    ));

    const deleteSubtaskBtn = screen.getByRole('button', { name: /Excluir subtarefa Criar testes unitários/i });
    await fireEvent.click(deleteSubtaskBtn);

    expect(handleDeleteSubtask).toHaveBeenCalledWith('task-1', 'sub-1');
  });

  it('chama onDelete ao clicar no botão de exclusão da tarefa', async () => {
    const handleDelete = vi.fn();
    render(() => <TaskCard task={mockTask} onDelete={handleDelete} />);

    const deleteBtn = screen.getByRole('button', { name: /Excluir tarefa Implementar TaskCard component/i });
    await fireEvent.click(deleteBtn);

    expect(handleDelete).toHaveBeenCalledWith('task-1');
  });
});
