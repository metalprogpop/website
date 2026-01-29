import { Logo } from '../ui/Logo';
import { Button } from '../ui/Button';
import { Container } from '../layout/Container';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Logo size="sm" />

          <nav className="hidden items-center gap-6 md:flex">
            <a
              href="#episodes"
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              Episodes
            </a>
            <a
              href="#listen"
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              Listen
            </a>
          </nav>

          <Button size="sm" variant="primary">
            Listen Now
          </Button>
        </div>
      </Container>
    </header>
  );
}
