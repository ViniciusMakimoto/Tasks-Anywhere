import { describe, it, expect, beforeEach } from 'vitest';
import { theme, toggleTheme, setTheme, initTheme } from './theme';

describe('Theme Store (Design System)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
  });

  it('deve inicializar com o tema dark por padrão caso não haja preferência salva', () => {
    initTheme();
    expect(theme()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('deve carregar o tema salvo no localStorage ao inicializar', () => {
    localStorage.setItem('tasksanywhere_theme', 'light');
    initTheme();
    expect(theme()).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('deve alternar entre dark e light ao chamar toggleTheme', () => {
    setTheme('dark');
    expect(theme()).toBe('dark');

    toggleTheme();
    expect(theme()).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(localStorage.getItem('tasksanywhere_theme')).toBe('light');

    toggleTheme();
    expect(theme()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('tasksanywhere_theme')).toBe('dark');
  });

  it('deve permitir definir o tema diretamente via setTheme', () => {
    setTheme('light');
    expect(theme()).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(localStorage.getItem('tasksanywhere_theme')).toBe('light');

    setTheme('dark');
    expect(theme()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('tasksanywhere_theme')).toBe('dark');
  });
});
