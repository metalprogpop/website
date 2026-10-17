import { ExternalLink } from "lucide-react";
import { appearances } from "../../data/about";

// AboutPage renders this only when there is at least one appearance.
export function Appearances() {
  return (
    <section aria-labelledby="appearances">
      <div className="mb-12 text-center">
        <span className="mb-3 inline-block font-display text-sm font-semibold uppercase tracking-widest text-brand">
          De visita
        </span>
        <h2
          id="appearances"
          className="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl"
        >
          Nos invitaron
        </h2>
      </div>
      <ul className="mx-auto max-w-3xl divide-y divide-border rounded-2xl border border-border bg-surface">
        {appearances.map((appearance) => (
          <li key={appearance.url}>
            <a
              href={appearance.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-4 p-5"
            >
              <span>
                <span className="block font-display font-semibold text-text-primary transition-colors group-hover:text-brand">
                  {appearance.title}
                </span>
                <span className="text-sm text-text-muted">
                  {appearance.outlet} · {appearance.year}
                </span>
              </span>
              <ExternalLink
                className="h-4 w-4 shrink-0 text-text-muted group-hover:text-brand"
                aria-hidden="true"
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
