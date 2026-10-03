import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthModal } from './AuthModal';

// Mock de authStore
vi.mock('../../store/authStore', () => {
  return {
    signInWithMagicLink: vi.fn().mockResolvedValue({ error: null }),
    signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
    user: () => null,
    isAuthenticated: () => false,
  };
});

import { signInWithMagicLink, signInWithOAuth } from '../../store/authStore';

describe('AuthModal Component (TDD - Task 4.1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('não deve renderizar quando isOpen for false', () => {
    render(() => <AuthModal isOpen={false} onClose={vi.fn()} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renderiza o modal com opções de login com Google e Magic Link quando isOpen for true', () => {
    render(() => <AuthModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continuar com o Google/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/seu@email.com/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enviar link mágico/i })).toBeInTheDocument();
  });

  it('ao clicar no botão do Google, aciona signInWithOAuth', async () => {
    render(() => <AuthModal isOpen={true} onClose={vi.fn()} />);

    const googleBtn = screen.getByRole('button', { name: /Continuar com o Google/i });
    await fireEvent.click(googleBtn);

    expect(signInWithOAuth).toHaveBeenCalledWith('google');
  });

  it('ao preencher e-mail e enviar, aciona signInWithMagicLink e exibe mensagem de sucesso', async () => {
    render(() => <AuthModal isOpen={true} onClose={vi.fn()} />);

    const emailInput = screen.getByPlaceholderText(/seu@email.com/i);
    await fireEvent.input(emailInput, { target: { value: 'dev@tasksanywhere.com' } });

    const submitBtn = screen.getByRole('button', { name: /Enviar link mágico/i });
    await fireEvent.click(submitBtn);

    expect(signInWithMagicLink).toHaveBeenCalledWith('dev@tasksanywhere.com');

    await waitFor(() => {
      expect(screen.getByText(/Link de acesso enviado/i)).toBeInTheDocument();
    });
  });

  it('chama onClose ao clicar no botão de fechar', async () => {
    const handleClose = vi.fn();
    render(() => <AuthModal isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByRole('button', { name: /Fechar modal/i });
    await fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalled();
  });
});
