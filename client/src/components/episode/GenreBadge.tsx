import type { Genre } from "shared";

export const GENRE_LABELS: Record<Genre, string> = {
  metal: "Metal",
  prog: "Prog",
  pop: "Pop",
};

type GenreBadgeProps = {
  genre: Genre;
};

export function GenreBadge({ genre }: GenreBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 font-display text-xs font-semibold uppercase tracking-wider text-text-secondary">
      {GENRE_LABELS[genre]}
    </span>
  );
}
