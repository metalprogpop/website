import { Clapperboard, Headphones, type LucideIcon } from "lucide-react";
import { Section } from "../layout/Section";
import { Container } from "../layout/Container";
import { ButtonRouteLink } from "../ui/brand/Button";

const perks: { Icon: LucideIcon; title: string; text: string }[] = [
  {
    Icon: Clapperboard,
    title: "Los videos de los programas",
    text: "Cada programa grabado en video, para mirarlo cuando quieras o bajarlo.",
  },
  {
    Icon: Headphones,
    title: "Poné Rec™",
    text: "El podcast adicional, solo para el Fan Clú.",
  },
];

// The way into the Fan Clú from the home: what members get, and the door.
export function FanClubTeaser() {
  return (
    <Section id="fan-clu" className="bg-surface">
      <Container>
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block font-display text-sm font-semibold uppercase tracking-widest text-brand">
            Fan Clú
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Bancá el programa y llevate más
          </h2>
        </div>
        <ul className="mx-auto mb-10 grid max-w-3xl gap-6 sm:grid-cols-2">
          {perks.map(({ Icon, title, text }) => (
            <li
              key={title}
              className="flex gap-4 rounded-2xl border border-border bg-background p-6"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <span>
                <span className="mb-1 block font-display text-lg font-semibold text-text-primary">
                  {title}
                </span>
                <span className="text-text-secondary">{text}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col items-center gap-3">
          <ButtonRouteLink to="/fan-clu" size="lg">
            Sumate al Fan Clú
          </ButtonRouteLink>
          <p className="text-sm text-text-muted">
            ¿Ya sos parte? Entrá desde ahí con tu email.
          </p>
        </div>
      </Container>
    </Section>
  );
}
