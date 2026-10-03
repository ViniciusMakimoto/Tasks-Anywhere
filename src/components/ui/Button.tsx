import { JSX, splitProps } from 'solid-js';

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: JSX.Element;
  children?: JSX.Element;
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-sm shadow-indigo-950/40 focus:ring-indigo-500',
  secondary: 'bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-100 border border-slate-700/60 focus:ring-slate-500',
  ghost: 'bg-transparent hover:bg-slate-800/60 active:bg-slate-800 text-slate-300 hover:text-white focus:ring-slate-500',
  danger: 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-sm shadow-rose-950/40 focus:ring-rose-500',
  outline: 'bg-transparent border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white focus:ring-slate-500',
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'text-xs px-2.5 py-1.5 gap-1.5',
  md: 'text-sm px-3.5 py-2 gap-2',
  lg: 'text-base px-5 py-2.5 gap-2.5',
};

export function Button(props: ButtonProps) {
  const [local, rest] = splitProps(props, [
    'variant',
    'size',
    'loading',
    'disabled',
    'icon',
    'class',
    'children',
    'type',
  ]);

  const variant = () => local.variant || 'primary';
  const size = () => local.size || 'md';
  const isDisabled = () => local.disabled || local.loading;

  return (
    <button
      type={local.type || 'button'}
      disabled={isDisabled()}
      class={`inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-950 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 ${
        variantStyles[variant()]
      } ${sizeStyles[size()]} ${local.class || ''}`}
      {...rest}
    >
      {local.loading ? (
        <svg
          class="animate-spin -ml-0.5 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        local.icon
      )}
      {local.children}
    </button>
  );
}
