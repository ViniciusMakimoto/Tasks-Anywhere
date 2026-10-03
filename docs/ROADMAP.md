# TasksAnywhere - Roadmap de Desenvolvimento & Tasks (TDD) 📌

> **Metodologia:** Test-Driven Development (TDD) rigoroso com o ciclo **Red $\rightarrow$ Green $\rightarrow$ Refactor**.  
> **Fontes de Contexto:** Este arquivo serve como o backlog oficial de execução do repositório, compartilhado entre desenvolvedores e agentes de IA. Sincronizado também com o `ai-memory` (`architecture/tasks-breakdown.md`).

---

## 🗺️ Fases e Detalhamento das Tasks

### Fase 1: Fundação do Frontend, Reatividade & Suite de Testes (TDD)
- [ ] **Task 1.1: Setup da Aplicação & Ambiente TDD**
  - **Objetivo:** Inicializar o projeto SolidJS com TypeScript, Vite e Tailwind CSS.
  - **TDD:** Configurar **Vitest** + **@solidjs/testing-library** + **jsdom**. Criar teste de sanidade (`App.test.tsx` e `setupTests.ts`) e validar `npm test`.
  - **Critério de Aceite:** `npm run dev` roda a página de boas-vindas do SolidJS e `npm test` passa 100% dos testes.
- [ ] **Task 1.2: Design System & Tokens de Estilo**
  - **Objetivo:** Criar paleta de cores moderna (tema Dark/Light, estética clean inspirada em Linear/Notion/Spotify) e ícones (Lucide Solid).
  - **TDD:** Testar troca de temas (dark/light) e renderização de componentes base (Botão, Badge, Card).
- [ ] **Task 1.3: Store Reativa de Tarefas (Fusion Signals)**
  - **Objetivo:** Implementar `taskStore.ts` com gerenciamento de estado via `createSignal` e `createMemo`.
  - **TDD:** Escrever `taskStore.test.ts` testando:
    1. Criação de nova tarefa com defaults (status `pending`, prioridade `medium`).
    2. Atualização de status (concluir, reabrir, arquivar).
    3. Exclusão e edição de título/descrição/tags.
    4. Sinais derivados (`createMemo`): contagem de pendências, tarefas de hoje, tarefas por prioridade.
    5. Persistência local (LocalStorage/IndexedDB) para garantir uso offline.

---

### Fase 2: Experiência de Usuário: Layouts & Modo Sticky Note (PC & Mobile)
- [ ] **Task 2.1: Cards e Lista de Tarefas**
  - **Objetivo:** Componentes de exibição das tarefas (`TaskCard`, `TaskList`) com badges de prioridade, data de vencimento e checklist de subtarefas.
  - **TDD:** `TaskCard.test.tsx` cobrindo cliques de conclusão, expansão de subtarefas e botões de ação rápida.
- [ ] **Task 2.2: Filtros e Modos de Visualização**
  - **Objetivo:** Filtros por status (Pendentes, Hoje, Concluídas) e modos de ordenação (por prioridade, por data).
  - **TDD:** Testar alternância de filtros e filtragem correta da lista.
- [ ] **Task 2.3: O Modo Sticky Note (Desktop PC)**
  - **Objetivo:** Visualizador ultra-compacto estilo widget/mini-player, sem distrações, projetado para ficar no canto da tela com botão para alternar entre "Mini Note" e "Modo Expandido".
  - **TDD:** Testar toggle de layout (compact vs expanded) e responsividade do container.
- [ ] **Task 2.4: PWA (Mobile Ready)**
  - **Objetivo:** Configuração de `manifest.json` e Service Worker para instalação no celular ("Adicionar à Tela de Início").

---

### Fase 3: Captura Rápida Multimodal (Texto, Áudio e Imagem)
- [ ] **Task 3.1: Input Rápido de Texto**
  - **Objetivo:** Campo de captura rápida com atalhos de teclado (`Enter` para salvar, foco automático).
  - **TDD:** Testar submissão com texto válido e bloqueio de inputs vazios.
- [ ] **Task 3.2: Gravador de Áudio Nativo**
  - **Objetivo:** Gravação pelo microfone via `navigator.mediaDevices.getUserMedia` e `MediaRecorder`. Visualizador com animação de gravação, timer e botões de envio/descarte.
  - **TDD:** Testar fluxo de gravação com mock da API de mídia, controle de estados (gravando, pausado, parado) e geração do Blob de áudio.
- [ ] **Task 3.3: Captura e Upload de Imagens/Fotos**
  - **Objetivo:** Upload de arquivos, suporte a arrastar e soltar (drag & drop), colar imagem do clipboard (`Ctrl+V`) e botão para câmera no mobile.
  - **TDD:** Testar conversão de arquivo e preview da imagem antes do envio.

---

### Fase 4: Backend na Nuvem com Supabase (24/7)
- [ ] **Task 4.1: Migrations SQL & Storage Buckets**
  - **Objetivo:** Script SQL criando a tabela `tasks`, índices e políticas de segurança RLS (*Row Level Security*), além dos buckets `task-audios` e `task-images`.
- [ ] **Task 4.2: Integração do Cliente Supabase no Frontend**
  - **Objetivo:** Conectar a store reativa do SolidJS ao Supabase com tipos gerados (`supabase gen types typescript`).
  - **TDD:** Testar sincronização da store com mock do client Supabase.
- [ ] **Task 4.3: Realtime Subscriptions**
  - **Objetivo:** Escutar eventos de `INSERT`, `UPDATE` e `DELETE` em tempo real para sincronização instantânea entre celular e PC.

---

### Fase 5: Pipeline de IA com Gemini 2.0 Flash
- [ ] **Task 5.1: Supabase Edge Function (`/process-task-input`)**
  - **Objetivo:** Endpoint serverless seguro em TypeScript para orquestrar o envio para a API de IA.
- [ ] **Task 5.2: Extração Estruturada com Gemini Multimodal**
  - **Objetivo:** Processamento de áudios, imagens e textos via Gemini 2.0 Flash com Structured Outputs (JSON Schema/Zod) gerando tarefas com título, descrição, prioridade, data de vencimento e tags.
  - **TDD:** Testes de schema com Zod garantindo que formatos válidos e inválidos da IA sejam tratados sem quebrar a aplicação.
- [ ] **Task 5.3: Fallback de Contexto & Perguntas de Esclarecimento**
  - **Objetivo:** Tratar entradas vagas (ex: "comprar aquele negócio"), gerando a tarefa com flag `needs_clarification: true` e a pergunta formulada pela IA.

---

### Fase 6: Desktop Nativo (Tauri) & Polimento Final
- [ ] **Task 6.1: Setup do Tauri**
  - **Objetivo:** Configuração do Tauri v2 para compilar o executável Windows nativo.
- [ ] **Task 6.2: Janela Always-on-Top e Atalho Global**
  - **Objetivo:** Janela flutuante transparente/frameless com tecla de atalho global para invocar a Sticky Note de qualquer lugar.
- [ ] **Task 6.3: Build de Distribuição & Fechamento**
  - **Objetivo:** Geração dos instaladores e documentação final no `ai-memory`.
