import { describe, it, expect } from 'vitest';
import {
  isValidImageFile,
  fileToDataUrl,
  extractImageFromClipboard,
  MAX_IMAGE_SIZE_BYTES,
} from './mediaService';

describe('MediaService (TDD - Task 3.3)', () => {
  describe('1. Validação de Arquivo de Imagem (isValidImageFile)', () => {
    it('deve retornar true para arquivos PNG, JPEG, WEBP válidos dentro do limite', () => {
      const validPng = new File(['dummy-content'], 'foto.png', { type: 'image/png' });
      const validJpg = new File(['dummy-content'], 'foto.jpg', { type: 'image/jpeg' });
      const validWebp = new File(['dummy-content'], 'foto.webp', { type: 'image/webp' });

      expect(isValidImageFile(validPng)).toBe(true);
      expect(isValidImageFile(validJpg)).toBe(true);
      expect(isValidImageFile(validWebp)).toBe(true);
    });

    it('deve retornar false para arquivos não suportados (ex: PDF, texto, executável)', () => {
      const pdf = new File(['dummy-content'], 'doc.pdf', { type: 'application/pdf' });
      const text = new File(['dummy-content'], 'nota.txt', { type: 'text/plain' });

      expect(isValidImageFile(pdf)).toBe(false);
      expect(isValidImageFile(text)).toBe(false);
    });

    it('deve retornar false para imagens que excedam o limite máximo permitido', () => {
      // Cria mock de arquivo maior que MAX_IMAGE_SIZE_BYTES
      const hugeFile = new File([''], 'huge.jpg', { type: 'image/jpeg' });
      Object.defineProperty(hugeFile, 'size', { value: MAX_IMAGE_SIZE_BYTES + 1024 });

      expect(isValidImageFile(hugeFile)).toBe(false);
    });
  });

  describe('2. Conversão para DataURL (fileToDataUrl)', () => {
    it('deve converter um Blob/File em string DataURL base64 para preview', async () => {
      const file = new File(['conteudo-de-teste'], 'preview.png', { type: 'image/png' });
      const dataUrl = await fileToDataUrl(file);

      expect(dataUrl).toBeTypeOf('string');
      expect(dataUrl.startsWith('data:image/png;base64,')).toBe(true);
    });
  });

  describe('3. Extração de Imagem do Clipboard (extractImageFromClipboard)', () => {
    it('deve retornar File quando clipboardData contiver um item do tipo imagem', () => {
      const mockFile = new File(['imagem-clipboard'], 'clipboard.png', { type: 'image/png' });
      const mockItem = {
        type: 'image/png',
        getAsFile: () => mockFile,
      };

      const mockDataTransfer = {
        items: [mockItem],
      } as unknown as DataTransfer;

      const result = extractImageFromClipboard(mockDataTransfer);
      expect(result).toBe(mockFile);
    });

    it('deve retornar null quando clipboardData não contiver arquivos de imagem', () => {
      const mockItem = {
        type: 'text/plain',
        getAsFile: () => null,
      };

      const mockDataTransfer = {
        items: [mockItem],
      } as unknown as DataTransfer;

      const result = extractImageFromClipboard(mockDataTransfer);
      expect(result).toBeNull();
    });

    it('deve retornar null se clipboardData for null ou vazio', () => {
      expect(extractImageFromClipboard(null)).toBeNull();
    });
  });
});
