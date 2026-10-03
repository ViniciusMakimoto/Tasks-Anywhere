import { createSignal } from 'solid-js';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const [user, setUser] = createSignal<User | null>(null);
const [session, setSession] = createSignal<Session | null>(null);
const [isLoading, setIsLoading] = createSignal<boolean>(true);

const isAuthenticated = () => !!user();

export { user, session, isLoading, isAuthenticated };

/**
 * Função utilitária para sincronizar ou mockar estado em testes.
 */
export function setAuthStateForTesting(
  newUser: User | null,
  newSession: Session | null,
  loading: boolean = false
) {
  setUser(newUser);
  setSession(newSession);
  setIsLoading(loading);
}

/**
 * Inicializa o observador de autenticação e obtém a sessão salva.
 */
export async function initAuth(): Promise<void> {
  setIsLoading(true);
  try {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    setUser(data.session?.user ?? null);

    supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    });
  } catch (err) {
    console.error('Erro ao verificar sessão do Supabase:', err);
  } finally {
    setIsLoading(false);
  }
}

/**
 * Realiza login via Magic Link enviado por e-mail.
 */
export async function signInWithMagicLink(email: string): Promise<{ error: AuthError | null }> {
  const redirectTo = typeof window !== 'undefined' ? window.location.origin : '';
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
    },
  });

  return { error };
}

/**
 * Realiza login via provedor OAuth (Google).
 */
export async function signInWithOAuth(provider: 'google'): Promise<{ error: AuthError | null }> {
  const redirectTo = typeof window !== 'undefined' ? window.location.origin : '';
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
    },
  });

  return { error };
}

/**
 * Encerra a sessão ativa no Supabase e limpa o estado reativo local.
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signOut();
  setUser(null);
  setSession(null);
  return { error };
}
