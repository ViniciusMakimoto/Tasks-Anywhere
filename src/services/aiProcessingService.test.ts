import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parseAiTaskResponse,
  processMultimodalInput,
  ExtractedTaskResult,
} from './aiProcessingService';
import { supabase } from '../lib/supabase';

vi.mock('../lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('AI Processing Service & Zod Schema (TDD - Tasks 5.1 & 5.2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Validação de Schema Zod (parseAiTaskResponse)', () => {
    it('deve parsear com sucesso uma resposta completa estruturada da IA', () => {
      const rawAiResponse = {
        title: 'Revisar relatório trimestral de finanças',
        description: 'Verificar tabelas de custos operacionais e margem bruta',
        priority: 'high',
        dueDate: '2026-10-04',
        tags: ['finanças', 'relatório', 'urgente'],
        clarificationNeeded: false,
      };

      const result = parseAiTaskResponse(rawAiResponse);

      expect(result.success).toBe(true);
      if (!result.success) throw new Error(result.error);

      expect(result.data.title).toBe('Revisar relatório trimestral de finanças');
      expect(result.data.priority).toBe('high');
      expect(result.data.dueDate).toBe('2026-10-04');
      expect(result.data.tags).toEqual(['finanças', 'relatório', 'urgente']);
      expect(result.data.clarificationNeeded).toBe(false);
    });

    it('deve aplicar defaults seguros quando campos opcionais estiverem ausentes', () => {
      const minimalAiResponse = {
        title: 'Comprar frutas na feira',
      };

      const result = parseAiTaskResponse(minimalAiResponse);

      expect(result.success).toBe(true);
      if (!result.success) throw new Error(result.error);

      expect(result.data.title).toBe('Comprar frutas na feira');
      expect(result.data.priority).toBe('medium');
      expect(result.data.tags).toEqual([]);
      expect(result.data.clarificationNeeded).toBe(false);
      expect(result.data.clarificationQuestion).toBeUndefined();
    });

    it('deve reconhecer quando a IA sinaliza que a tarefa precisa de esclarecimento', () => {
      const ambiguousAiResponse = {
        title: 'Comprar aquilo',
        clarificationNeeded: true,
        clarificationQuestion: 'O que exatamente você gostaria de comprar e para quando?',
      };

      const result = parseAiTaskResponse(ambiguousAiResponse);

      expect(result.success).toBe(true);
      if (!result.success) throw new Error(result.error);

      expect(result.data.clarificationNeeded).toBe(true);
      expect(result.data.clarificationQuestion).toBe(
        'O que exatamente você gostaria de comprar e para quando?'
      );
    });

    it('deve rejeitar e retornar erro quando o título estiver ausente ou vazio', () => {
      const invalidResponse = {
        priority: 'urgent',
        tags: ['teste'],
      };

      const result = parseAiTaskResponse(invalidResponse);

      expect(result.success).toBe(false);
      if (result.success) throw new Error('Deveria ter falhado');
      expect(result.error).toBeTruthy();
    });

    it('deve normalizar prioridades inválidas ou não reconhecidas para medium', () => {
      const weirdPriorityResponse = {
        title: 'Fazer backup',
        priority: 'super_mega_urgente',
      };

      const result = parseAiTaskResponse(weirdPriorityResponse);

      expect(result.success).toBe(true);
      if (!result.success) throw new Error(result.error);
      expect(result.data.priority).toBe('medium');
    });
  });

  describe('2. Invocação da Edge Function (processMultimodalInput)', () => {
    it('deve chamar a Edge Function /process-task-input do Supabase com o payload correto', async () => {
      const mockResult: ExtractedTaskResult = {
        title: 'Enviar e-mail para diretoria',
        priority: 'urgent',
        tags: ['comunicação'],
        clarificationNeeded: false,
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: mockResult,
        error: null,
      } as any);

      const input = {
        text: 'Avisar diretoria com urgência sobre reunião amanhã',
      };

      const result = await processMultimodalInput(input);

      expect(supabase.functions.invoke).toHaveBeenCalledWith('process-task-input', {
        body: input,
      });
      expect(result.title).toBe('Enviar e-mail para diretoria');
      expect(result.priority).toBe('urgent');
    });

    it('deve gerar rascunho de fallback limpo se a Edge Function falhar', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: null,
        error: new Error('Edge function timeout'),
      } as any);

      const input = {
        text: 'Lembrar de comprar pão amanhã',
      };

      const result = await processMultimodalInput(input);

      // Garante que mesmo com falha do backend, o usuário não perde o que digitou
      expect(result.title).toBe('Lembrar de comprar pão amanhã');
      expect(result.priority).toBe('medium');
      expect(result.tags).toEqual(['inbox']);
    });
  });
});
