import { describe, expect, it } from "vitest";
import type { VideoEpisode } from "shared";
import { buildPrograms } from "./programs.js";

const episode = (number: number): VideoEpisode => ({
  number,
  slug: `album-${String(number)}`,
  title: `Album ${String(number)} - Band`,
  album: `Album ${String(number)}`,
  band: "Band",
  genre: "metal",
  artworkUrl: "https://audioboom.com/i/1.png",
  publishedAt: new Date(Date.UTC(2026, 0, number)).toISOString(),
});

const catalog = (number: number) =>
  number <= 30 ? episode(number) : undefined;

const video = (program: number, part: number, lastPart = part) => ({
  program,
  part,
  lastPart,
});

describe("buildPrograms", () => {
  it("lists programs newest first, each part with its episode", () => {
    const programs = buildPrograms(
      [
        video(2, 1),
        video(2, 2),
        video(2, 3),
        video(3, 1),
        video(3, 2),
        video(3, 3),
      ],
      catalog,
    );
    expect(programs.map((p) => p.number)).toEqual([3, 2]);
    expect(
      programs[0]?.parts.map((p) => p.episodes.map((e) => e.number)),
    ).toEqual([[7], [8], [9]]);
    expect(programs[0]?.publishedAt).toBe(episode(9).publishedAt);
  });

  it("keeps a lost part's slot as missing, with its episode", () => {
    const program = buildPrograms([video(4, 1), video(4, 2)], catalog).at(0);
    expect(program?.parts).toEqual([
      { part: 1, missing: false, episodes: [episode(10)] },
      { part: 2, missing: false, episodes: [episode(11)] },
      { part: 3, missing: true, episodes: [episode(12)] },
    ]);
  });

  it("shows a file covering three parts as one part with three episodes", () => {
    const program = buildPrograms([video(1, 1, 3)], catalog).at(0);
    expect(program?.parts).toEqual([
      {
        part: 1,
        missing: false,
        episodes: [episode(1), episode(2), episode(3)],
      },
    ]);
  });

  it("still lists a part whose episode isn't in the feed", () => {
    const program = buildPrograms([video(20, 1)], catalog).at(0);
    expect(program?.parts[0]).toEqual({
      part: 1,
      missing: false,
      episodes: [],
    });
    expect(program?.publishedAt).toBeNull();
  });

  it("never carries a file's key, even when the row has one", () => {
    const rows = [{ ...video(5, 1), s3Key: "videos/secret-name.mp4" }];
    expect(JSON.stringify(buildPrograms(rows, catalog))).not.toContain(
      "secret-name",
    );
  });
});
