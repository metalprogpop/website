import type { Genre } from "shared";

const RELATED_COUNT = 4;

// Band names whose spellings normalizeBand cannot reconcile on its own.
const BAND_ALIASES: Record<string, string> = {
  "electric light orchestra": "elo",
  "frank zappa mothers": "frank zappa mothers of invention",
};

const IGNORED_WORDS = new Set(["the", "and"]);

// "E.L.O.", "Emerson, Lake and Palmer" and "Motörhead" compare equal to
// "Electric Light Orchestra", "Emerson Lake & Palmer" and "Motorhead".
export const normalizeBand = (band: string): string => {
  const words = band
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((word) => word.length > 0 && !IGNORED_WORDS.has(word));
  const name = words.join(" ");
  return BAND_ALIASES[name] ?? name;
};

const shuffle = <T>(items: T[], random: () => number): T[] => {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const a = shuffled[i];
    const b = shuffled[j];
    if (a !== undefined && b !== undefined) {
      shuffled[i] = b;
      shuffled[j] = a;
    }
  }
  return shuffled;
};

type Relatable = { number: number; band: string | null; genre: Genre | null };

// "If you liked this episode": other episodes by the same band first, then
// episodes of the same genre, then anything, each group in random order.
export const relatedEpisodes = <T extends Relatable>(
  episode: Relatable,
  catalog: T[],
  random: () => number = Math.random,
): T[] => {
  const band = episode.band === null ? null : normalizeBand(episode.band);
  const others = catalog.filter((other) => other.number !== episode.number);
  const sameBand = others.filter(
    (other) =>
      band !== null &&
      other.band !== null &&
      normalizeBand(other.band) === band,
  );
  const sameGenre = others.filter(
    (other) =>
      episode.genre !== null &&
      other.genre === episode.genre &&
      !sameBand.includes(other),
  );
  const rest = others.filter(
    (other) => !sameBand.includes(other) && !sameGenre.includes(other),
  );
  return [
    ...shuffle(sameBand, random),
    ...shuffle(sameGenre, random),
    ...shuffle(rest, random),
  ].slice(0, RELATED_COUNT);
};
