import { Twitter, Instagram } from 'lucide-react';
import { Container } from '../layout/Container';
import { Logo } from '../ui/Logo';

const socialLinks = [
  { name: 'Twitter', url: 'https://x.com/metalprogpop', Icon: Twitter },
  { name: 'Instagram', url: 'https://instagram.com/metalprogpop', Icon: Instagram },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-14">
      <Container>
        <div className="flex flex-col items-center gap-6">
          <Logo size="md" className="opacity-70 transition-opacity hover:opacity-100" />

          <div className="flex items-center gap-4">
            {socialLinks.map(({ name, url, Icon }) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:text-brand hover:shadow-md"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>

          <p className="font-display text-xs tracking-wide text-text-muted">
            &copy; {currentYear} MetalProgPop Cast. Todos los derechos reservados.
          </p>
        </div>
      </Container>
    </footer>
  );
}
