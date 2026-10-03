import { For, Show } from 'solid-js';
import { TaskPriority } from '../../types/task';
import { Button } from '../ui';
import { ArrowUpDown, Filter } from 'lucide-solid';

export type StatusFilterType = 'all' | 'pending' | 'completed' | 'today' | 'incomplete';
export type SortByType = 'urgency' | 'recent';

export interface TaskFiltersProps {
  statusFilter: StatusFilterType;
  priorityFilter: TaskPriority | 'all';
  sortBy?: SortByType;
  counts: {
    total: number;
    pending: number;
    completed: number;
    today: number;
    incomplete?: number;
  };
  onStatusChange?: (status: StatusFilterType) => void;
  onPriorityChange?: (priority: TaskPriority | 'all') => void;
  onSortChange?: (sortBy: SortByType) => void;
}

const priorityOptions: Array<{ value: TaskPriority | 'all'; label: string; activeClass: string }> = [
  { value: 'all', label: 'Todas as prioridades', activeClass: 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' },
  { value: 'urgent', label: 'Urgente', activeClass: 'bg-rose-600 text-white shadow-sm' },
  { value: 'high', label: 'Alta', activeClass: 'bg-amber-600 text-white shadow-sm' },
  { value: 'medium', label: 'Média', activeClass: 'bg-indigo-600 text-white shadow-sm' },
  { value: 'low', label: 'Baixa', activeClass: 'bg-slate-600 text-white shadow-sm' },
];

export function TaskFilters(props: TaskFiltersProps) {
  const currentSort = () => props.sortBy || 'recent';

  const toggleSort = () => {
    const next = currentSort() === 'urgency' ? 'recent' : 'urgency';
    props.onSortChange?.(next);
  };

  return (
    <div class="space-y-2.5 pb-2 border-b border-slate-200 dark:border-slate-800/80">
      {/* Status Filter Tabs & Sort Toggle */}
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => props.onStatusChange?.('all')}
            class={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              props.statusFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-slate-900/60'
            }`}
          >
            Todas ({props.counts.total})
          </button>

          <button
            type="button"
            onClick={() => props.onStatusChange?.('pending')}
            class={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              props.statusFilter === 'pending'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-slate-900/60'
            }`}
          >
            Pendentes ({props.counts.pending})
          </button>

          <button
            type="button"
            onClick={() => props.onStatusChange?.('completed')}
            class={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              props.statusFilter === 'completed'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-slate-900/60'
            }`}
          >
            Concluídas ({props.counts.completed})
          </button>

          <button
            type="button"
            onClick={() => props.onStatusChange?.('today')}
            class={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              props.statusFilter === 'today'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-slate-900/60'
            }`}
          >
            Hoje ({props.counts.today})
          </button>

          <Show when={(props.counts.incomplete ?? 0) > 0 || props.statusFilter === 'incomplete'}>
            <button
              type="button"
              onClick={() => props.onStatusChange?.('incomplete')}
              class={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                props.statusFilter === 'incomplete'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/50'
              }`}
            >
              <span>Incompletas / IA ({props.counts.incomplete ?? 0})</span>
            </button>
          </Show>
        </div>

        {/* Sort Toggle Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSort}
          aria-label={currentSort() === 'urgency' ? 'Ordenar por data' : 'Ordenar por urgência'}
          class="text-xs px-2.5 py-1.5 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
        >
          <ArrowUpDown class="w-3.5 h-3.5 mr-1 text-slate-400" />
          {currentSort() === 'urgency' ? 'Mais urgentes' : 'Mais recentes'}
        </Button>
      </div>

      {/* Secondary Priority Filter Chips */}
      <div class="flex items-center gap-1.5 flex-wrap pt-0.5">
        <span class="text-[11px] font-medium text-slate-400 flex items-center gap-1 mr-1">
          <Filter class="w-3 h-3" />
          Prioridade:
        </span>
        <For each={priorityOptions}>
          {(opt) => (
            <button
              type="button"
              onClick={() => props.onPriorityChange?.(opt.value)}
              class={`text-[11px] px-2 py-0.5 rounded-md font-medium transition cursor-pointer border ${
                props.priorityFilter === opt.value
                  ? `${opt.activeClass} border-transparent`
                  : 'bg-white dark:bg-slate-950/50 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          )}
        </For>
      </div>
    </div>
  );
}
