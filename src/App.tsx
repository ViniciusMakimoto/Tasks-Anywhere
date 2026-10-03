import { createSignal, createMemo, onMount, For, Show } from 'solid-js';
import { Button, Card } from './components/ui';
import { theme, toggleTheme, initTheme } from './theme/theme';
import {
  tasks,
  initTaskStore,
  addTask,
  deleteTask,
  toggleTaskStatus,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  pendingCount,
  completedCount,
  todayTasks,
  sortTasksByPriority,
  getTodayDateString,
} from './store/taskStore';
import {
  TaskList,
  TodayFocus,
  TaskFilters,
  StatusFilterType,
  SortByType,
} from './components/tasks';
import { StickyWidget } from './components/sticky';
import { CaptureInbox } from './components/inbox';
import {
  hasNotificationPermission,
  requestNotificationPermission,
  dispatchTaskReminders,
  getNotificationSettings,
  saveNotificationSettings,
} from './services/notificationService';
import { TaskPriority } from './types/task';
import {
  Sun,
  Moon,
  Plus,
  Calendar,
  CheckCircle2,
  Tag,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Pin,
  Bell,
} from 'lucide-solid';

const priorityOptions: Array<{ value: TaskPriority; label: string }> = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
];

export default function App() {
  const [viewMode, setViewMode] = createSignal<'full' | 'sticky'>('full');
  const [notifEnabled, setNotifEnabled] = createSignal(false);
  const [filter, setFilter] = createSignal<StatusFilterType>('all');
  const [priorityFilter, setPriorityFilter] = createSignal<TaskPriority | 'all'>('all');
  const [sortBy, setSortBy] = createSignal<SortByType>('recent');
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
      const today = getTodayDateString();
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

    // Inicializa preferências de notificação e dispara lembretes se habilitado
    const notifSettings = getNotificationSettings();
    if (notifSettings.enabled && hasNotificationPermission()) {
      setNotifEnabled(true);
      dispatchTaskReminders(tasks());
    }
  });

  const handleToggleNotifications = async () => {
    if (!notifEnabled()) {
      const perm = await requestNotificationPermission();
      if (perm === 'granted') {
        setNotifEnabled(true);
        saveNotificationSettings({ enabled: true, leadHours: 12 });
        dispatchTaskReminders(tasks());
      }
    } else {
      setNotifEnabled(false);
      saveNotificationSettings({ enabled: false, leadHours: 12 });
    }
  };

  const filteredTasks = createMemo(() => {
    let list = tasks();
    const f = filter();
    const p = priorityFilter();
    const s = sortBy();

    if (f === 'pending') list = list.filter((t) => t.status === 'pending');
    else if (f === 'completed') list = list.filter((t) => t.status === 'completed');
    else if (f === 'today') list = todayTasks();

    if (p !== 'all') {
      list = list.filter((t) => t.priority === p);
    }

    if (s === 'urgency') {
      list = sortTasksByPriority(list);
    }

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

      {/* Main Container or Sticky View */}
      <Show
        when={viewMode() === 'full'}
        fallback={
          <div class="fixed inset-0 p-3 sm:p-5 flex flex-col items-center justify-center sm:items-end sm:justify-start pointer-events-none z-50">
            <div class="pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
              <StickyWidget
                tasks={filteredTasks()}
                isExpandedMode={false}
                onToggleMode={() => setViewMode('full')}
                onToggleStatus={toggleTaskStatus}
                onAddTask={(title) => addTask({ title, priority: 'medium' })}
                onDelete={deleteTask}
              />
            </div>
          </div>
        }
      >
        <div class="max-w-5xl xl:max-w-6xl w-full flex flex-col space-y-6 sm:space-y-8">
        {/* Top Navbar */}
        <header class="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-800/80">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <CheckCircle2 class="w-5 h-5" />
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                TasksAnywhere
              </h1>
              <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
                Captura inteligente, modo Sticky Note e reatividade fina por Signals.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleNotifications}
              aria-label={notifEnabled() ? 'Desativar notificações' : 'Ativar notificações'}
              class={`border text-xs px-2.5 py-1.5 transition ${
                notifEnabled()
                  ? 'border-indigo-500/50 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Bell class="w-4 h-4" />
              <span class="ml-1 text-xs hidden sm:inline">
                {notifEnabled() ? 'Lembretes Ativos' : 'Lembretes'}
              </span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('sticky')}
              aria-label="Modo Sticky Note"
              class="border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-amber-500/50"
            >
              <Pin class="w-4 h-4 text-amber-500" />
              <span class="ml-1 text-xs hidden sm:inline">Modo Sticky Note</span>
            </Button>

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
        <section class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
          <Card class="p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
            <span class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Total de Tarefas</span>
            <div class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5">{tasks().length}</div>
          </Card>

          <Card class="p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
            <span class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Pendentes</span>
            <div class="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1.5">{pendingCount()}</div>
          </Card>

          <Card class="p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
            <span class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Concluídas</span>
            <div class="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1.5">{completedCount()}</div>
          </Card>

          <Card class="p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
            <span class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Taxa de Conclusão</span>
            <div class="flex items-center gap-2 mt-1.5">
              <span class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{completionRate()}%</span>
              <div class="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  class="bg-indigo-600 dark:bg-indigo-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${completionRate()}%` }}
                />
              </div>
            </div>
          </Card>
        </section>

        {/* Task Capture (Multimodal Chat Inbox & Detailed Options) */}
        <section class="space-y-3">
          <CaptureInbox onTaskCreated={addTask} />

          <form
            onSubmit={handleCreateTask}
            class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-lg space-y-3.5"
          >
            {/* Primary Input Line */}
            <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div class="relative flex-1">
                <input
                  type="text"
                  placeholder="Adicionar nova tarefa..."
                  value={newTitle()}
                  onInput={(e) => setNewTitle(e.currentTarget.value)}
                  class="w-full bg-slate-100 dark:bg-slate-950/70 text-slate-900 dark:text-slate-100 text-sm sm:text-base px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200/80 dark:border-slate-800 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 focus:outline-none transition"
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

        {/* Task Filters */}
        <section>
          <TaskFilters
            statusFilter={filter()}
            priorityFilter={priorityFilter()}
            sortBy={sortBy()}
            counts={{
              total: tasks().length,
              pending: pendingCount(),
              completed: completedCount(),
              today: todayTasks().length,
            }}
            onStatusChange={(status) => setFilter(status)}
            onPriorityChange={(priority) => setPriorityFilter(priority)}
            onSortChange={(sort) => setSortBy(sort)}
          />
        </section>

        {/* Task List / Today Focus */}
        <section>
          <Show
            when={filter() === 'today'}
            fallback={
              <TaskList
                tasks={filteredTasks()}
                expandedTaskId={expandedTaskId()}
                onToggleExpand={toggleExpand}
                onToggleStatus={toggleTaskStatus}
                onDelete={deleteTask}
                onAddSubtask={addSubtask}
                onToggleSubtask={toggleSubtask}
                onDeleteSubtask={deleteSubtask}
                emptyMessage="Nenhuma tarefa nesta visualização"
                emptyDescription="Adicione uma nova tarefa no campo acima para começar!"
              />
            }
          >
            <TodayFocus
              tasks={filteredTasks()}
              onToggleStatus={toggleTaskStatus}
              onDelete={deleteTask}
              onToggleExpand={toggleExpand}
              onAddSubtask={addSubtask}
              onToggleSubtask={toggleSubtask}
              onDeleteSubtask={deleteSubtask}
            />
          </Show>
        </section>
      </div>
      </Show>

      {/* Footer */}
      <footer class="mt-8 text-xs text-slate-400 dark:text-slate-600 text-center">
        TasksAnywhere © 2026 • Powered by SolidJS Fusion Signals • TDD Rigoroso
      </footer>
    </main>
  );
}
