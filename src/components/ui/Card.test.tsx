import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { Card } from './Card';

describe('Componente Card (Design System)', () => {
  it('deve renderizar o conteúdo do card', () => {
    render(() => (
      <Card>
        <h2>Título do Card</h2>
        <p>Descrição da tarefa</p>
      </Card>
    ));

    expect(screen.getByText('Título do Card')).toBeInTheDocument();
    expect(screen.getByText('Descrição da tarefa')).toBeInTheDocument();
  });

  it('deve aplicar classes base e variante default por padrão', () => {
    render(() => <Card data-testid="test-card">Conteúdo</Card>);
    const card = screen.getByTestId('test-card');
    expect(card.className).toMatch(/rounded|border/);
  });

  it('deve suportar variante glass com backdrop-blur', () => {
    render(() => <Card variant="glass" data-testid="glass-card">Conteúdo Glass</Card>);
    const card = screen.getByTestId('glass-card');
    expect(card.className).toContain('backdrop-blur');
  });

  it('deve disparar onClick quando for clicável e clicado', () => {
    const handleClick = vi.fn();
    render(() => (
      <Card interactive onClick={handleClick} data-testid="clickable-card">
        Clique-me
      </Card>
    ));

    const card = screen.getByTestId('clickable-card');
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
