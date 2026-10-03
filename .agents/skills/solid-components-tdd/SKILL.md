---
name: solid-components-tdd
description: "Use this skill for creating, testing, or refactoring UI components and reactive state in SolidJS using strict TDD (Test-Driven Development) with Vitest, @solidjs/testing-library, and jsdom. Covers the Red-Green-Refactor cycle, reactivity rules, hybrid component state, and accessibility standards."
---

# SolidJS Component Development with Strict TDD

Guia e cheatsheet operacional para criação, teste e refatoração de componentes reativos SolidJS no projeto **TasksAnywhere**, garantindo conformidade com a política de TDD estrito e preservação da reatividade granular por Signals.

---

## 1. Ciclo TDD Obrigatório (Red $\rightarrow$ Green $\rightarrow$ Refactor)

Todo componente ou store reativa deve ser desenvolvido seguindo rigorosamente as três etapas:

### Passo 1: Red (Escrever os Testes Unitários Primeiro)
1. Crie o arquivo de teste `src/components/<area>/<NomeComponente>.test.tsx` antes de criar o código de produção.
2. Defina os casos de teste essenciais:
   - Renderização inicial (textos, títulos, badges, valores padrão).
   - Eventos de interação do usuário (`fireEvent.click`, `fireEvent.input`, `fireEvent.submit`).
   - Propagação de callbacks para props do componente (`vi.fn()`).
   - Estados condicionais (expandido/colapsado, concluído/pendente, vazio/preenchido).
3. Execute o teste para **validar que ele falha** pelo motivo esperado:
   ```bash
   npx vitest run src/components/<area>/<NomeComponente>.test.tsx
   ```

### Passo 2: Green (Implementação Mínima Necessária)
1. Crie o componente `src/components/<area>/<NomeComponente>.tsx`.
2. Implemente apenas o código suficiente para satisfazer todos os testes.
3. Exporte pelo `src/components/<area>/index.ts`.
4. Execute o teste novamente até que **todos fiquem 100% verdes**.

### Passo 3: Refactor (Polimento, Tipagem e Limpeza)
1. Integre o novo componente na aplicação principal (`App.tsx` ou componente pai).
2. Verifique se o bundle compila sem erros de TypeScript e sem variáveis/imports órfãos:
   ```bash
   npm run build
   ```
3. Rode toda a suíte de testes do projeto para garantir zero regressão:
   ```bash
   npm test -- --run
   ```

---

## 2. Padrões de Teste com `@solidjs/testing-library`

### Setup de Renderização Reativa
No SolidJS, componentes são montados dentro de funções de renderização para permitir que os Signals sejam rastreados pelo contexto reativo:

```tsx
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { TaskCard } from './TaskCard';

describe('TaskCard Component (TDD)', () => {
  it('renderiza dados e reage a interações', async () => {
    const handleToggle = vi.fn();

    // Sempre passe uma função que retorna o JSX: () => <Component />
    render(() => (
      <TaskCard
        task={mockTask}
        onToggleStatus={handleToggle}
      />
    ));

    // Busca acessível por papéis (roles) e nomes
    const checkbox = screen.getByRole('checkbox', { name: /Título da Tarefa/i });
    expect(checkbox).not.toBeChecked();

    await fireEvent.click(checkbox);
    expect(handleToggle).toHaveBeenCalledWith(mockTask.id);
  });
});
```

---

## 3. Regras de Reatividade do SolidJS (Fusion Signals)

### Regra de Ouro: Nunca Desestruture `props`
Diferente do React, o SolidJS executa a função do componente **apenas uma vez**. Se você desestruturar `const { title } = props`, o valor inicial será capturado como variável estática e as atualizações de sinal do pai nunca refletirão no DOM.

- ❌ **Errado:** `export function Card({ title, isExpanded }: Props)`
- ✅ **Correto:** `export function Card(props: Props)` acessando via `props.title` ou funções acessoras `() => props.title`.
- ✅ **Com `splitProps`:** Se precisar separar classes ou handlers HTML nativos:
  ```tsx
  const [local, rest] = splitProps(props, ['variant', 'size', 'children']);
  ```

### Padrão de Estado Híbrido (Controlled vs Uncontrolled)
Para componentes que podem ser controlados pelo componente pai OU funcionar de forma autônoma (ex: acordeão ou card expansível):

```tsx
export function TaskCard(props: TaskCardProps) {
  const [internalExpanded, setInternalExpanded] = createSignal(false);

  // Acessor reativo: prioriza a prop externa, recorre ao sinal interno como fallback
  const isExpanded = () => (props.isExpanded !== undefined ? props.isExpanded : internalExpanded());

  const toggleExpand = () => {
    if (props.onToggleExpand) {
      props.onToggleExpand(props.task.id);
    } else {
      setInternalExpanded(!internalExpanded());
    }
  };

  return (
    <div>
      <button onClick={toggleExpand}>
        {isExpanded() ? 'Recolher' : 'Expandir'}
      </button>
      <Show when={isExpanded()}>
        <div>Conteúdo expandido...</div>
      </Show>
    </div>
  );
}
```

---

## 4. Acessibilidade (a11y) & Prevenção de Gotchas

### 1. Evitar `role="button"` em Containers Interativos
- **Problema:** Um card container com `role="button"` que contém checkboxes, botões de ação ou links gera violação de acessibilidade e quebra o `@testing-library` com `Found multiple elements with the role "button"`.
- **Solução:** Use container neutro (`<div>` ou `<Card variant="default">`) e aplique efeitos de hover/clique diretamente via classes CSS (`hover:border-slate-300 dark:hover:border-slate-700`).

### 2. Rótulos Específicos em `aria-label`
- Evite rótulos genéricos que possam colidir com botões de formulário pai.
- Exemplo: use `aria-label="Ver subtarefas"` / `aria-label="Recolher subtarefas"` em vez de `aria-label="Detalhes"`, prevenindo ambiguidades nas consultas `/detalhes/i` dos testes.

### 3. Tailwind CSS v4 Dark Mode
- O projeto usa `.dark` no elemento raiz `<html>`. Certifique-se de usar classes `dark:` para garantir consistência estética perfeita nos dois temas.

---

## 5. Checklist de Conclusão da Task (Definition of Done)
- [ ] Testes unitários cobrindo o novo componente escritos antes do código.
- [ ] Testes específicos passando: `npx vitest run <path-to-test>`.
- [ ] Suíte completa de testes passando sem erros: `npm test -- --run`.
- [ ] Compilação de TypeScript e build válidos: `npm run build`.
- [ ] Task atualizada com `[x]` no arquivo canônico `docs/ROADMAP.md`.
- [ ] Página canônica atualizada no `ai-memory` (`architecture/tasks-breakdown.md`).
- [ ] Commit semântico seguindo o padrão (`feat(...)`, `fix(...)`, etc.).
