import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { TaskFilters } from './TaskFilters';

describe('TaskFilters Component (TDD)', () => {
  it('renderiza os botões de filtro de status principais', () => {
    render(() => (
      <TaskFilters
        statusFilter="all"
        priorityFilter="all"
        counts={{ total: 10, pending: 6, completed: 4, today: 3 }}
      />
    ));

    expect(screen.getByRole('button', { name: /Todas \(10\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pendentes \(6\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Concluídas \(4\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Hoje \(3\)/i })).toBeInTheDocument();
  });

  it('chama onStatusChange ao clicar em uma aba de status', async () => {
    const handleStatusChange = vi.fn();
    render(() => (
      <TaskFilters
        statusFilter="all"
        priorityFilter="all"
        counts={{ total: 10, pending: 6, completed: 4, today: 3 }}
        onStatusChange={handleStatusChange}
      />
    ));

    const pendingBtn = screen.getByRole('button', { name: /Pendentes/i });
    await fireEvent.click(pendingBtn);

    expect(handleStatusChange).toHaveBeenCalledWith('pending');
  });

  it('renderiza os seletores de prioridade e dispara onPriorityChange', async () => {
    const handlePriorityChange = vi.fn();
    render(() => (
      <TaskFilters
        statusFilter="all"
        priorityFilter="all"
        counts={{ total: 10, pending: 6, completed: 4, today: 3 }}
        onPriorityChange={handlePriorityChange}
      />
    ));

    const urgentBtn = screen.getByRole('button', { name: /Urgente/i });
    await fireEvent.click(urgentBtn);

    expect(handlePriorityChange).toHaveBeenCalledWith('urgent');
  });

  it('permite alternar ordenação por urgência vs mais recentes', async () => {
    const handleSortChange = vi.fn();
    render(() => (
      <TaskFilters
        statusFilter="all"
        priorityFilter="all"
        sortBy="recent"
        counts={{ total: 10, pending: 6, completed: 4, today: 3 }}
        onSortChange={handleSortChange}
      />
    ));

    const sortBtn = screen.getByRole('button', { name: /Ordenar por urgência|Ordenar por data/i });
    await fireEvent.click(sortBtn);

    expect(handleSortChange).toHaveBeenCalled();
  });
});
