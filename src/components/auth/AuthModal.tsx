import { createSignal, Show } from 'solid-js';
import { Card, Button } from '../ui';
import { signInWithMagicLink, signInWithOAuth } from '../../store/authStore';
import { X, Mail, CheckCircle2, ShieldCheck } from 'lucide-solid';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal = (props: AuthModalProps) => {
  const [email, setEmail] = createSignal('');
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [isSent, setIsSent] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);

  const handleMagicLinkSubmit = async (e?: Event) => {
    if (e) e.preventDefault();
    const mail = email().trim();
    if (!mail) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const { error } = await signInWithMagicLink(mail);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message || 'Erro ao enviar link de acesso.');
    } else {
      setIsSent(true);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    const { error } = await signInWithOAuth('google');
    if (error) {
      setErrorMessage(error.message || 'Erro ao conectar com Google.');
    }
  };

  const handleClose = () => {
    setIsSent(false);
    setErrorMessage(null);
    setEmail('');
    props.onClose();
  };

  return (
    <Show when={props.isOpen}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      >
        <Card
          variant="default"
          class="relative w-full max-w-md p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl space-y-6"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar modal"
            class="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>

          {/* Header */}
          <div class="space-y-1.5 text-center">
            <div class="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
              <ShieldCheck class="w-6 h-6" />
            </div>
            <h2 id="auth-modal-title" class="text-xl font-bold text-slate-900 dark:text-white">
              Sincronização 24/7 na Nuvem
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Conecte sua conta para manter tarefas sincronizadas entre PC e celular em tempo real.
            </p>
          </div>

          <Show
            when={!isSent()}
            fallback={
              <div class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-center space-y-3 animate-in zoom-in-95">
                <CheckCircle2 class="w-8 h-8 text-emerald-500 mx-auto" />
                <div>
                  <h3 class="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                    Link de acesso enviado!
                  </h3>
                  <p class="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-1">
                    Enviamos um link mágico de login para <span class="font-semibold">{email()}</span>.
                    Basta clicar no link do e-mail para autenticar.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                  class="w-full text-xs font-semibold"
                >
                  Concluir
                </Button>
              </div>
            }
          >
            <div class="space-y-4">
              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                aria-label="Continuar com o Google"
                class="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm transition-all cursor-pointer"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continuar com o Google</span>
              </button>

              <div class="relative flex items-center justify-center my-3">
                <div class="w-full border-t border-slate-200 dark:border-slate-800" />
                <span class="absolute bg-white dark:bg-slate-900 px-3 text-[11px] text-slate-400 font-medium">
                  ou continue com e-mail
                </span>
              </div>

              {/* Magic Link Form */}
              <form onSubmit={handleMagicLinkSubmit} class="space-y-3">
                <div>
                  <label for="magic-link-email" class="sr-only">
                    E-mail
                  </label>
                  <div class="relative">
                    <Mail class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="magic-link-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email()}
                      onInput={(e) => setEmail(e.currentTarget.value)}
                      required
                      class="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                <Show when={errorMessage()}>
                  <span class="block text-xs text-rose-500 text-center font-medium">
                    {errorMessage()}
                  </span>
                </Show>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!email().trim() || isSubmitting()}
                  aria-label="Enviar link mágico"
                  class="w-full text-xs font-semibold py-2.5 rounded-xl shadow-md shadow-indigo-600/20"
                >
                  {isSubmitting() ? 'Enviando...' : 'Enviar link mágico'}
                </Button>
              </form>
            </div>
          </Show>
        </Card>
      </div>
    </Show>
  );
};
