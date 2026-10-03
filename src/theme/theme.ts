import { createSignal } from 'solid-js';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'tasksanywhere_theme';

const [theme, setThemeState] = createSignal<Theme>('dark');

function applyThemeToDOM(currentTheme: Theme) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.classList.remove('dark', 'light');
  root.classList.add(currentTheme);
  root.setAttribute('data-theme', currentTheme);
  root.style.colorScheme = currentTheme;
}

export function initTheme(): Theme {
  let initialTheme: Theme = 'dark';

  if (typeof window !== 'undefined' && window.localStorage) {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === 'dark' || stored === 'light') {
      initialTheme = stored;
    }
  }

  setThemeState(initialTheme);
  applyThemeToDOM(initialTheme);
  return initialTheme;
}

export function setTheme(newTheme: Theme) {
  setThemeState(newTheme);
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(STORAGE_KEY, newTheme);
  }
  applyThemeToDOM(newTheme);
}

export function toggleTheme() {
  const nextTheme = theme() === 'dark' ? 'light' : 'dark';
  setTheme(nextTheme);
}

export { theme };
