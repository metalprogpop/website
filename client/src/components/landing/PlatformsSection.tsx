import { Section } from '../layout/Section';
import { Container } from '../layout/Container';
import { PlatformLink } from './PlatformLink';
import { platforms } from '../../data/platforms';

export function PlatformsSection() {
  return (
    <Section id="listen">
      <Container>
        <h2 className="mb-10 text-center text-2xl font-bold text-text-primary sm:text-3xl">
          Where to Listen
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
          {platforms.map((platform) => (
            <PlatformLink key={platform.id} platform={platform} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
