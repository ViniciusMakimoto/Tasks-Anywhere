import { supabase } from '../lib/supabase';

export const MEDIA_BUCKET_NAME = 'task-media';

export interface UploadMediaResult {
  path: string | null;
  publicUrl: string | null;
  error: Error | null;
}

/**
 * Realiza upload de áudio ou imagem efêmera no bucket Supabase Storage,
 * organizando por pasta do usuário e timestamp único.
 */
export async function uploadEphemeralMedia(
  fileOrBlob: File | Blob,
  userId: string,
  folder: 'audio' | 'image'
): Promise<UploadMediaResult> {
  try {
    const ext = fileOrBlob.type.includes('webm')
      ? 'webm'
      : fileOrBlob.type.includes('png')
      ? 'png'
      : fileOrBlob.type.includes('webp')
      ? 'webp'
      : 'jpg';

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const filePath = `${userId}/${folder}/${timestamp}_${random}.${ext}`;

    const { data, error } = await supabase.storage
      .from(MEDIA_BUCKET_NAME)
      .upload(filePath, fileOrBlob, {
        contentType: fileOrBlob.type || 'application/octet-stream',
        upsert: true,
      });

    if (error || !data) {
      return { path: null, publicUrl: null, error: new Error(error?.message || 'Falha no upload de mídia') };
    }

    const { data: urlData } = supabase.storage
      .from(MEDIA_BUCKET_NAME)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      publicUrl: urlData?.publicUrl || null,
      error: null,
    };
  } catch (err: any) {
    return {
      path: null,
      publicUrl: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}

/**
 * Remove um arquivo de mídia efêmera do bucket do Supabase.
 */
export async function deleteEphemeralMedia(path: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.storage.from(MEDIA_BUCKET_NAME).remove([path]);
    if (error) {
      return { error: new Error(error.message) };
    }
    return { error: null };
  } catch (err: any) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Agenda o descarte automático do arquivo temporário após um atraso (ex: após a IA concluir o processamento),
 * liberando cota de armazenamento no Supabase Storage.
 */
export async function cleanupEphemeralMediaAfterDelay(path: string, delayMs: number = 60000): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        await deleteEphemeralMedia(path);
      } catch (e) {
        console.warn('Falha no descarte automático de mídia:', e);
      } finally {
        resolve();
      }
    }, delayMs);
  });
}
