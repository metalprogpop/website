import { Link } from "react-router-dom";
import { Logo } from "../ui/brand/Logo";
import { Button } from "../ui/brand/Button";
import { Container } from "../layout/Container";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-lg">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link to="/">
            <Logo size="sm" />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              to="/episodes"
              className="font-display text-sm font-medium text-text-secondary transition-colors hover:text-brand"
            >
              Episodios
            </Link>
            <a
              href="#listen"
              className="font-display text-sm font-medium text-text-secondary transition-colors hover:text-brand"
            >
              Escuchar
            </a>
          </nav>

          <Button size="sm" variant="primary">
            Escuchar
          </Button>
        </div>
      </Container>
    </header>
  );
}
