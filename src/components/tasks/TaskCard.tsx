import { createSignal, createMemo, Show, For } from 'solid-js';
import { Card, Badge, Button } from '../ui';
import { Task, TaskPriority } from '../../types/task';
import { getTodayDateString } from '../../store/taskStore';
import {
  CheckCircle2,
  Circle,
  Calendar,
  Tag,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
  CheckSquare,
  Sparkles,
} from 'lucide-solid';

export interface TaskCardProps {
  task: Task;
  isExpanded?: boolean;
  onToggleStatus?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleExpand?: (id: string) => void;
  onAddSubtask?: (taskId: string, title: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask?: (taskId: string, subtaskId: string) => void;
  onResolveClarification?: (taskId: string, answer: string) => void;
}

const priorityConfig: Record<TaskPriority, { variant: 'danger' | 'warning' | 'primary' | 'default'; label: string }> = {
  urgent: { variant: 'danger', label: 'Urgente' },
  high: { variant: 'warning', label: 'Alta' },
  medium: { variant: 'primary', label: 'Média' },
  low: { variant: 'default', label: 'Baixa' },
};

export function TaskCard(props: TaskCardProps) {
  const [internalExpanded, setInternalExpanded] = createSignal(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = createSignal('');
  const [clarificationAnswer, setClarificationAnswer] = createSignal('');

  const handleSendClarification = (e?: Event) => {
    if (e) e.preventDefault();
    const ans = clarificationAnswer().trim();
    if (!ans) return;
    props.onResolveClarification?.(props.task.id, ans);
    setClarificationAnswer('');
  };

  const isExpanded = () => (props.isExpanded !== undefined ? props.isExpanded : internalExpanded());

  const toggleExpand = () => {
    if (props.onToggleExpand) {
      props.onToggleExpand(props.task.id);
    } else {
      setInternalExpanded(!internalExpanded());
    }
  };

  const priorityMeta = () => priorityConfig[props.task.priority] || priorityConfig.medium;

  const dueDateInfo = createMemo(() => {
    if (!props.task.dueDate) return null;
    const today = getTodayDateString();
    const isCompleted = props.task.status === 'completed';

    if (!isCompleted && props.task.dueDate < today) {
      return {
        variant: 'danger' as const,
        label: `Atrasada • ${props.task.dueDate}`,
      };
    }
    if (!isCompleted && props.task.dueDate === today) {
      return {
        variant: 'primary' as const,
        label: 'Hoje',
      };
    }
    return {
      variant: 'default' as const,
      label: props.task.dueDate,
    };
  });

  const completedSubtasksCount = createMemo(() => {
    return (props.task.subtasks || []).filter((s) => s.completed).length;
  });

  const totalSubtasksCount = () => (props.task.subtasks || []).length;

  const handleAddSubtask = (e?: Event) => {
    if (e) e.preventDefault();
    const title = newSubtaskTitle().trim();
    if (!title) return;

    props.onAddSubtask?.(props.task.id, title);
    setNewSubtaskTitle('');
  };

  return (
    <Card
      variant="default"
      class={`p-3.5 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700 ${
        props.task.status === 'completed'
          ? 'opacity-70 bg-slate-50/80 dark:bg-slate-950/40'
          : 'bg-white dark:bg-slate-900/90 shadow-sm'
      }`}
    >
      <div class="flex items-start sm:items-center justify-between gap-3">
        <div class="flex items-start sm:items-center gap-3 flex-1 min-w-0">
          {/* Main Status Checkbox */}
          <label class="relative flex items-center cursor-pointer mt-0.5 sm:mt-0 select-none">
            <input
              type="checkbox"
              checked={props.task.status === 'completed'}
              onChange={() => props.onToggleStatus?.(props.task.id)}
              aria-label={props.task.title}
              class="sr-only"
            />
            <div
              class={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors duration-150 ${
                props.task.status === 'completed'
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                  : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-950'
              }`}
            >
              {props.task.status === 'completed' ? (
                <CheckCircle2 class="w-3.5 h-3.5" />
              ) : (
                <Circle class="w-3.5 h-3.5 text-transparent" />
              )}
            </div>
          </label>

          {/* Task Info & Badges */}
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span
                class={`text-sm font-medium tracking-tight truncate transition-colors duration-150 ${
                  props.task.status === 'completed'
                    ? 'line-through text-slate-400 dark:text-slate-500'
                    : 'text-slate-900 dark:text-slate-100'
                }`}
              >
                {props.task.title}
              </span>

              {/* Priority Badge */}
              <Badge variant={priorityMeta().variant} size="sm">
                {priorityMeta().label}
              </Badge>

              {/* Due Date Badge */}
              <Show when={dueDateInfo()}>
                {(info) => (
                  <Badge variant={info().variant} size="sm" class="font-mono text-[10px]">
                    <Calendar class="w-3 h-3 mr-0.5" />
                    {info().label}
                  </Badge>
                )}
              </Show>

              {/* Subtasks Progress Badge */}
              <Show when={totalSubtasksCount() > 0}>
                <Badge variant="default" size="sm" class="font-mono text-[10px]">
                  <CheckSquare class="w-3 h-3 mr-0.5 text-indigo-500 dark:text-indigo-400" />
                  {completedSubtasksCount()}/{totalSubtasksCount()}
                </Badge>
              </Show>
            </div>

            {/* Collapsed Preview of Description */}
            <Show when={props.task.description && !isExpanded()}>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                {props.task.description}
              </p>
            </Show>

            {/* Tags preview */}
            <Show when={props.task.tags && props.task.tags.length > 0}>
              <div class="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <For each={props.task.tags}>
                  {(tag) => (
                    <span class="inline-flex items-center text-[10px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-200/80 dark:border-slate-700/50">
                      <Tag class="w-2.5 h-2.5 mr-0.5 text-slate-400" />
                      {tag}
                    </span>
                  )}
                </For>
              </div>
            </Show>
          </div>
        </div>

        {/* Action Controls */}
        <div class="flex items-center gap-1 self-start sm:self-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpand}
            aria-label={isExpanded() ? 'Recolher subtarefas' : 'Ver subtarefas'}
            class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 h-8 w-8"
          >
            {isExpanded() ? <ChevronUp class="w-4 h-4" /> : <ChevronDown class="w-4 h-4" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => props.onDelete?.(props.task.id)}
            aria-label={`Excluir tarefa ${props.task.title}`}
            class="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-1.5 h-8 w-8"
          >
            <Trash2 class="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* AI Clarification Banner (Task 5.3) */}
      <Show when={props.task.clarificationNeeded}>
        <div class="mt-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
          <div class="flex items-start gap-2 text-amber-800 dark:text-amber-300 font-medium">
            <Sparkles class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div class="space-y-1">
              <span class="font-semibold block">Dúvida da IA (Gemini):</span>
              <p class="text-amber-900/90 dark:text-amber-200/90 leading-snug">
                {props.task.clarificationQuestion || 'Esta tarefa necessita de detalhes adicionais para ser finalizada.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSendClarification} class="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={clarificationAnswer()}
              onInput={(e) => setClarificationAnswer(e.currentTarget.value)}
              placeholder="Digite o esclarecimento para a IA..."
              class="flex-1 px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-amber-300/60 dark:border-amber-700/60 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <Button
              type="submit"
              size="sm"
              variant="primary"
              class="px-3 py-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white shrink-0"
              disabled={!clarificationAnswer().trim()}
            >
              Responder
            </Button>
          </form>
        </div>
      </Show>

      {/* Expanded Details and Subtasks Section */}
      <Show when={isExpanded()}>
        <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3 animate-in fade-in duration-150">
          {/* Attached Image Preview */}
          <Show when={props.task.imageUrl}>
            <div class="relative w-full max-h-56 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
              <img
                src={props.task.imageUrl}
                alt={`Imagem anexada a ${props.task.title}`}
                class="w-full h-auto object-cover max-h-56"
              />
            </div>
          </Show>

          {/* Detailed Description */}
          <Show when={props.task.description}>
            <div class="bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/50 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {props.task.description}
            </div>
          </Show>

          {/* Subtasks Checklist */}
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
              <span class="flex items-center gap-1">
                <CheckSquare class="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                Subtarefas
              </span>
              <span class="text-[11px] font-mono">
                {completedSubtasksCount()} de {totalSubtasksCount()} concluídas
              </span>
            </div>

            {/* Subtask Items */}
            <div class="space-y-1.5">
              <For each={props.task.subtasks}>
                {(subtask) => (
                  <div class="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50/80 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700 transition">
                    <label class="flex items-center gap-2 flex-1 min-w-0 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => props.onToggleSubtask?.(props.task.id, subtask.id)}
                        aria-label={subtask.title}
                        class="sr-only"
                      />
                      <div
                        class={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          subtask.completed
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                        }`}
                      >
                        {subtask.completed ? (
                          <CheckCircle2 class="w-3 h-3" />
                        ) : (
                          <Circle class="w-3 h-3 text-transparent" />
                        )}
                      </div>
                      <span
                        class={`text-xs truncate ${
                          subtask.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {subtask.title}
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => props.onDeleteSubtask?.(props.task.id, subtask.id)}
                      aria-label={`Excluir subtarefa ${subtask.title}`}
                      class="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-1 rounded transition cursor-pointer"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </For>
            </div>

            {/* Quick Add Subtask Input */}
            <form onSubmit={handleAddSubtask} class="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Adicionar subtarefa..."
                value={newSubtaskTitle()}
                onInput={(e) => setNewSubtaskTitle(e.currentTarget.value)}
                class="flex-1 bg-slate-100 dark:bg-slate-950/70 text-slate-900 dark:text-slate-100 text-xs px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 focus:outline-none transition"
              />
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                aria-label="Adicionar subtarefa"
                class="px-2.5 py-1.5 text-xs whitespace-nowrap"
              >
                <Plus class="w-3.5 h-3.5 mr-1" />
                Adicionar
              </Button>
            </form>
          </div>
        </div>
      </Show>
    </Card>
  );
}
