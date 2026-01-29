import { Logo } from '../ui/Logo';
import { Button } from '../ui/Button';
import { Container } from '../layout/Container';

export function HeroSection() {
  return (
    <section className="flex min-h-[80vh] items-center py-12 lg:py-16">
      <Container>
        <div className="flex flex-col items-center text-center">
          <Logo size="hero" className="mb-10" />

          <p className="mb-6 text-2xl font-medium text-text-primary sm:text-3xl">
            Where genres collide.
          </p>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-text-secondary sm:text-xl">
            A podcast exploring the unexpected connections between progressive metal, art rock, and
            pop music. New episodes every other week.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="primary">
              Listen Now
            </Button>
            <Button size="lg" variant="secondary">
              Browse Episodes
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
