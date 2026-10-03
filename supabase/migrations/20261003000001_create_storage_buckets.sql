-- TasksAnywhere: Configuração de Bucket de Storage com Descarte Automático (Task 4.3)

-- 1. Criação do Bucket de Mídia de Tarefas (Privado)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'task-media',
    'task-media',
    true,
    10485760, -- Limite de 10MB por arquivo
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/mpeg']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/mpeg'];

-- 2. Políticas de Segurança RLS no Storage (storage.objects)
-- Cada usuário só pode fazer upload, leitura e exclusão em sua própria subpasta: /{user_id}/*

DROP POLICY IF EXISTS "Usuários podem ler suas próprias mídias" ON storage.objects;
CREATE POLICY "Usuários podem ler suas próprias mídias"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'task-media' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Usuários podem enviar suas próprias mídias" ON storage.objects;
CREATE POLICY "Usuários podem enviar suas próprias mídias"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'task-media' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Usuários podem deletar suas próprias mídias" ON storage.objects;
CREATE POLICY "Usuários podem deletar suas próprias mídias"
    ON storage.objects
    FOR DELETE
    USING (bucket_id = 'task-media' AND (storage.foldername(name))[1] = auth.uid()::text);
