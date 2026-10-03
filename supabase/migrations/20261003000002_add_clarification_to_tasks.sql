-- Adiciona colunas para suporte a esclarecimento da IA (Task 5.3)
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS clarification_needed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS clarification_question TEXT;

-- Índice para busca rápida de tarefas incompletas/rascunhos
CREATE INDEX IF NOT EXISTS idx_tasks_clarification ON public.tasks (user_id, clarification_needed);
