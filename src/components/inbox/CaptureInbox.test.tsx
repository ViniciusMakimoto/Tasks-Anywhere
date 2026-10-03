import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CaptureInbox, parseMessageToDraft } from './CaptureInbox';

describe('CaptureInbox Component (TDD - Task 3.1)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Parser de Mensagens de Chat (parseMessageToDraft)', () => {
    it('deve extrair título simples com prioridade média por padrão', () => {
      const draft = parseMessageToDraft('Comprar ração para o cachorro');
      expect(draft.title).toBe('Comprar ração para o cachorro');
      expect(draft.priority).toBe('medium');
      expect(draft.tags).toEqual([]);
      expect(draft.source).toBe('chat');
    });

    it('deve extrair tags a partir de hashtags (#dev, #urgente)', () => {
      const draft = parseMessageToDraft('Refatorar store reativa #dev #solid');
      expect(draft.title).toBe('Refatorar store reativa');
      expect(draft.tags).toEqual(['dev', 'solid']);
    });

    it('deve detectar prioridade por palavras-chave (!urgente, urgente, importante)', () => {
      const draftUrgent = parseMessageToDraft('Corrigir bug crítico de produção urgente');
      expect(draftUrgent.priority).toBe('urgent');

      const draftHigh = parseMessageToDraft('Revisar apresentação para diretoria importante');
      expect(draftHigh.priority).toBe('high');

      const draftLow = parseMessageToDraft('Pesquisar novos teclados !baixa');
      expect(draftLow.priority).toBe('low');
    });

    it('deve separar a primeira linha como título e as demais como descrição', () => {
      const input = 'Planejar sprint 3\nDefinir entregas da Fase 3 e critérios de aceite.';
      const draft = parseMessageToDraft(input);

      expect(draft.title).toBe('Planejar sprint 3');
      expect(draft.description).toBe('Definir entregas da Fase 3 e critérios de aceite.');
    });
  });

  describe('2. Interface de Entrada estilo Chat', () => {
    it('renderiza o campo de entrada estilo chat e botões de ação', () => {
      render(() => <CaptureInbox onTaskCreated={vi.fn()} />);

      expect(screen.getByPlaceholderText(/Digite sua tarefa, use #tags ou grave um áudio/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Gravar áudio/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Anexar imagem/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Enviar mensagem/i })).toBeInTheDocument();
    });

    it('ao digitar e enviar mensagem, exibe card de rascunho com pré-visualização', async () => {
      render(() => <CaptureInbox onTaskCreated={vi.fn()} />);

      const input = screen.getByPlaceholderText(/Digite sua tarefa/i);
      await fireEvent.input(input, { target: { value: 'Testar gravação de áudio #multimodal urgente' } });

      const sendBtn = screen.getByRole('button', { name: /Enviar mensagem/i });
      await fireEvent.click(sendBtn);

      expect(screen.getByText(/Pré-visualização do Rascunho/i)).toBeInTheDocument();
      expect(screen.getByText('Testar gravação de áudio')).toBeInTheDocument();
      expect(screen.getByText('multimodal')).toBeInTheDocument();
      expect(screen.getByText(/Urgente/i)).toBeInTheDocument();
    });

    it('ao confirmar o rascunho, dispara onTaskCreated e limpa a visualização', async () => {
      const handleTaskCreated = vi.fn();
      render(() => <CaptureInbox onTaskCreated={handleTaskCreated} />);

      const input = screen.getByPlaceholderText(/Digite sua tarefa/i);
      await fireEvent.input(input, { target: { value: 'Comprar pão de queijo #casa' } });

      const sendBtn = screen.getByRole('button', { name: /Enviar mensagem/i });
      await fireEvent.click(sendBtn);

      const confirmBtn = screen.getByRole('button', { name: /Confirmar e Criar Tarefa/i });
      await fireEvent.click(confirmBtn);

      expect(handleTaskCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Comprar pão de queijo',
          tags: ['casa'],
          priority: 'medium',
          source: 'chat',
        })
      );

      expect(screen.queryByText(/Pré-visualização do Rascunho/i)).not.toBeInTheDocument();
    });

    it('ao descartar o rascunho, remove a pré-visualização sem criar tarefa', async () => {
      const handleTaskCreated = vi.fn();
      render(() => <CaptureInbox onTaskCreated={handleTaskCreated} />);

      const input = screen.getByPlaceholderText(/Digite sua tarefa/i);
      await fireEvent.input(input, { target: { value: 'Ideia descartável' } });

      const sendBtn = screen.getByRole('button', { name: /Enviar mensagem/i });
      await fireEvent.click(sendBtn);

      const discardBtn = screen.getByRole('button', { name: /Descartar rascunho/i });
      await fireEvent.click(discardBtn);

      expect(handleTaskCreated).not.toHaveBeenCalled();
      expect(screen.queryByText(/Pré-visualização do Rascunho/i)).not.toBeInTheDocument();
    });

    it('ao clicar no botão de anexar imagem, exibe o componente ImageUploader', async () => {
      render(() => <CaptureInbox onTaskCreated={vi.fn()} />);

      const attachBtn = screen.getByRole('button', { name: /Anexar imagem/i });
      await fireEvent.click(attachBtn);

      expect(screen.getByRole('region', { name: /Área de captura de imagem/i })).toBeInTheDocument();
      expect(screen.getByText(/Clique para selecionar ou arraste uma foto aqui/i)).toBeInTheDocument();
    });
  });
});
