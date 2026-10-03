export async function registerServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  if (!('serviceWorker' in navigator) || !navigator.serviceWorker) {
    return false;
  }

  try {
    await navigator.serviceWorker.register('/sw.js');
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
