import { JSX, splitProps } from 'solid-js';

export interface BadgeProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  icon?: JSX.Element;
  children?: JSX.Element;
}

const badgeVariants: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-slate-800/80 text-slate-300 border border-slate-700/50',
  primary: 'bg-indigo-950/70 text-indigo-300 border border-indigo-700/50',
  success: 'bg-emerald-950/70 text-emerald-300 border border-emerald-700/50',
  warning: 'bg-amber-950/70 text-amber-300 border border-amber-700/50',
  danger: 'bg-rose-950/70 text-rose-300 border border-rose-700/50',
  info: 'bg-sky-950/70 text-sky-300 border border-sky-700/50',
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
