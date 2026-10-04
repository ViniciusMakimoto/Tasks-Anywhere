export async function registerServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  if (!('serviceWorker' in navigator) || !navigator.serviceWorker) {
    return false;
  }

  try {
    const rawBase = import.meta.env?.BASE_URL || '/';
    const cleanBase = rawBase === '/' ? '' : rawBase.replace(/\/$/, '');
    const swPath = `${cleanBase}/sw.js`;
    await navigator.serviceWorker.register(swPath);
    return true;
  } catch (err) {
    console.error('Falha ao registrar Service Worker PWA:', err);
    return false;
  }
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const isStandaloneMedia = window.matchMedia?.('(display-mode: standalone)').matches;
  const isIOSStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;

  return Boolean(isStandaloneMedia || isIOSStandalone);
}
