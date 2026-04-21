import type { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva('rounded-2xl bg-surface border border-border overflow-hidden shadow-sm', {
  variants: {
    variant: {
      default: '',
      interactive:
        'transition-all duration-300 hover:border-brand/40 hover:shadow-xl hover:-translate-y-1 cursor-pointer',
    },
    padding: {
      none: '',
      sm: 'p-4',
      md: 'p-6',
    },
  },
  defaultVariants: {
    variant: 'default',
    padding: 'none',
  },
});

type CardProps = {
  children: ReactNode;
  className?: string;
} & VariantProps<typeof cardVariants>;

export function Card({ children, variant, padding, className = '' }: CardProps) {
  return <div className={`${cardVariants({ variant, padding })} ${className}`}>{children}</div>;
}
