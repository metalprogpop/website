import type { Genre } from "shared";
import { GenreFilter } from "../../episode/GenreFilter";

export function VideoTools({
  search,
  onSearch,
  genre,
  onGenre,
}: {
  search: string;
  onSearch: (value: string) => void;
  genre: Genre | null;
  onGenre: (genre: Genre | null) => void;
}) {
  return (
    <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <input
        type="search"
        value={search}
        onChange={(e) => {
          onSearch(e.target.value);
        }}
        placeholder="Buscar por disco, banda o número de programa"
        aria-label="Buscar programas"
        className="w-full rounded-lg border border-border bg-surface px-4 py-3 font-display text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 md:max-w-md"
      />
      <GenreFilter value={genre} onChange={onGenre} align="end" />
    </div>
  );
}
