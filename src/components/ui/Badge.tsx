import { JSX, splitProps } from 'solid-js';

export interface BadgeProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  icon?: JSX.Element;
  children?: JSX.Element;
}

const badgeVariants: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/80 dark:text-slate-300 border dark:border-slate-700/50',
  primary: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 border dark:border-indigo-700/50',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 border dark:border-emerald-700/50',
  warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 border dark:border-amber-700/50',
  danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 border dark:border-rose-700/50',
  info: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/70 dark:text-sky-300 border dark:border-sky-700/50',
};

const badgeSizes: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
};

export function Badge(props: BadgeProps) {
  const [local, rest] = splitProps(props, ['variant', 'size', 'icon', 'class', 'children']);

  const variant = () => local.variant || 'default';
  const size = () => local.size || 'sm';

  return (
    <span
      class={`inline-flex items-center font-medium rounded-full tracking-wide select-none ${
        badgeVariants[variant()]
      } ${badgeSizes[size()]} ${local.class || ''}`}
      {...rest}
    >
      {local.icon}
      {local.children}
    </span>
  );
}
