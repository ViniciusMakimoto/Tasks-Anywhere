import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { TaskPriority } from '../types/task';

/**
 * Schema Zod rigoroso para validação e saneamento dos Structured Outputs
 * gerados pelo Gemini 3.8 Flash (Task 5.2).
 */
export const RawAiTaskSchema = z.object({
  title: z.string().min(1, 'Título não pode ser vazio'),
  description: z.string().optional().nullable().transform((v) => v ?? undefined),
  priority: z
    .enum(['low', 'medium', 'high', 'urgent'])
    .catch('medium')
    .default('medium'),
  dueDate: z.string().optional().nullable().transform((v) => v ?? undefined),
  tags: z.array(z.string()).optional().default([]),
  clarificationNeeded: z.boolean().optional().default(false),
  clarificationQuestion: z.string().optional().nullable().transform((v) => v ?? undefined),
});

export type ExtractedTaskResult = {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
  tags: string[];
  clarificationNeeded: boolean;
  clarificationQuestion?: string;
};

export interface MultimodalInput {
  text?: string;
  audioUrl?: string;
  imageUrl?: string;
}

export type ParseAiTaskResponseResult =
  | { success: true; data: ExtractedTaskResult }
  | { success: false; error: string };

/**
 * Valida o JSON retornado pela IA utilizando Zod.
 * Garante consistência de tipos e fallback para campos ausentes.
 */
export function parseAiTaskResponse(rawJson: unknown): ParseAiTaskResponseResult {
  try {
    const parsed = RawAiTaskSchema.parse(rawJson);
    return {
      success: true,
      data: {
        title: parsed.title,
        description: parsed.description,
        priority: parsed.priority as TaskPriority,
        dueDate: parsed.dueDate,
        tags: parsed.tags,
        clarificationNeeded: parsed.clarificationNeeded,
        clarificationQuestion: parsed.clarificationQuestion,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err instanceof z.ZodError ? err.issues.map((e) => e.message).join(', ') : String(err),
    };
  }
}

/**
 * Envia o input multimodal (texto, áudio efêmero ou imagem efêmera)
 * para a Supabase Edge Function 'process-task-input' (Task 5.1).
 * Implementa fallback inteligente para não perder a entrada do usuário em caso de falha de rede.
 */
export async function processMultimodalInput(input: MultimodalInput): Promise<ExtractedTaskResult> {
  try {
    const { data, error } = await supabase.functions.invoke('process-task-input', {
      body: input,
    });

    if (!error && data) {
      const parsed = parseAiTaskResponse(data);
      if (parsed.success && parsed.data) {
        return parsed.data;
      }
    }
  } catch (err) {
    console.warn('Erro ao processar com IA via Edge Function, utilizando fallback:', err);
  }

  // Fallback seguro caso backend esteja temporariamente inacessível
  const fallbackTitle = input.text?.trim() || 'Nova tarefa capturada';
  return {
    title: fallbackTitle,
    priority: 'medium',
    tags: ['inbox'],
    clarificationNeeded: false,
  };
}
