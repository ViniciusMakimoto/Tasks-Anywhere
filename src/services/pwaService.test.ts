import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerServiceWorker, isStandalone } from './pwaService';

describe('PWAService (TDD - Task 2.5)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Registro do Service Worker', () => {
    it('deve retornar false se navigator.serviceWorker não estiver disponível', async () => {
      const originalNavigator = globalThis.navigator;
      // @ts-expect-error Mocking navigator without serviceWorker
      delete globalThis.navigator.serviceWorker;

      const registered = await registerServiceWorker();
      expect(registered).toBe(false);

      globalThis.navigator = originalNavigator;
    });

    it('deve registrar /sw.js com sucesso quando suportado pelo navegador', async () => {
      const mockRegister = vi.fn().mockResolvedValue({ scope: '/' });
      Object.defineProperty(globalThis.navigator, 'serviceWorker', {
        value: { register: mockRegister },
        configurable: true,
      });

      const registered = await registerServiceWorker();
      expect(mockRegister).toHaveBeenCalledWith('/sw.js');
      expect(registered).toBe(true);
    });

    it('deve capturar erro e retornar false se o registro falhar', async () => {
      const mockRegister = vi.fn().mockRejectedValue(new Error('Network error'));
      Object.defineProperty(globalThis.navigator, 'serviceWorker', {
        value: { register: mockRegister },
        configurable: true,
      });

      const registered = await registerServiceWorker();
      expect(registered).toBe(false);
    });
  });

  describe('2. Detecção de Modo Standalone / Instalado', () => {
    it('deve retornar true quando a media query display-mode: standalone estiver ativa', () => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      expect(isStandalone()).toBe(true);
    });

    it('deve retornar false em aba padrão de navegador', () => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      expect(isStandalone()).toBe(false);
    });
  });
});
