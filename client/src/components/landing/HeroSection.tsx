import { Logo } from '../ui/Logo';
import { Button } from '../ui/Button';
import { Container } from '../layout/Container';

export function HeroSection() {
  return (
    <section className="flex min-h-[85vh] items-center py-16 lg:py-20">
      <Container>
        <div className="flex flex-col items-center text-center">
          <div className="animate-on-load animate-scale-in">
            <Logo size="hero" className="mb-10" />
          </div>

          <h1 className="animate-on-load animate-fade-up delay-200 mb-6 font-display text-4xl font-bold tracking-tight text-text-primary sm:text-5xl md:text-6xl">
            Aguante escuchar{' '}
            <span className="text-brand">música.</span>
          </h1>

          <p className="animate-on-load animate-fade-up delay-300 mx-auto mb-10 max-w-2xl text-lg text-text-secondary sm:text-xl leading-relaxed">
            Un podcast explorando las conexiones inesperadas entre el metal progresivo, el art rock y la música pop.
          </p>

          <div className="animate-on-load animate-fade-up delay-400 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="primary">
              Escuchar Ahora
            </Button>
            <Button size="lg" variant="secondary">
              Ver Episodios
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
