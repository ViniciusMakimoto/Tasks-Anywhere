import { createMemo, Show, For } from 'solid-js';
import { Card, Badge } from '../ui';
import { Task } from '../../types/task';
import { TaskCard } from './TaskCard';
import { sortTasksByPriority } from '../../store/taskStore';
import { Target, Sparkles, Calendar } from 'lucide-solid';

export interface TodayFocusProps {
  tasks: Task[];
  onToggleStatus?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleExpand?: (id: string) => void;
  onAddSubtask?: (taskId: string, title: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask?: (taskId: string, subtaskId: string) => void;
}

export function TodayFocus(props: TodayFocusProps) {
  const total = () => props.tasks.length;
  const completed = createMemo(() => props.tasks.filter((t) => t.status === 'completed').length);
  const rate = createMemo(() => (total() === 0 ? 0 : Math.round((completed() / total()) * 100)));
  const allCompleted = createMemo(() => total() > 0 && completed() === total());

  const sortedTasks = createMemo(() => sortTasksByPriority(props.tasks));

  return (
    <div class="space-y-3">
      {/* Featured Header Card */}
      <Card
        variant="default"
        class="p-4 sm:p-5 border-indigo-200/80 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 dark:from-indigo-950/30 dark:via-slate-900/90 dark:to-purple-950/30 shadow-md relative overflow-hidden"
      >
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-600/30">
              <Target class="w-4 h-4" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Foco de Hoje
                </h2>
                <Badge variant="primary" size="sm" class="text-[10px] font-mono">
                  Hoje
                </Badge>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Tarefas agendadas com priorização inteligente por urgência.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <Show when={total() > 0}>
              <div class="text-right">
                <span class="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {completed()} de {total()} concluídas
                </span>
                <div class="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  {rate()}%
                </div>
              </div>
            </Show>
          </div>
        </div>

        {/* Progress bar */}
        <Show when={total() > 0}>
          <div class="w-full bg-slate-200/80 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div
              class="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${rate()}%` }}
            />
          </div>
        </Show>

        {/* Celebration Banner when 100% completed */}
        <Show when={allCompleted()}>
          <div class="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-medium animate-in fade-in duration-200">
            <Sparkles class="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>Tudo pronto por hoje! Parabéns, todas as tarefas de hoje foram concluídas.</span>
          </div>
        </Show>
      </Card>

      {/* Task Cards or Empty State */}
      <Show
        when={total() > 0}
        fallback={
          <Card class="border border-dashed border-slate-300 dark:border-slate-800 p-6 text-center flex flex-col items-center justify-center">
            <Calendar class="w-8 h-8 text-slate-400 mb-2 stroke-1" />
            <p class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Nenhuma tarefa agendada para hoje
            </p>
            <p class="text-xs text-slate-500 mt-1">
              Defina a data de vencimento de uma tarefa para hoje para destacá-la aqui.
            </p>
          </Card>
        }
      >
        <div class="space-y-2">
          <For each={sortedTasks()}>
            {(task) => (
              <TaskCard
                task={task}
                onToggleStatus={props.onToggleStatus}
                onDelete={props.onDelete}
                onToggleExpand={props.onToggleExpand}
                onAddSubtask={props.onAddSubtask}
                onToggleSubtask={props.onToggleSubtask}
                onDeleteSubtask={props.onDeleteSubtask}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
