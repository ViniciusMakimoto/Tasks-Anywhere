# TasksAnywhere - Roadmap de Desenvolvimento & Tasks (TDD) 📌

> **Metodologia:** Test-Driven Development (TDD) rigoroso com o ciclo **Red $\rightarrow$ Green $\rightarrow$ Refactor**.  
> **Fontes de Contexto:** Este arquivo serve como o backlog oficial de execução do repositório, compartilhado entre desenvolvedores e agentes de IA. Sincronizado também com o `ai-memory` (`architecture/tasks-breakdown.md`).

---

## 🗺️ Fases e Detalhamento das Tasks

### Fase 1: Fundação do Frontend, Reatividade & Suite de Testes (TDD)
- [x] **Task 1.1: Setup da Aplicação & Ambiente TDD**
  - **Objetivo:** Inicializar o projeto SolidJS com TypeScript, Vite e Tailwind CSS.
  - **TDD:** Configurar **Vitest** + **@solidjs/testing-library** + **jsdom**. Criar teste de sanidade (`App.test.tsx` e `setupTests.ts`) e validar `npm test`.
  - **Critério de Aceite:** `npm run dev` roda a página de boas-vindas do SolidJS e `npm test` passa 100% dos testes.
- [x] **Task 1.2: Pipeline de Integração Contínua (GitHub Actions)**
  - **Objetivo:** Criar `.github/workflows/ci.yml` para rodar os testes e build automaticamente a cada push/PR.
  - **Critério de Aceite:** Workflow passando no GitHub.
- [x] **Task 1.3: Design System & Tokens de Estilo**
  - **Objetivo:** Criar paleta de cores moderna (tema Dark/Light, estética clean inspirada em Linear/Notion/Spotify) e ícones (Lucide Solid).
  - **TDD:** Testar troca de temas (dark/light) e renderização de componentes base (Botão, Badge, Card).
- [x] **Task 1.4: Store Reativa de Tarefas (Fusion Signals)**
  - **Objetivo:** Implementar `taskStore.ts` com gerenciamento de estado via `createSignal` e `createMemo`.
  - **TDD:** Escrever `taskStore.test.ts` testando:
    1. Criação de nova tarefa com defaults (status `pending`, prioridade `medium`).
    2. Atualização de status (concluir, reabrir, arquivar).
    3. Exclusão e edição de título/descrição/tags.
    4. Sinais derivados (`createMemo`): contagem de pendências, tarefas de hoje, tarefas por prioridade.
    5. Persistência local (LocalStorage/IndexedDB) para garantir uso offline.

---

### Fase 2: Experiência de Usuário: Layouts & Modo Sticky Note (PC & Mobile)
- [x] **Task 2.1: Cards e Lista de Tarefas**
  - **Objetivo:** Componentes de exibição das tarefas (`TaskCard`, `TaskList`) com badges de prioridade, data de vencimento e checklist de subtarefas.
  - **TDD:** `TaskCard.test.tsx` cobrindo cliques de conclusão, expansão de subtarefas e botões de ação rápida.
- [x] **Task 2.2: Visão do Dia & Filtros por Prioridade**
  - **Objetivo:** Seção "Tarefas de Hoje" (Today's Focus) e filtros por status e prioridade.
  - **TDD:** Testar filtragem de tarefas do dia e ordenação por urgência.
- [x] **Task 2.3: O Modo Sticky Note (Desktop PC)**
  - **Objetivo:** Visualizador ultra-compacto estilo widget/mini-player, sem distrações, projetado para ficar no canto da tela com botão para alternar entre "Mini Note" e "Modo Expandido".
  - **TDD:** Testar toggle de layout (compact vs expanded) e responsividade do container.
- [x] **Task 2.4: Notificações & Lembretes Antecipados**
  - **Objetivo:** Integração com Notification API do navegador/sistema com configuração global de aviso (ex: 12h antes do vencimento).
  - **TDD:** Testar cálculo de disparos de lembretes e permissão de notificações.
- [x] **Task 2.5: PWA (Mobile Ready) & CD no GitHub Pages**
  - **Objetivo:** Configuração de `manifest.json`, Service Worker para instalação no celular ("Adicionar à Tela de Início") e pipeline de CD no GitHub Actions para deploy automático no GitHub Pages a cada push na `main`.

---

### Fase 3: Captura Rápida Multimodal & Fluxo de Inbox/Chat
- [x] **Task 3.1: Inbox de Captura Rápida (Entrada estilo Chat)**
  - **Objetivo:** Interface estilo chat/barra de entrada onde mensagens, áudios e fotos geram pré-visualizações antes de confirmar a criação da tarefa.
  - **TDD:** Testar transição de estado da mensagem para rascunho de tarefa.
- [x] **Task 3.2: Gravador de Áudio Nativo**
  - **Objetivo:** Gravação pelo microfone via `navigator.mediaDevices.getUserMedia` e `MediaRecorder`. Visualizador com animação de gravação, timer e botões de envio/descarte.
  - **TDD:** Testar fluxo de gravação com mock da API de mídia, controle de estados (gravando, pausado, parado) e geração do Blob de áudio.
- [x] **Task 3.3: Captura e Upload de Imagens/Fotos**
  - **Objetivo:** Upload de arquivos, suporte a arrastar e soltar (drag & drop), colar imagem do clipboard (`Ctrl+V`) e botão para câmera no mobile.
  - **TDD:** Testar conversão de arquivo e preview da imagem antes do envio.

---

### Fase 4: Backend na Nuvem com Supabase (24/7)
- [x] **Task 4.1: Autenticação Segura (Supabase Auth)**
  - **Objetivo:** Login simples via Magic Link ou Google no Supabase, vinculando cada tarefa ao `user_id` do usuário.
  - **TDD:** Testar guards de autenticação e persistência de sessão.
- [x] **Task 4.2: Migrations SQL & Políticas RLS**
  - **Objetivo:** Script SQL criando a tabela `tasks` com chave estrangeira `user_id`, índices e políticas de isolamento RLS (*Row Level Security*).
- [ ] **Task 4.3: Storage com Descarte Automático de Mídias**
  - **Objetivo:** Buckets temporários no Supabase Storage para áudios/fotos com exclusão automática após o processamento da IA para economizar cota.
- [ ] **Task 4.4: Sincronização Realtime**
  - **Objetivo:** Conectar a store reativa do SolidJS ao Supabase Realtime para que atualizações no celular reflitam no PC instantaneamente.
- [ ] **Task 4.5: CD de Migrações do Supabase (GitHub Actions)**
  - **Objetivo:** Pipeline no GitHub Actions para aplicar migrações do banco (`supabase db push`) automaticamente em ambiente de staging/produção a cada push na `main`.

---

### Fase 5: Pipeline de IA com Gemini 3.8 Flash
- [ ] **Task 5.1: Supabase Edge Function (`/process-task-input`)**
  - **Objetivo:** Endpoint serverless seguro em TypeScript para receber mídia efêmera e acionar a API do Gemini.
- [ ] **Task 5.2: Extração Estruturada com Gemini Multimodal**
  - **Objetivo:** Processamento de áudios, imagens e textos via Gemini 3.8 Flash com Structured Outputs (JSON Schema/Zod) gerando tarefas com título, descrição, prioridade, data de vencimento e tags.
  - **TDD:** Testes de schema com Zod garantindo que formatos válidos e inválidos da IA sejam tratados sem quebrar a aplicação.
- [ ] **Task 5.3: Área de Tarefas Incompletas & Esclarecimento da IA**
  - **Objetivo:** Se a entrada for ambígua, a tarefa fica armazenada na aba "Incompletas/Rascunhos" com a pergunta da IA, permitindo responder por texto ou áudio rápido para completar a tarefa.
- [ ] **Task 5.4: CD das Edge Functions (GitHub Actions)**
  - **Objetivo:** Deploy contínuo das funções serverless da IA (`supabase functions deploy`) no Supabase via GitHub Actions secrets.

---

### Fase 6: Desktop Nativo (Tauri) & Polimento Final
- [ ] **Task 6.1: Setup do Tauri**
  - **Objetivo:** Configuração do Tauri v2 para compilar o executável Windows nativo.
- [ ] **Task 6.2: Janela Always-on-Top e Atalho Global**
  - **Objetivo:** Janela flutuante transparente/frameless com tecla de atalho global para invocar a Sticky Note de qualquer lugar.
- [ ] **Task 6.3: Build de Distribuição & CD de Releases (GitHub Actions)**
  - **Objetivo:** Geração dos instaladores nativos do Windows (`.exe` e `.msi`) via `tauri-action` e publicação automática em GitHub Releases a cada tag de versão (`v*`).
