type LogoProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

const sizeClasses = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-4xl sm:text-5xl',
};

export function Logo({ className = '', size = 'md' }: LogoProps) {
  return (
    <span className={`font-bold tracking-tight ${sizeClasses[size]} ${className}`}>
      <span className="text-brand">Metal</span>
      <span className="text-text-primary">Prog</span>
      <span className="text-brand">Pop</span>
      <span className="text-text-secondary font-normal"> Cast</span>
    </span>
  );
}
