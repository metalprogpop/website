import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-display font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-brand text-white hover:bg-brand-hover hover:shadow-lg hover:shadow-brand/20 hover:-translate-y-0.5',
        secondary: 'border border-border bg-surface text-text-primary hover:border-brand hover:text-brand hover:-translate-y-0.5',
        ghost: 'text-text-secondary hover:text-brand',
      },
      size: {
        sm: 'h-10 px-4 text-sm',
        md: 'h-12 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    children: ReactNode;
  };

export function Button({ children, variant, size, className = '', ...props }: ButtonProps) {
  return (
    <button className={`${buttonVariants({ variant, size })} ${className}`} {...props}>
      {children}
    </button>
  );
}
