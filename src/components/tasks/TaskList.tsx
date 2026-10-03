import { For, Show } from 'solid-js';
import { Task } from '../../types/task';
import { TaskCard } from './TaskCard';
import { Card } from '../ui';
import { ListTodo } from 'lucide-solid';

export interface TaskListProps {
  tasks: Task[];
  emptyMessage?: string;
  emptyDescription?: string;
  expandedTaskId?: string | null;
  onToggleExpand?: (id: string) => void;
  onToggleStatus?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAddSubtask?: (taskId: string, title: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask?: (taskId: string, subtaskId: string) => void;
}

export function TaskList(props: TaskListProps) {
  const emptyMessage = () => props.emptyMessage || 'Nenhuma tarefa encontrada';
  const emptyDescription = () => props.emptyDescription || 'Adicione uma nova tarefa no campo acima para começar!';

  return (
    <div class="space-y-2.5">
      <Show
        when={props.tasks.length > 0}
        fallback={
          <Card class="border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center flex flex-col items-center justify-center">
            <ListTodo class="w-10 h-10 text-slate-400 mb-2 stroke-1" />
            <p class="text-sm font-medium text-slate-700 dark:text-slate-300">
              {emptyMessage()}
            </p>
            <p class="text-xs text-slate-500 mt-1">
              {emptyDescription()}
            </p>
          </Card>
        }
      >
        <For each={props.tasks}>
          {(task) => (
            <TaskCard
              task={task}
              isExpanded={props.expandedTaskId !== undefined ? props.expandedTaskId === task.id : undefined}
              onToggleExpand={props.onToggleExpand}
              onToggleStatus={props.onToggleStatus}
              onDelete={props.onDelete}
              onAddSubtask={props.onAddSubtask}
              onToggleSubtask={props.onToggleSubtask}
              onDeleteSubtask={props.onDeleteSubtask}
            />
          )}
        </For>
      </Show>
    </div>
  );
}
