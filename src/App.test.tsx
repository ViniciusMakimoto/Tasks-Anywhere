import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, beforeEach } from 'vitest';
import App from './App';

describe('App Sanity & Design System Test (TDD)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('renders the TasksAnywhere header and subtitle', () => {
    render(() => <App />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/TasksAnywhere/i);
  });

  it('renders reactive counter and increments value on click', async () => {
    render(() => <App />);
    const counterBtn = screen.getByRole('button', { name: /Contador/i });
    expect(counterBtn).toBeInTheDocument();
    expect(counterBtn).toHaveTextContent('Contador: 0');

    await fireEvent.click(counterBtn);
    expect(counterBtn).toHaveTextContent('Contador: 1');

    await fireEvent.click(counterBtn);
    expect(counterBtn).toHaveTextContent('Contador: 2');
  });

  it('renders status indicators for SolidJS and Tailwind CSS v4', () => {
    render(() => <App />);
    expect(screen.getByText(/SolidJS Signals/i)).toBeInTheDocument();
    expect(screen.getByText(/Tailwind CSS v4/i)).toBeInTheDocument();
  });

  it('toggles theme between dark and light when clicking the theme toggle button', async () => {
    render(() => <App />);
    const themeBtn = screen.getByRole('button', { name: /Alternar para tema/i });
    expect(themeBtn).toBeInTheDocument();

    await fireEvent.click(themeBtn);
    expect(document.documentElement.classList.contains('light')).toBe(true);

    await fireEvent.click(themeBtn);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
