import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  user,
  session,
  isLoading,
  isAuthenticated,
  signInWithMagicLink,
  signInWithOAuth,
  signOut,
  initAuth,
  setAuthStateForTesting,
} from './authStore';

// Mock do supabase client
vi.mock('../lib/supabase', () => {
  return {
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: {
            session: {
              user: { id: 'user-123', email: 'teste@tasksanywhere.com' },
              access_token: 'fake-token',
            },
          },
          error: null,
        }),
        onAuthStateChange: vi.fn().mockReturnValue({
          data: {
            subscription: { unsubscribe: vi.fn() },
          },
        }),
        signInWithOtp: vi.fn().mockResolvedValue({ data: {}, error: null }),
        signInWithOAuth: vi.fn().mockResolvedValue({ data: { url: 'https://oauth.url' }, error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
      },
    },
  };
});

import { supabase } from '../lib/supabase';

describe('AuthStore (TDD - Task 4.1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setAuthStateForTesting(null, null, false);
  });

  describe('1. Inicialização e Estado de Sessão', () => {
    it('deve inicializar com o usuário retornado por getSession', async () => {
      await initAuth();

      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(user()?.id).toBe('user-123');
      expect(user()?.email).toBe('teste@tasksanywhere.com');
      expect(isAuthenticated()).toBe(true);
      expect(isLoading()).toBe(false);
    });

    it('deve permanecer deslogado se getSession não retornar sessão', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      await initAuth();

      expect(user()).toBeNull();
      expect(session()).toBeNull();
      expect(isAuthenticated()).toBe(false);
    });
  });

  describe('2. Ações de Login e Logout', () => {
    it('deve chamar signInWithOtp ao solicitar login via Magic Link', async () => {
      const res = await signInWithMagicLink('usuario@empresa.com');

      expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
        email: 'usuario@empresa.com',
        options: expect.objectContaining({
          emailRedirectTo: expect.any(String),
        }),
      });
      expect(res.error).toBeNull();
    });

    it('deve chamar signInWithOAuth com provedor Google', async () => {
      const res = await signInWithOAuth('google');

      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: expect.objectContaining({
          redirectTo: expect.any(String),
        }),
      });
      expect(res.error).toBeNull();
    });

    it('deve chamar signOut e limpar o estado do usuário logado', async () => {
      setAuthStateForTesting(
        { id: 'user-123', email: 'teste@tasksanywhere.com' } as any,
        { access_token: 'fake' } as any,
        false
      );

      expect(isAuthenticated()).toBe(true);

      const res = await signOut();

      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(user()).toBeNull();
      expect(session()).toBeNull();
      expect(isAuthenticated()).toBe(false);
      expect(res.error).toBeNull();
    });
  });
});
