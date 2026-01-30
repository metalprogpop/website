import { Section } from '../layout/Section';
import { Container } from '../layout/Container';
import { PlatformLink } from './PlatformLink';
import { platforms } from '../../data/platforms';

export function PlatformsSection() {
  return (
    <Section id="listen">
      <Container>
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block font-display text-sm font-semibold uppercase tracking-widest text-brand">
            Suscribite
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Dónde Escuchar
          </h2>
        </div>

        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          {platforms.map((platform) => (
            <PlatformLink key={platform.id} platform={platform} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
