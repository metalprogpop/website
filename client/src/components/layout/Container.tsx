import type { ReactNode } from 'react';

type ContainerProps = {
  children: ReactNode;
  className?: string;
  // "wide" is for data-dense screens (e.g. the admin grid) that need more
  // horizontal room than content pages.
  width?: 'default' | 'wide';
};

const widths = {
  default: 'max-w-6xl',
  wide: 'max-w-screen-2xl',
} as const;

export function Container({ children, className = '', width = 'default' }: ContainerProps) {
  return (
    <div className={`mx-auto w-full ${widths[width]} px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
