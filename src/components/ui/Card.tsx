import { JSX, splitProps } from 'solid-js';

export interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'interactive' | 'flat';
  interactive?: boolean;
  children?: JSX.Element;
}

const cardVariants: Record<NonNullable<CardProps['variant']>, string> = {
  default: 'bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-sm text-slate-900 dark:text-slate-100',
  glass: 'bg-white/70 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/40 shadow-lg text-slate-900 dark:text-slate-100',
  interactive: 'bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:shadow-md cursor-pointer active:scale-[0.99] text-slate-900 dark:text-slate-100',
  flat: 'bg-slate-100 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100',
};

export function Card(props: CardProps) {
  const [local, rest] = splitProps(props, ['variant', 'interactive', 'class', 'children', 'onClick']);

  const variant = () => {
    if (local.interactive) return 'interactive';
    return local.variant || 'default';
  };

  const isClickable = () => local.interactive || local.variant === 'interactive' || Boolean(local.onClick);

  return (
    <div
      role={isClickable() ? 'button' : undefined}
      tabIndex={isClickable() ? 0 : undefined}
      onClick={local.onClick}
      class={`rounded-xl p-4 transition-all duration-150 ${cardVariants[variant()]} ${
        isClickable() ? 'cursor-pointer' : ''
      } ${local.class || ''}`}
      {...rest}
    >
      {local.children}
    </div>
  );
}
