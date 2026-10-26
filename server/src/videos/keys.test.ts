import { describe, expect, it } from "vitest";
import { episodeNumbersOf, parseVideoKey } from "./keys.js";

// Invented names: the bucket's real keys never go into the repo.
const parse = (key: string) => parseVideoKey({ key, size: 100 });

describe("parseVideoKey", () => {
  it("reads the usual name", () => {
    expect(parse("videos/Programa042-Parte 2-Some Album.mp4")).toEqual({
      program: 42,
      part: 2,
      lastPart: 2,
      key: "videos/Programa042-Parte 2-Some Album.mp4",
      size: 100,
    });
  });

  it("tolerates missing or extra spaces around the numbers", () => {
    expect(parse("videos/Programa 050-Parte 3-An Album.mp4")).toMatchObject({
      program: 50,
      part: 3,
    });
    expect(parse("videos/Programa010-Parte1-An Album.mp4")).toMatchObject({
      program: 10,
      part: 1,
    });
  });

  it("reads the early programs' Episodio names, typo included", () => {
    expect(parse("videos/Programa002-Episodio3-Album.mp4")).toMatchObject({
      program: 2,
      part: 3,
      lastPart: 3,
    });
    expect(parse("videos/Programa004-Epsiodio1-Album.mp4")).toMatchObject({
      program: 4,
      part: 1,
    });
  });

  it("reads a single file that covers parts 1 to 3", () => {
    expect(
      parse("videos/Programa001-Episodio1 2 y 3-One-Two-Three.mp4"),
    ).toMatchObject({ program: 1, part: 1, lastPart: 3 });
  });

  it("matches accented names however they were normalized, keeping the key", () => {
    const decomposed = "videos/Programa020-Parte 1-Cancio\u0301n.mp4";
    expect(parse(decomposed)).toMatchObject({ program: 20, key: decomposed });
  });

  it("ignores everything that isn't a program part", () => {
    for (const key of [
      "videos/",
      "videos/An Interview.mp4",
      "videos/Some Promo.mp4",
      "videos/a picture.jpeg",
      "videos/Programa030-Parte 1-Album.mov",
      "videos/Programa030-Parte 4-Album.mp4",
      "Audios/Programa030-Parte 1-Album.mp4",
    ]) {
      expect(parse(key)).toBeNull();
    }
  });

  it("ignores an empty file, a failed upload", () => {
    expect(
      parseVideoKey({ key: "videos/Programa030-Parte 1-Album.mp4", size: 0 }),
    ).toBeNull();
  });
});

describe("episodeNumbersOf", () => {
  it("maps part k of program N to episode 3 × (N − 1) + k", () => {
    expect(episodeNumbersOf({ program: 97, part: 1, lastPart: 1 })).toEqual([
      289,
    ]);
    expect(episodeNumbersOf({ program: 1, part: 1, lastPart: 3 })).toEqual([
      1, 2, 3,
    ]);
  });
});
