import type { FanClubProgram, FanClubVideoPart, VideoEpisode } from "shared";
import { episodeNumbersOf } from "./keys.js";

export type StoredVideo = { program: number; part: number; lastPart: number };

// Every program has three parts. One without a file was lost (badly
// recorded) and keeps its slot as missing, with its episode, so nobody
// thinks the site is broken. A program whose single file covers several
// parts (program 1) has just that file.
const PARTS_PER_PROGRAM = 3;

export const buildPrograms = (
  videos: StoredVideo[],
  episodeByNumber: (number: number) => VideoEpisode | undefined,
): FanClubProgram[] => {
  const byProgram = new Map<number, StoredVideo[]>();
  for (const video of videos) {
    byProgram.set(video.program, [
      ...(byProgram.get(video.program) ?? []),
      video,
    ]);
  }

  const episodesOf = (video: StoredVideo) =>
    episodeNumbersOf(video).flatMap((number) => {
      const episode = episodeByNumber(number);
      return episode ? [episode] : [];
    });

  return [...byProgram.entries()]
    .sort(([a], [b]) => b - a)
    .map(([number, files]) => {
      const covered = (part: number) =>
        files.find((f) => f.part <= part && part <= f.lastPart);
      const parts: FanClubVideoPart[] = [];
      for (let part = 1; part <= PARTS_PER_PROGRAM; part += 1) {
        const file = covered(part);
        if (!file) {
          parts.push({
            part,
            missing: true,
            episodes: episodesOf({ program: number, part, lastPart: part }),
          });
        } else if (file.part === part) {
          parts.push({ part, missing: false, episodes: episodesOf(file) });
        }
      }
      const published = parts
        .flatMap((p) => p.episodes.map((e) => e.publishedAt))
        .sort()
        .at(-1);
      return { number, publishedAt: published ?? null, parts };
    });
};
