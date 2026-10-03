import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';

export interface DesktopWindowOptions {
  stickyWidth?: number;
  stickyHeight?: number;
  fullWidth?: number;
  fullHeight?: number;
}

const DEFAULT_OPTIONS: Required<DesktopWindowOptions> = {
  stickyWidth: 380,
  stickyHeight: 540,
  fullWidth: 1024,
  fullHeight: 768,
};

/**
 * Detecta se a aplicação está sendo executada no runtime nativo Tauri Desktop.
 */
export function isDesktopApp(): boolean {
  return typeof window !== 'undefined' && Boolean((window as any).__TAURI_INTERNALS__);
}

/**
 * Controla o modo de janela do desktop (Task 6.2):
 * - No modo Sticky: diminui a janela física do sistema operacional para tamanho compacto (380x540)
 *   e define Always-on-Top para flutuar sobre outros aplicativos.
 * - No modo Full: restaura o tamanho de trabalho amplo (1024x768), desativa Always-on-Top e centraliza.
 */
export async function setStickyWindowMode(
  isSticky: boolean,
  options?: DesktopWindowOptions
): Promise<void> {
  if (!isDesktopApp()) return;

  try {
    const appWindow = getCurrentWindow();
    const config = { ...DEFAULT_OPTIONS, ...options };

    if (isSticky) {
      await appWindow.setSize(new LogicalSize(config.stickyWidth, config.stickyHeight));
      await appWindow.setAlwaysOnTop(true);
    } else {
      await appWindow.setSize(new LogicalSize(config.fullWidth, config.fullHeight));
      await appWindow.setAlwaysOnTop(false);
      await appWindow.center();
    }
  } catch (err) {
    console.warn('Erro ao manipular dimensões da janela desktop:', err);
  }
}

/**
 * Registra listener global para alternância rápida do modo Sticky (Task 6.2).
 * Atalho padrão: Alt+Shift+T ou Ctrl/Cmd+Shift+T.
 */
export function setupDesktopGlobalShortcut(onTrigger: () => void): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.altKey || e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'T' || e.key === 't')) {
      e.preventDefault();
      onTrigger();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown);
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleKeyDown);
    }
  };
}
