import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { episodePath, type EpisodeLink } from "shared";

type EpisodeNavProps = {
  previous: EpisodeLink | null;
  next: EpisodeLink | null;
};

// Walks the catalog in order: the previous (older) and next (newer) episode.
export function EpisodeNav({ previous, next }: EpisodeNavProps) {
  return (
    <nav
      aria-label="Episodios anterior y siguiente"
      className="grid gap-4 border-t border-border pt-8 sm:grid-cols-2"
    >
      {previous ? (
        <Link
          to={episodePath(previous)}
          className="group flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-brand/40"
        >
          <ChevronLeft
            className="h-5 w-5 shrink-0 text-text-muted transition-colors group-hover:text-brand"
            aria-hidden="true"
          />
          <span className="min-w-0">
            <span className="block font-display text-xs font-semibold uppercase tracking-widest text-brand">
              Anterior
            </span>
            <span className="block truncate font-display text-sm font-semibold text-text-primary">
              {previous.title}
            </span>
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          to={episodePath(next)}
          className="group flex items-center justify-end gap-3 rounded-2xl border border-border bg-surface p-4 text-right transition-colors hover:border-brand/40"
        >
          <span className="min-w-0">
            <span className="block font-display text-xs font-semibold uppercase tracking-widest text-brand">
              Siguiente
            </span>
            <span className="block truncate font-display text-sm font-semibold text-text-primary">
              {next.title}
            </span>
          </span>
          <ChevronRight
            className="h-5 w-5 shrink-0 text-text-muted transition-colors group-hover:text-brand"
            aria-hidden="true"
          />
        </Link>
      ) : null}
    </nav>
  );
}
