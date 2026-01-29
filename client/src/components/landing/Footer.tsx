import { Twitter, Instagram, Youtube } from 'lucide-react';
import { Container } from '../layout/Container';

const socialLinks = [
  { name: 'Twitter', url: 'https://twitter.com/metalprogpopcast', Icon: Twitter },
  { name: 'Instagram', url: 'https://instagram.com/metalprogpopcast', Icon: Instagram },
  { name: 'YouTube', url: 'https://youtube.com/@metalprogpopcast', Icon: Youtube },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-12">
      <Container>
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-6">
            {socialLinks.map(({ name, url, Icon }) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                className="text-text-secondary transition-colors hover:text-brand"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>

          <p className="text-sm text-text-secondary">
            &copy; {currentYear} MetalProgPop Cast. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
