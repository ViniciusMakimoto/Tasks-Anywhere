import { createSignal, createMemo, onMount, For, Show } from 'solid-js';
import { Button, Badge, Card } from './components/ui';
import { theme, toggleTheme, initTheme } from './theme/theme';
import {
  tasks,
  initTaskStore,
  addTask,
  deleteTask,
  toggleTaskStatus,
  pendingCount,
  completedCount,
  todayTasks,
} from './store/taskStore';
import { TaskPriority } from './types/task';
import {
  Sun,
  Moon,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Circle,
  Tag,
  ListTodo,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-solid';

type FilterType = 'all' | 'pending' | 'completed' | 'today';

const priorityOptions: Array<{ value: TaskPriority; label: string }> = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
];

export default function App() {
  const [filter, setFilter] = createSignal<FilterType>('all');
  const [newTitle, setNewTitle] = createSignal('');
  const [newDescription, setNewDescription] = createSignal('');
  const [newTags, setNewTags] = createSignal('');
  const [newPriority, setNewPriority] = createSignal<TaskPriority>('medium');
  const [newDueDate, setNewDueDate] = createSignal('');
  const [showDetails, setShowDetails] = createSignal(false);
  const [expandedTaskId, setExpandedTaskId] = createSignal<string | null>(null);

  onMount(() => {
    initTheme();
    const existing = initTaskStore();
    // Se não houver tarefas salvas, inicializa com 3 tarefas de demonstração para localhost
    if (existing.length === 0) {
      const today = new Date().toISOString().split('T')[0];
      addTask({
        title: 'Explorar o Modo Sticky Note no desktop',
        description: 'Janela flutuante always-on-top compacta estilo widget para produtividade.',
        priority: 'high',
        dueDate: today,
        tags: ['desktop', 'tauri'],
      });
      addTask({
        title: 'Testar gravação de áudio com IA Gemini',
        description: 'Captura por voz e extração automática de tarefas estruturadas.',
        priority: 'urgent',
        tags: ['ia', 'multimodal'],
      });
      addTask({
        title: 'Configurar sincronização 24/7 com Supabase',
        description: 'PostgreSQL com RLS e sincronização em tempo real entre PC e Celular.',
        priority: 'medium',
        tags: ['backend', 'supabase'],
      });
    }
  });

  const filteredTasks = createMemo(() => {
    const list = tasks();
    const f = filter();
    if (f === 'pending') return list.filter((t) => t.status === 'pending');
    if (f === 'completed') return list.filter((t) => t.status === 'completed');
    if (f === 'today') return todayTasks();
    return list;
  });

  const completionRate = createMemo(() => {
    const total = tasks().length;
    if (total === 0) return 0;
    return Math.round((completedCount() / total) * 100);
  });

  const handleCreateTask = (e?: Event) => {
    if (e) e.preventDefault();
    const title = newTitle().trim();
    if (!title) return;

    const parsedTags = newTags()
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    addTask({
      title,
      description: newDescription().trim() || undefined,
      tags: parsedTags.length > 0 ? parsedTags : undefined,
      priority: newPriority(),
      dueDate: newDueDate() || undefined,
    });

    setNewTitle('');
    setNewDescription('');
    setNewTags('');
    setNewDueDate('');
    setNewPriority('medium');
    setShowDetails(false);
  };

  const getPriorityVariant = (p: TaskPriority) => {
    switch (p) {
      case 'urgent':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'primary';
      default:
        return 'default';
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedTaskId(expandedTaskId() === id ? null : id);
  };

  return (
    <main class="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-between p-4 sm:p-8 font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Background ambient glow */}
      <div class="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-600/20 blur-[130px] rounded-full" />
        <div class="absolute top-1/2 -left-40 w-[400px] h-[400px] bg-purple-500/10 dark:bg-purple-600/15 blur-[120px] rounded-full" />
      </div>

      {/* Main Container */}
      <div class="max-w-4xl w-full flex flex-col space-y-6">
        {/* Top Navbar */}
        <header class="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800/80">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <CheckCircle2 class="w-5 h-5" />
            </div>
            <div>
              <h1 class="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                TasksAnywhere
              </h1>
              <p class="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Captura inteligente, modo Sticky Note e reatividade fina por Signals.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleTheme()}
              aria-label={theme() === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
              class="border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200"
            >
              {theme() === 'dark' ? <Sun class="w-4 h-4 text-amber-400" /> : <Moon class="w-4 h-4 text-indigo-600" />}
              <span class="ml-1 text-xs">{theme() === 'dark' ? 'Tema Claro' : 'Tema Escuro'}</span>
            </Button>
          </div>
        </header>

        {/* Overview Stats Bar */}
        <section class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card class="p-3.5 flex flex-col justify-between">
            <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">Total de Tarefas</span>
            <div class="text-2xl font-bold text-slate-900 dark:text-white mt-1">{tasks().length}</div>
          </Card>

          <Card class="p-3.5 flex flex-col justify-between">
            <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">Pendentes</span>
            <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{pendingCount()}</div>
          </Card>

          <Card class="p-3.5 flex flex-col justify-between">
            <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">Concluídas</span>
            <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{completedCount()}</div>
          </Card>

          <Card class="p-3.5 flex flex-col justify-between">
            <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">Taxa de Conclusão</span>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-2xl font-bold text-slate-900 dark:text-white">{completionRate()}%</span>
              <div class="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  class="bg-indigo-600 dark:bg-indigo-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${completionRate()}%` }}
                />
              </div>
            </div>
          </Card>
        </section>

        {/* Task Creation Form with Expandable Details */}
        <section>
          <form
            onSubmit={handleCreateTask}
            class="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-lg space-y-3"
          >
            {/* Primary Input Line */}
            <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div class="relative flex-1">
                <input
                  type="text"
                  placeholder="Adicionar nova tarefa..."
                  value={newTitle()}
                  onInput={(e) => setNewTitle(e.currentTarget.value)}
                  class="w-full bg-slate-100 dark:bg-slate-950/70 text-slate-900 dark:text-slate-100 text-sm px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 focus:outline-none transition"
                />
              </div>

              <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {/* Priority Selector */}
                <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-950/70 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <For each={priorityOptions}>
                    {(opt) => (
                      <button
                        type="button"
                        onClick={() => setNewPriority(opt.value)}
                        class={`text-xs px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                          newPriority() === opt.value
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    )}
                  </For>
                </div>

                {/* Date Input */}
                <div class="flex items-center bg-slate-100 dark:bg-slate-950/70 px-2 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-slate-500 text-xs">
                  <Calendar class="w-3.5 h-3.5 mr-1 text-slate-400" />
                  <input
                    type="date"
                    value={newDueDate()}
                    onChange={(e) => setNewDueDate(e.currentTarget.value)}
                    class="bg-transparent text-xs text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                  />
                </div>

                {/* Toggle Details Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails())}
                  aria-label="Opções e detalhes da tarefa"
                  class="px-2.5 py-2 text-xs"
                >
                  <SlidersHorizontal class="w-3.5 h-3.5 mr-1" />
                  Detalhes
                  {showDetails() ? (
                    <ChevronUp class="w-3 h-3 ml-1" />
                  ) : (
                    <ChevronDown class="w-3 h-3 ml-1" />
                  )}
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  class="whitespace-nowrap px-4 py-2"
                  icon={<Plus class="w-4 h-4 mr-1" />}
                >
                  Adicionar
                </Button>
              </div>
            </div>

            {/* Expandable Details (Description & Tags) */}
            <Show when={showDetails()}>
              <div class="pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-200">
                <div>
                  <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Descrição ou notas
                  </label>
                  <textarea
                    aria-label="Descrição da tarefa"
                    placeholder="Descrição ou notas adicionais..."
                    value={newDescription()}
                    onInput={(e) => setNewDescription(e.currentTarget.value)}
                    rows={2}
                    class="w-full bg-slate-100 dark:bg-slate-950/70 text-slate-900 dark:text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 focus:outline-none transition resize-none"
                  />
                </div>

                <div>
                  <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Tags (separadas por vírgula)
                  </label>
                  <div class="relative">
                    <Tag class="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      aria-label="Tags da tarefa"
                      placeholder="Tags (separadas por vírgula, ex: backend, urgente)..."
                      value={newTags()}
                      onInput={(e) => setNewTags(e.currentTarget.value)}
                      class="w-full pl-8 bg-slate-100 dark:bg-slate-950/70 text-slate-900 dark:text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 focus:outline-none transition"
                    />
                  </div>
                  <p class="text-[10px] text-slate-400 mt-1">
                    Dica: use tags para categorizar por projeto ou contexto.
                  </p>
                </div>
              </div>
            </Show>
          </form>
        </section>

        {/* Filter Navigation Tabs */}
        <section class="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800/60 pb-3">
          <div class="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFilter('all')}
              class={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                filter() === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todas ({tasks().length})
            </button>

            <button
              type="button"
              onClick={() => setFilter('pending')}
              class={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                filter() === 'pending'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Pendentes ({pendingCount()})
            </button>

            <button
              type="button"
              onClick={() => setFilter('completed')}
              class={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                filter() === 'completed'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Concluídas ({completedCount()})
            </button>

            <button
              type="button"
              onClick={() => setFilter('today')}
              class={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                filter() === 'today'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Hoje ({todayTasks().length})
            </button>
          </div>

          <span class="text-xs text-slate-500 font-mono flex items-center gap-1">
            <Sparkles class="w-3 h-3 text-indigo-500" />
            Reatividade granular ativa
          </span>
        </section>

        {/* Task List */}
        <section class="space-y-2.5">
          <Show
            when={filteredTasks().length > 0}
            fallback={
              <Card class="border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center flex flex-col items-center justify-center">
                <ListTodo class="w-10 h-10 text-slate-400 mb-2 stroke-1" />
                <p class="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nenhuma tarefa nesta visualização
                </p>
                <p class="text-xs text-slate-500 mt-1">
                  Adicione uma nova tarefa no campo acima para começar!
                </p>
              </Card>
            }
          >
            <For each={filteredTasks()}>
              {(task) => (
                <Card
                  variant="interactive"
                  class={`p-3.5 transition-all ${
                    task.status === 'completed'
                      ? 'opacity-65 bg-slate-50/80 dark:bg-slate-950/40'
                      : ''
                  }`}
                >
                  <div class="flex items-start sm:items-center justify-between gap-3">
                    <div class="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                      {/* Checkbox */}
                      <label class="relative flex items-center cursor-pointer mt-0.5 sm:mt-0">
                        <input
                          type="checkbox"
                          checked={task.status === 'completed'}
                          onChange={() => toggleTaskStatus(task.id)}
                          aria-label={task.title}
                          class="sr-only"
                        />
                        <div
                          class={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                            task.status === 'completed'
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500'
                          }`}
                        >
                          {task.status === 'completed' ? (
                            <CheckCircle2 class="w-3.5 h-3.5" />
                          ) : (
                            <Circle class="w-3.5 h-3.5 text-transparent" />
                          )}
                        </div>
                      </label>

                      {/* Content */}
                      <div
                        class="flex-1 min-w-0 cursor-pointer"
                        onClick={() => toggleExpand(task.id)}
                      >
                        <div class="flex items-center gap-2 flex-wrap">
                          <span
                            class={`text-sm font-medium tracking-tight truncate ${
                              task.status === 'completed'
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {task.title}
                          </span>

                          <Badge variant={getPriorityVariant(task.priority)} size="sm">
                            {task.priority}
                          </Badge>

                          <Show when={task.dueDate}>
                            <Badge variant="default" size="sm" class="font-mono text-[10px]">
                              <Calendar class="w-3 h-3 mr-0.5" />
                              {task.dueDate}
                            </Badge>
                          </Show>
                        </div>

                        <Show when={task.description}>
                          <p class={`text-xs text-slate-500 dark:text-slate-400 mt-1 ${expandedTaskId() === task.id ? '' : 'line-clamp-1'}`}>
                            {task.description}
                          </p>
                        </Show>

                        <Show when={task.tags && task.tags.length > 0}>
                          <div class="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <For each={task.tags}>
                              {(t) => (
                                <span class="inline-flex items-center text-[10px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-200/80 dark:border-slate-700/50">
                                  <Tag class="w-2.5 h-2.5 mr-0.5 text-slate-400" />
                                  {t}
                                </span>
                              )}
                            </For>
                          </div>
                        </Show>
                      </div>
                    </div>

                    {/* Actions */}
                    <div class="flex items-center gap-1 self-start sm:self-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTask(task.id)}
                        aria-label={`Excluir tarefa ${task.title}`}
                        class="text-slate-400 hover:text-rose-500 p-1.5 h-8 w-8"
                      >
                        <Trash2 class="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </For>
          </Show>
        </section>
      </div>

      {/* Footer */}
      <footer class="mt-8 text-xs text-slate-400 dark:text-slate-600 text-center">
        TasksAnywhere © 2026 • Powered by SolidJS Fusion Signals • TDD Rigoroso
      </footer>
    </main>
  );
}
