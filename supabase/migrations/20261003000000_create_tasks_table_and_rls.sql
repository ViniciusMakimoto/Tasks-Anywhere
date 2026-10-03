-- TasksAnywhere: Migração Inicial da Tabela de Tarefas e Políticas RLS (Task 4.2)

-- 1. Criação da Tabela de Tarefas
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'archived')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date DATE,
    tags TEXT[] NOT NULL DEFAULT '{}',
    subtasks JSONB NOT NULL DEFAULT '[]'::jsonb,
    source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'audio', 'image', 'chat')),
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Índices de Otimização para Consultas Recorrentes
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks (user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks (due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks (priority);

-- 3. Trigger para Atualização Automática de updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_tasks_updated_at ON public.tasks;
CREATE TRIGGER trigger_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Habilitação de Segurança em Nível de Linha (Row Level Security - RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Isolamento RLS (Cada usuário acessa apenas seus próprios registros)
DROP POLICY IF EXISTS "Usuários podem ler suas próprias tarefas" ON public.tasks;
CREATE POLICY "Usuários podem ler suas próprias tarefas"
    ON public.tasks
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem criar suas próprias tarefas" ON public.tasks;
CREATE POLICY "Usuários podem criar suas próprias tarefas"
    ON public.tasks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias tarefas" ON public.tasks;
CREATE POLICY "Usuários podem atualizar suas próprias tarefas"
    ON public.tasks
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem excluir suas próprias tarefas" ON public.tasks;
CREATE POLICY "Usuários podem excluir suas próprias tarefas"
    ON public.tasks
    FOR DELETE
    USING (auth.uid() = user_id);

-- 6. Adiciona a tabela à publicação Realtime do Supabase
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'tasks'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
    END IF;
END $$;
