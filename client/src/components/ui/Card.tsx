import { type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva('rounded-xl bg-surface border border-border overflow-hidden', {
  variants: {
    variant: {
      default: '',
      interactive:
        'transition-all duration-200 hover:border-brand/50 hover:shadow-lg hover:shadow-brand/5 cursor-pointer',
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
