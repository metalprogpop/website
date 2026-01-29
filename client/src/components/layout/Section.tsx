import { type ReactNode } from 'react';

type SectionProps = {
  children: ReactNode;
  id?: string;
  className?: string;
};

export function Section({ children, id, className = '' }: SectionProps) {
  return (
    <section id={id} className={`py-16 lg:py-24 ${className}`}>
      {children}
    </section>
  );
}
