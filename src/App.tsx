import { createSignal } from 'solid-js';

export default function App() {
  const [count, setCount] = createSignal(0);

  return (
    <main class="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-6 sm:p-12 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background ambient glow */}
      <div class="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/20 blur-[130px] rounded-full" />
        <div class="absolute top-1/2 -left-40 w-[400px] h-[400px] bg-purple-600/15 blur-[120px] rounded-full" />
      </div>

      {/* Main Container */}
      <div class="max-w-4xl w-full flex flex-col items-center text-center space-y-8">
        {/* Header Section */}
        <header class="space-y-4">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium tracking-wide uppercase">
            <span class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Fase 1: Fundação & Ambiente TDD
          </div>

          <h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            TasksAnywhere
          </h1>
          <p class="text-base sm:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            Gestor Inteligente de Tarefas com Captura Multimodal (Áudio, Fotos e Chat), 
            sincronização 24/7 e Modo Sticky Note flutuante para Desktop e Celular.
          </p>
        </header>

        {/* Status Badges */}
        <div class="flex flex-wrap items-center justify-center gap-2.5">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
            ⚡ SolidJS Signals
          </span>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
            🎨 Tailwind CSS v4
          </span>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
            🧪 Vitest + JSDOM
          </span>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
            🤖 Gemini 2.0 Flash
          </span>
        </div>

        {/* Interactive Signal Counter Card (Sanity Check) */}
        <section class="w-full max-w-md p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md shadow-2xl flex flex-col items-center gap-4 transition hover:border-slate-700">
          <div class="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Validação de Reatividade Granular
          </div>
          <button
            type="button"
            onClick={() => setCount((c) => c + 1)}
            class="group relative inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition shadow-lg shadow-indigo-600/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Contador: {count()}
          </button>
          <p class="text-xs text-slate-500">
            Clique para testar o re-render granular de Signals sem Virtual DOM.
          </p>
        </section>

        {/* Feature Highlights Grid */}
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left">
          <div class="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-indigo-500/40 transition">
            <div class="text-indigo-400 font-semibold mb-1 text-sm">📌 Modo Sticky Note</div>
            <p class="text-xs text-slate-400 leading-normal">
              Widget minimalista de canto de tela, always-on-top para PC via Tauri.
            </p>
          </div>
          <div class="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-indigo-500/40 transition">
            <div class="text-purple-400 font-semibold mb-1 text-sm">🎙️ Captura Multimodal</div>
            <p class="text-xs text-slate-400 leading-normal">
              Grave áudios, tire fotos ou envie prints com extração inteligente da IA.
            </p>
          </div>
          <div class="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-indigo-500/40 transition">
            <div class="text-emerald-400 font-semibold mb-1 text-sm">🔄 Supabase Realtime</div>
            <p class="text-xs text-slate-400 leading-normal">
              Sincronização 24/7 entre Desktop, Web e Celular com armazenamento efêmero.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer class="mt-12 text-xs text-slate-500">
        TasksAnywhere © 2026 • Open Source sob licença MIT • Desenvolvido com TDD
      </footer>
    </main>
  );
}
