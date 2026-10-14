import { describe, expect, it } from "vitest";
import type { Genre } from "shared";
import { relatedEpisodes } from "./related.js";

type Candidate = { number: number; band: string | null; genre: Genre | null };

const ep = (number: number, band: string | null, genre: Genre | null) => ({
  number,
  band,
  genre,
});

const numbers = (episodes: Candidate[]) =>
  episodes.map((episode) => episode.number);

// Deterministic "random" so tests don't flake.
const noShuffle = () => 0;

describe("relatedEpisodes", () => {
  const catalog = [
    ep(287, "Gentle Giant", "prog"),
    ep(200, "Utopia", "prog"),
    ep(152, "TOOL", "prog"),
    ep(101, "Captain Beyond", "prog"),
    ep(52, "KISS", "metal"),
    ep(42, "Gentle Giant", "pop"),
    ep(21, "Teenage Fanclub", "pop"),
    ep(17, "Gentle Giant", "pop"),
  ];

  it("lists the same band first, then the same genre, up to four", () => {
    const related = relatedEpisodes(catalog[0], catalog, noShuffle);

    expect(related).toHaveLength(4);
    expect(numbers(related).slice(0, 2).sort()).toEqual([17, 42]);
    for (const episode of related.slice(2)) {
      expect(episode.genre).toBe("prog");
    }
    expect(numbers(related)).not.toContain(287);
  });

  it("matches spelling variants of the same band", () => {
    const variants = [
      ep(9, "E.L.O.", "prog"),
      ep(100, "Electric Light Orchestra", "metal"),
      ep(5, "Emerson Lake & Palmer", "prog"),
      ep(77, "Emerson, Lake and Palmer", "pop"),
      ep(7, "Motörhead", "metal"),
      ep(70, "Motorhead", "metal"),
      ep(30, "The Police", "pop"),
      ep(31, "Police", "metal"),
      ep(60, "Frank Zappa / The Mothers", "pop"),
      ep(61, "Frank Zappa and The Mothers of Invention", "metal"),
    ];
    const relatedTo = (number: number) =>
      numbers(
        relatedEpisodes(
          variants.find((episode) => episode.number === number)!,
          variants,
          noShuffle,
        ),
      ).at(0);

    expect(relatedTo(9)).toBe(100);
    expect(relatedTo(5)).toBe(77);
    expect(relatedTo(7)).toBe(70);
    expect(relatedTo(30)).toBe(31);
    expect(relatedTo(60)).toBe(61);
  });

  it("falls back to any episode when there is no band or genre to match", () => {
    const presentation = ep(0, null, null);

    const related = relatedEpisodes(
      presentation,
      [presentation, ...catalog],
      noShuffle,
    );

    expect(related).toHaveLength(4);
    expect(numbers(related)).not.toContain(0);
  });

  it("shuffles the candidates it picks from", () => {
    const pick = (random: () => number) =>
      numbers(relatedEpisodes(ep(52, "KISS", "metal"), catalog, random));

    expect(pick(() => 0)).not.toEqual(pick(() => 0.99));
  });
});
