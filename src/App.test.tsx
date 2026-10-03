import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Sanity Test (TDD)', () => {
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
});
