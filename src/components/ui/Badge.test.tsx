import { render, screen } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { Badge } from './Badge';

describe('Componente Badge (Design System)', () => {
  it('deve renderizar o texto da badge corretamente', () => {
    render(() => <Badge>Em progresso</Badge>);
    expect(screen.getByText('Em progresso')).toBeInTheDocument();
  });

  it('deve aplicar classes da variante default por padrão', () => {
    render(() => <Badge>Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge.className).toMatch(/bg-slate|bg-zinc/);
  });

  it('deve aplicar classes correspondentes a variantes específicas (success, warning, danger, primary, info)', () => {
    const { unmount: u1 } = render(() => <Badge variant="success">Sucesso</Badge>);
    expect(screen.getByText('Sucesso').className).toMatch(/emerald|green/);
    u1();

    const { unmount: u2 } = render(() => <Badge variant="warning">Atenção</Badge>);
    expect(screen.getByText('Atenção').className).toMatch(/amber|yellow/);
    u2();

    const { unmount: u3 } = render(() => <Badge variant="danger">Urgente</Badge>);
    expect(screen.getByText('Urgente').className).toMatch(/rose|red/);
    u3();

    const { unmount: u4 } = render(() => <Badge variant="primary">Prioritário</Badge>);
    expect(screen.getByText('Prioritário').className).toMatch(/indigo|violet|blue/);
    u4();
  });

  it('deve suportar diferentes tamanhos (sm, md)', () => {
    const { unmount } = render(() => <Badge size="sm">Tag Pequena</Badge>);
    expect(screen.getByText('Tag Pequena').className).toMatch(/text-xs|px-2/);
    unmount();

    render(() => <Badge size="md">Tag Média</Badge>);
    expect(screen.getByText('Tag Média').className).toMatch(/text-sm|px-2.5/);
  });
});
