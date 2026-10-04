import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { TaskPriority } from '../types/task';

/**
 * Schema Zod rigoroso para validação e saneamento dos Structured Outputs
 * gerados pelo Gemini (Task 5.2).
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
  audioBlob?: Blob;
  imageBlob?: Blob | File;
  duration?: number;
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
 * Converte um Blob em Base64 para envio direto ao Gemini.
 */
export async function blobToBase64(blob: Blob): Promise<{ mimeType: string; data: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const [prefix, data] = reader.result.split(',');
        const mimeType = prefix.match(/:(.*?);/)?.[1] || blob.type || 'application/octet-stream';
        resolve({ mimeType, data });
      } else {
        reject(new Error('Falha ao processar arquivo como base64'));
      }
    };
    reader.onerror = () => {
      reject(reader.error || new Error('Erro na leitura do blob'));
    };
    reader.readAsDataURL(blob);
  });
}

const SYSTEM_PROMPT = `Você é o assistente de produtividade inteligente do TasksAnywhere.
Sua missão é extrair e estruturar uma tarefa a partir de qualquer entrada (texto livre, gravação de voz ou imagem).

REGRAS OBRIGATÓRIAS:
1. Retorne estritamente um objeto JSON válido, sem markdown envolvente ou texto introdutório.
2. Campos do JSON:
   - "title": (string, obrigatório) Título conciso e objetivo da tarefa. Remova comandos como "crie uma tarefa", "anote", "lembre-me de", etc.
   - "description": (string opcional) Detalhes adicionais, notas ou transcrição da voz.
   - "priority": ("urgent" | "high" | "medium" | "low") Gravidade ou urgência detectada. Padrão "medium".
   - "dueDate": (string opcional formato YYYY-MM-DD) Se alguma data futura for identificada.
   - "tags": (array de strings) Categorias ou áreas identificadas (ex: ["trabalho", "compras"]).
   - "clarificationNeeded": (boolean) Deve ser true se o áudio estiver em silêncio/chiado sem voz discernível, ou se a instrução for ambígua.
   - "clarificationQuestion": (string opcional) Pergunta se clarificationNeeded for true.
3. Para áudio silencioso/inaudível:
   - title: "Áudio sem voz detectada"
   - description: "Não foi possível identificar nenhuma fala no áudio gravado."
   - clarificationNeeded: true
   - clarificationQuestion: "Não detectei voz no áudio gravado. Poderia repetir ou digitar a tarefa?"
`;

/**
 * Chamada direta à API do Google Gemini (gemini-3.5-flash com fallback).
 */
export async function callGeminiDirect(input: MultimodalInput): Promise<ExtractedTaskResult | null> {
  const apiKey = import.meta.env?.VITE_GEMINI_API_KEY || '';

  if (!apiKey) return null;

  const parts: any[] = [{ text: SYSTEM_PROMPT }];

  if (input.text) {
    parts.push({ text: `Entrada do usuário: "${input.text}"` });
  }

  if (input.audioBlob) {
    try {
      const { mimeType, data } = await blobToBase64(input.audioBlob);
      parts.push({
        text: 'Analise o áudio a seguir, transcreva a fala e extraia a tarefa correspondente:',
      });
      parts.push({
        inlineData: {
          mimeType: mimeType.includes('audio') ? mimeType : 'audio/webm',
          data,
        },
      });
    } catch (err) {
      console.warn('Erro ao codificar áudio para base64:', err);
    }
  }

  if (input.imageBlob) {
    try {
      const { mimeType, data } = await blobToBase64(input.imageBlob);
      parts.push({
        text: 'Analise a imagem a seguir e extraia a tarefa correspondente:',
      });
      parts.push({
        inlineData: {
          mimeType: mimeType.includes('image') ? mimeType : 'image/png',
          data,
        },
      });
    } catch (err) {
      console.warn('Erro ao codificar imagem para base64:', err);
    }
  }

  // Modelos candidatos em ordem de prioridade
  const candidateModels = [
    'gemini-3.5-flash',
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-flash-latest',
  ];

  for (const model of candidateModels) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts }] }),
        }
      );

      if (!response.ok) {
        continue;
      }

      const json = await response.json();
      const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;

      // Limpar blocos de código markdown se o modelo envolver em ```json ... ```
      const cleaned = rawText
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      const parsedJson = JSON.parse(cleaned);
      const validation = parseAiTaskResponse(parsedJson);
      if (validation.success && validation.data) {
        return validation.data;
      }
    } catch {
      // Tenta o próximo modelo
      continue;
    }
  }

  return null;
}

/**
 * Envia o input multimodal (texto, áudio ou imagem) para processamento por IA.
 * Em ambiente de testes (Vitest), invoca o mock da Edge Function (Task 5.1).
 * Em ambiente real, processa com Gemini multimodal com máxima velocidade e inteligência.
 */
export async function processMultimodalInput(input: MultimodalInput): Promise<ExtractedTaskResult> {
  // Se estiver em ambiente de teste automatizado unitário (Vitest), prioriza mock da Edge Function
  const isVitest = typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'test';

  if (!isVitest) {
    try {
      const directResult = await callGeminiDirect(input);
      if (directResult) {
        return directResult;
      }
    } catch (err) {
      console.warn('Falha no processamento direto pelo Gemini, tentando Edge Function:', err);
    }
  }

  // Tentativa via Supabase Edge Function
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

  // Fallback seguro caso backend e IA estejam temporariamente inacessíveis
  const fallbackTitle = input.text?.trim() || (input.audioBlob ? 'Gravação de voz' : 'Nova tarefa capturada');
  return {
    title: fallbackTitle,
    priority: 'medium',
    tags: input.audioBlob ? ['áudio'] : input.imageBlob ? ['imagem'] : ['inbox'],
    clarificationNeeded: false,
  };
}
