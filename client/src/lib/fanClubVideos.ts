import type { FanClubProgram, FanClubVideoPart, Genre } from "shared";

// A part as it shows up in genre-filtered lists and in "Seguí mirando".
export type PartItem = { program: FanClubProgram; part: FanClubVideoPart };

export const programPath = (program: number, part?: number) =>
  `/fan-clu/programa/${String(program)}${part ? `?parte=${String(part)}` : ""}`;

// The part's album(s), as published; "Parte 2" if its episode is unknown.
export const partAlbum = (part: FanClubVideoPart) =>
  part.episodes.map((e) => e.album).join(" · ") || `Parte ${String(part.part)}`;

// "Album - Band", as the feed titles it.
export const partTitle = (part: FanClubVideoPart) =>
  part.episodes.map((e) => e.title).join(" · ") || `Parte ${String(part.part)}`;

export const partBand = (part: FanClubVideoPart) =>
  [...new Set(part.episodes.flatMap((e) => (e.band ? [e.band] : [])))].join(
    " · ",
  );

export const yearOf = (iso: string | null | undefined) =>
  iso ? new Date(iso).getFullYear() : null;

// "29 ago": inside a year group the year would repeat the group's heading.
export const dayMonth = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleDateString("es-AR", {
        day: "numeric",
        month: "short",
      })
    : "";

// Keeps the input's order (newest first); items without a date go last.
export const groupByYear = <T>(
  items: T[],
  dateOf: (item: T) => string | null | undefined,
): [number | null, T[]][] => {
  const groups = new Map<number | null, T[]>();
  for (const item of items) {
    const year = yearOf(dateOf(item));
    groups.set(year, [...(groups.get(year) ?? []), item]);
  }
  return [...groups.entries()].sort(
    ([a], [b]) => (a === null ? 1 : 0) - (b === null ? 1 : 0),
  );
};

// A file covering several episodes (program 1) has no single genre, so it
// stays out of genre-filtered lists.
export const partsOfGenre = (
  programs: FanClubProgram[],
  genre: Genre,
): PartItem[] =>
  programs.flatMap((program) =>
    program.parts
      .filter(
        (part) =>
          part.episodes.length === 1 && part.episodes.at(0)?.genre === genre,
      )
      .map((part) => ({ program, part })),
  );

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const partMatchesText = (part: FanClubVideoPart, needle: string) =>
  part.episodes.some((e) => normalize(e.title).includes(needle));

// Search by program number (exact), album or band, ignoring accents.
export const programMatches = (program: FanClubProgram, search: string) => {
  const needle = normalize(search.trim());
  return (
    !needle ||
    String(program.number) === needle ||
    program.parts.some((part) => partMatchesText(part, needle))
  );
};

export const partMatches = ({ program, part }: PartItem, search: string) => {
  const needle = normalize(search.trim());
  return (
    !needle ||
    String(program.number) === needle ||
    partMatchesText(part, needle)
  );
};
