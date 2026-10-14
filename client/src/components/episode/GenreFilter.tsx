import type { Genre } from "shared";
import { GENRE_LABELS } from "./GenreBadge";

const OPTIONS: { value: Genre | null; label: string }[] = [
  { value: null, label: "Todos" },
  { value: "metal", label: GENRE_LABELS.metal },
  { value: "prog", label: GENRE_LABELS.prog },
  { value: "pop", label: GENRE_LABELS.pop },
];

type GenreFilterProps = {
  value: Genre | null;
  onChange: (genre: Genre | null) => void;
};

export function GenreFilter({ value, onChange }: GenreFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filtrar por género"
      className="flex flex-wrap justify-center gap-2"
    >
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.label}
            type="button"
            aria-pressed={selected}
            onClick={() => {
              onChange(option.value);
            }}
            className={`h-10 rounded-full border px-5 font-display text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
              selected
                ? "border-brand bg-brand text-white"
                : "border-border bg-surface text-text-secondary hover:border-brand hover:text-brand"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
