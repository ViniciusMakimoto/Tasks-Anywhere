import { createSignal, onMount } from 'solid-js';
import { Button, Badge, Card } from './components/ui';
import { theme, toggleTheme, initTheme } from './theme/theme';
import { Sun, Moon, Sparkles, CheckCircle2, Pin, Mic, Radio } from 'lucide-solid';

export default function App() {
  const [count, setCount] = createSignal(0);

  onMount(() => {
    initTheme();
  });

  return (
    <main class="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-between p-6 sm:p-12 font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Background ambient glow */}
      <div class="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-600/20 blur-[130px] rounded-full" />
        <div class="absolute top-1/2 -left-40 w-[400px] h-[400px] bg-purple-500/10 dark:bg-purple-600/15 blur-[120px] rounded-full" />
      </div>

      {/* Top Bar / Theme Switcher */}
      <div class="max-w-4xl w-full flex items-center justify-between mb-8">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <CheckCircle2 class="w-5 h-5" />
          </div>
          <span class="font-bold text-lg tracking-tight">TasksAnywhere</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleTheme()}
          aria-label={theme() === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
          class="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
        >
          {theme() === 'dark' ? <Sun class="w-4 h-4 text-amber-400" /> : <Moon class="w-4 h-4 text-indigo-600" />}
          <span class="ml-1 text-xs">{theme() === 'dark' ? 'Tema Claro' : 'Tema Escuro'}</span>
        </Button>
      </div>

      {/* Main Container */}
      <div class="max-w-4xl w-full flex flex-col items-center text-center space-y-8">
        {/* Header Section */}
        <header class="space-y-4">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-medium tracking-wide uppercase">
            <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            Fase 1: Fundação & Design System
          </div>

          <h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
            TasksAnywhere
          </h1>
          <p class="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Gestor Inteligente de Tarefas com Captura Multimodal (Áudio, Fotos e Chat), 
            sincronização 24/7 e Modo Sticky Note flutuante para Desktop e Celular.
          </p>
        </header>

        {/* Status Badges via Design System */}
        <div class="flex flex-wrap items-center justify-center gap-2.5">
          <Badge variant="primary" size="md">
            ⚡ SolidJS Signals
          </Badge>
          <Badge variant="info" size="md">
            🎨 Tailwind CSS v4
          </Badge>
          <Badge variant="success" size="md">
            🧪 Vitest + JSDOM
          </Badge>
          <Badge variant="warning" size="md">
            🤖 Gemini 2.0 Flash
          </Badge>
        </div>

        {/* Interactive Signal Counter Card via Design System */}
        <Card variant="glass" class="w-full max-w-md p-6 flex flex-col items-center gap-4 bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div class="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles class="w-3.5 h-3.5 text-indigo-500" />
            Validação de Reatividade Granular
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setCount((c) => c + 1)}
            class="shadow-lg shadow-indigo-600/30"
          >
            Contador: {count()}
          </Button>

          <p class="text-xs text-slate-500 dark:text-slate-400">
            Clique para testar o re-render granular de Signals sem Virtual DOM.
          </p>
        </Card>

        {/* Feature Highlights Grid via Design System */}
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left">
          <Card variant="interactive" class="bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80">
            <div class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold mb-1 text-sm">
              <Pin class="w-4 h-4" />
              Modo Sticky Note
            </div>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-normal">
              Widget minimalista de canto de tela, always-on-top para PC via Tauri.
            </p>
          </Card>

          <Card variant="interactive" class="bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80">
            <div class="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold mb-1 text-sm">
              <Mic class="w-4 h-4" />
              Captura Multimodal
            </div>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-normal">
              Grave áudios, tire fotos ou envie prints com extração inteligente da IA.
            </p>
          </Card>

          <Card variant="interactive" class="bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80">
            <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold mb-1 text-sm">
              <Radio class="w-4 h-4" />
              Supabase Realtime
            </div>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-normal">
              Sincronização 24/7 entre Desktop, Web e Celular com armazenamento efêmero.
            </p>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer class="mt-12 text-xs text-slate-500 dark:text-slate-500">
        TasksAnywhere © 2026 • Open Source sob licença MIT • Desenvolvido com TDD
      </footer>
    </main>
  );
}
