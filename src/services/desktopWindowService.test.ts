import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isDesktopApp,
  setStickyWindowMode,
  setupDesktopGlobalShortcut,
} from './desktopWindowService';

// Mock do módulo @tauri-apps/api/window
vi.mock('@tauri-apps/api/window', () => {
  const mockSetSize = vi.fn().mockResolvedValue(undefined);
  const mockSetAlwaysOnTop = vi.fn().mockResolvedValue(undefined);
  const mockCenter = vi.fn().mockResolvedValue(undefined);

  class MockLogicalSize {
    width: number;
    height: number;
    constructor(width: number, height: number) {
      this.width = width;
      this.height = height;
    }
  }

  return {
    getCurrentWindow: vi.fn(() => ({
      setSize: mockSetSize,
      setAlwaysOnTop: mockSetAlwaysOnTop,
      center: mockCenter,
    })),
    LogicalSize: MockLogicalSize,
    mockSetSize,
    mockSetAlwaysOnTop,
    mockCenter,
  };
});

describe('DesktopWindowService (TDD - Tasks 6.1 & 6.2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as any).__TAURI_INTERNALS__;
  });

  describe('1. Detecção do Ambiente Desktop', () => {
    it('deve retornar false quando executado no navegador padrão', () => {
      expect(isDesktopApp()).toBe(false);
    });

    it('deve retornar true quando __TAURI_INTERNALS__ estiver presente na janela', () => {
      (window as any).__TAURI_INTERNALS__ = {};
      expect(isDesktopApp()).toBe(true);
    });
  });

  describe('2. Redimensionamento e Modo Always-on-Top (Task 6.2)', () => {
    it('deve redimensionar a janela para tamanho compacto e ativar always-on-top no modo sticky', async () => {
      (window as any).__TAURI_INTERNALS__ = {};
      const { mockSetSize, mockSetAlwaysOnTop } = await import('@tauri-apps/api/window') as any;

      await setStickyWindowMode(true);

      expect(mockSetSize).toHaveBeenCalled();
      const passedSize = mockSetSize.mock.calls[0][0];
      expect(passedSize.width).toBe(380);
      expect(passedSize.height).toBe(540);
      expect(mockSetAlwaysOnTop).toHaveBeenCalledWith(true);
    });

    it('deve restaurar a janela para tamanho padrão e desativar always-on-top ao sair do modo sticky', async () => {
      (window as any).__TAURI_INTERNALS__ = {};
      const { mockSetSize, mockSetAlwaysOnTop, mockCenter } = await import('@tauri-apps/api/window') as any;

      await setStickyWindowMode(false);

      expect(mockSetSize).toHaveBeenCalled();
      const passedSize = mockSetSize.mock.calls[0][0];
      expect(passedSize.width).toBe(1024);
      expect(passedSize.height).toBe(768);
      expect(mockSetAlwaysOnTop).toHaveBeenCalledWith(false);
      expect(mockCenter).toHaveBeenCalled();
    });

    it('não deve lançar exceção ao chamar setStickyWindowMode em ambiente web não-Tauri', async () => {
      // Sem __TAURI_INTERNALS__
      await expect(setStickyWindowMode(true)).resolves.not.toThrow();
      await expect(setStickyWindowMode(false)).resolves.not.toThrow();
    });
  });

  describe('3. Atalho Global (Task 6.2)', () => {
    it('deve registrar handler de atalho no teclado para desktop e web (Alt+Shift+T ou Ctrl+Shift+T)', () => {
      const callback = vi.fn();
      const cleanup = setupDesktopGlobalShortcut(callback);

      expect(typeof cleanup).toBe('function');

      // Simula evento de teclado no navegador
      const event = new KeyboardEvent('keydown', {
        key: 'T',
        altKey: true,
        shiftKey: true,
      });
      window.dispatchEvent(event);

      expect(callback).toHaveBeenCalledTimes(1);

      cleanup();

      // Após cleanup, não deve chamar mais
      window.dispatchEvent(event);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
