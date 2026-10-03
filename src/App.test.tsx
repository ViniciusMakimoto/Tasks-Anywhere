import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, beforeEach } from 'vitest';
import App from './App';
import { clearTasks } from './store/taskStore';

describe('App Main UI & Integration Test (TDD)', () => {
  beforeEach(() => {
    localStorage.clear();
    clearTasks();
    document.documentElement.className = '';
  });

  it('renderiza o cabeçalho do TasksAnywhere e alternador de tema', () => {
    render(() => <App />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/TasksAnywhere/i);

    const themeBtn = screen.getByRole('button', { name: /Alternar para tema/i });
    expect(themeBtn).toBeInTheDocument();
  });

  it('permite alternar entre tema dark e light', async () => {
    render(() => <App />);
    const themeBtn = screen.getByRole('button', { name: /Alternar para tema/i });

    await fireEvent.click(themeBtn);
    expect(document.documentElement.classList.contains('light')).toBe(true);

    await fireEvent.click(themeBtn);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('permite criar uma nova tarefa pelo input da interface', async () => {
    render(() => <App />);

    const input = screen.getByPlaceholderText(/Adicionar nova tarefa/i);
    const submitBtn = screen.getByRole('button', { name: /Adicionar/i });

    await fireEvent.input(input, { target: { value: 'Comprar café especial' } });
    await fireEvent.click(submitBtn);

    expect(screen.getByText('Comprar café especial')).toBeInTheDocument();
  });

  it('permite alternar o status de conclusão de uma tarefa na lista', async () => {
    render(() => <App />);

    const input = screen.getByPlaceholderText(/Adicionar nova tarefa/i);
    const submitBtn = screen.getByRole('button', { name: /Adicionar/i });

    await fireEvent.input(input, { target: { value: 'Finalizar documentação' } });
    await fireEvent.click(submitBtn);

    const taskText = screen.getByText('Finalizar documentação');
    expect(taskText).toBeInTheDocument();

    const checkbox = screen.getByRole('checkbox', { name: /Finalizar documentação/i });
    expect(checkbox).not.toBeChecked();

    await fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('permite excluir uma tarefa da lista', async () => {
    render(() => <App />);

    const input = screen.getByPlaceholderText(/Adicionar nova tarefa/i);
    const submitBtn = screen.getByRole('button', { name: /Adicionar/i });

    await fireEvent.input(input, { target: { value: 'Tarefa temporária' } });
    await fireEvent.click(submitBtn);

    expect(screen.getByText('Tarefa temporária')).toBeInTheDocument();

    const deleteBtn = screen.getByRole('button', { name: /Excluir tarefa Tarefa temporária/i });
    await fireEvent.click(deleteBtn);

    expect(screen.queryByText('Tarefa temporária')).not.toBeInTheDocument();
  });
});
