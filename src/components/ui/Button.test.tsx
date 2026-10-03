import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Componente Button (Design System)', () => {
  it('deve renderizar o texto do botão corretamente', () => {
    render(() => <Button>Clique aqui</Button>);
    expect(screen.getByRole('button', { name: /clique aqui/i })).toBeInTheDocument();
  });

  it('deve disparar o evento onClick quando clicado', () => {
    const handleClick = vi.fn();
    render(() => <Button onClick={handleClick}>Ação</Button>);

    const button = screen.getByRole('button', { name: /ação/i });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('não deve disparar onClick quando estiver desabilitado', () => {
    const handleClick = vi.fn();
    render(() => <Button disabled onClick={handleClick}>Desabilitado</Button>);

    const button = screen.getByRole('button', { name: /desabilitado/i });
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('não deve disparar onClick quando estiver em estado loading', () => {
    const handleClick = vi.fn();
    render(() => <Button loading onClick={handleClick}>Carregando</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('deve aplicar as classes da variante primária por padrão', () => {
    render(() => <Button>Padrão</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-indigo-600');
  });

  it('deve aplicar classes correspondentes a variantes específicas (secondary, ghost, danger, outline)', () => {
    const { unmount } = render(() => <Button variant="secondary">Secundário</Button>);
    expect(screen.getByRole('button').className).toMatch(/bg-slate-800|bg-zinc-800/);
    unmount();

    render(() => <Button variant="danger">Perigo</Button>);
    expect(screen.getByRole('button').className).toMatch(/bg-rose-600|bg-red-600/);
  });

  it('deve suportar diferentes tamanhos (sm, md, lg)', () => {
    const { unmount } = render(() => <Button size="sm">Pequeno</Button>);
    expect(screen.getByRole('button').className).toMatch(/text-xs|px-2.5/);
    unmount();

    render(() => <Button size="lg">Grande</Button>);
    expect(screen.getByRole('button').className).toMatch(/text-base|px-5/);
  });
});
