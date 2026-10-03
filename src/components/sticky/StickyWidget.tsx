import { createSignal, createMemo, For, Show } from 'solid-js';
import { Card, Button } from '../ui';
import { Task, TaskPriority } from '../../types/task';
import {
  Pin,
  Maximize2,
  Minimize2,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Calendar,
  Sparkles,
} from 'lucide-solid';

export interface StickyWidgetProps {
  tasks: Task[];
  isExpandedMode?: boolean;
  onToggleMode?: () => void;
  onToggleStatus?: (id: string) => void;
  onAddTask?: (title: string) => void;
  onDelete?: (id: string) => void;
}

const priorityDotColors: Record<TaskPriority, string> = {
  urgent: 'bg-rose-500 ring-rose-500/30',
  high: 'bg-amber-500 ring-amber-500/30',
  medium: 'bg-indigo-500 ring-indigo-500/30',
  low: 'bg-slate-400 ring-slate-400/20',
};

export function StickyWidget(props: StickyWidgetProps) {
  const [quickTitle, setQuickTitle] = createSignal('');

  const pendingTasks = createMemo(() => (props.tasks || []).filter((t) => t.status === 'pending'));
  const pendingCount = createMemo(() => pendingTasks().length);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const title = quickTitle().trim();
    if (!title) return;

    props.onAddTask?.(title);
    setQuickTitle('');
  };

  return (
    <Card
      variant="default"
      class="w-full sm:w-72 max-w-[290px] rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden transition-all duration-200 flex flex-col text-[11px]"
    >
      {/* Sticky Header */}
      <header class="p-2 px-2.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/60">
        <div class="flex items-center gap-1.5">
          <div class="w-5 h-5 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Pin class="w-3 h-3 rotate-45" />
          </div>
          <div>
            <h2 class="text-[11px] font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-1">
              Sticky Note
              <span class="text-[9px] font-normal text-slate-400">
                ({pendingCount()} {pendingCount() === 1 ? 'pendente' : 'pendentes'})
              </span>
            </h2>
          </div>
        </div>

        <div class="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => props.onToggleMode?.()}
            aria-label={props.isExpandedMode ? 'Alternar para modo compacto' : 'Alternar para modo expandido'}
            class="h-6 w-6 p-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            {props.isExpandedMode ? <Minimize2 class="w-3 h-3" /> : <Maximize2 class="w-3 h-3" />}
          </Button>
        </div>
      </header>

      {/* Quick Add Input Bar */}
      <form onSubmit={handleSubmit} class="p-1.5 px-2 border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900">
        <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-950/70 px-2 py-1 rounded-lg border border-slate-200/80 dark:border-slate-800 focus-within:border-indigo-500 transition">
          <input
            type="text"
            placeholder="Adicionar nota rápida... (Enter)"
            value={quickTitle()}
            onInput={(e) => setQuickTitle(e.currentTarget.value)}
            class="w-full bg-transparent text-[11px] text-slate-900 dark:text-slate-100 focus:outline-none placeholder:text-slate-400 leading-none"
          />
          <button
            type="submit"
            aria-label="Salvar nota rápida"
            class="p-0.5 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <Plus class="w-3 h-3" />
          </button>
        </div>
      </form>

      {/* Compact Task List Container */}
      <div class="p-1.5 space-y-1 max-h-64 sm:max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
        <Show
          when={props.tasks && props.tasks.length > 0}
          fallback={
            <div class="py-5 text-center text-xs text-slate-400 space-y-1">
              <Sparkles class="w-4 h-4 mx-auto text-amber-400/80 mb-0.5" />
              <p class="font-medium text-[11px] text-slate-600 dark:text-slate-300">Nenhuma tarefa pendente</p>
              <p class="text-[10px] text-slate-400">Tudo limpo! Adicione uma nota rápida acima.</p>
            </div>
          }
        >
          <For each={props.tasks}>
            {(task) => (
              <div
                class={`pt-1 first:pt-0 flex items-center justify-between gap-1.5 px-1.5 py-1 rounded-md transition-colors group ${
                  task.status === 'completed'
                    ? 'opacity-60 bg-slate-50/50 dark:bg-slate-950/30'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                {/* Status Checkbox + Priority Indicator */}
                <div class="flex items-center gap-1.5 min-w-0 flex-1">
                  <label class="relative flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      onChange={() => props.onToggleStatus?.(task.id)}
                      aria-label={task.title}
                      class="sr-only"
                    />
                    <div
                      class={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                        task.status === 'completed'
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 hover:border-indigo-500'
                      }`}
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle2 class="w-2.5 h-2.5" />
                      ) : (
                        <Circle class="w-2.5 h-2.5 text-transparent" />
                      )}
                    </div>
                  </label>

                  {/* Priority dot */}
                  <span
                    class={`w-1.5 h-1.5 rounded-full shrink-0 ring-1 ${priorityDotColors[task.priority]}`}
                    title={`Prioridade: ${task.priority}`}
                  />

                  {/* Title & Date */}
                  <div class="min-w-0 flex-1">
                    <span
                      class={`block text-[11px] leading-tight truncate transition-colors ${
                        task.status === 'completed'
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200 font-medium'
                      }`}
                    >
                      {task.title}
                    </span>

                    <Show when={task.dueDate}>
                      <span class="inline-flex items-center text-[9px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                        <Calendar class="w-2 h-2 mr-0.5" />
                        {task.dueDate}
                      </span>
                    </Show>
                  </div>
                </div>

                {/* Delete Action Button */}
                <button
                  type="button"
                  onClick={() => props.onDelete?.(task.id)}
                  aria-label={`Excluir nota ${task.title}`}
                  class="text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 p-0.5 rounded transition opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <Trash2 class="w-3 h-3" />
                </button>
              </div>
            )}
          </For>
        </Show>
      </div>
    </Card>
  );
}
