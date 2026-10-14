import { episodeSummarySchema } from "shared";
import type { PlayerEpisode } from "./PlayerProvider";

// What the player remembers in this browser: where each episode was left,
// the last episode loaded and the playback speed. Storage can be missing or
// throw (private mode, blocked site data), so every access is guarded and
// the player simply starts fresh.
const PREFIX = "mpp:player:";

const read = (key: string): string | null => {
  try {
    return localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string): void => {
  try {
    localStorage.setItem(PREFIX + key, value);
  } catch {
    // Not remembering is fine.
  }
};

const remove = (key: string): void => {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // Not remembering is fine.
  }
};

export const savedPosition = (number: number): number => {
  const seconds = Number(read(`position:${String(number)}`));
  return Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
};

export const savePosition = (number: number, seconds: number): void => {
  write(`position:${String(number)}`, String(Math.floor(seconds)));
};

export const clearPosition = (number: number): void => {
  remove(`position:${String(number)}`);
};

export const savedRate = (allowed: readonly number[]): number => {
  const rate = Number(read("rate"));
  return allowed.includes(rate) ? rate : 1;
};

export const saveRate = (rate: number): void => {
  write("rate", String(rate));
};

const playerEpisodeSchema = episodeSummarySchema.pick({
  number: true,
  slug: true,
  title: true,
  album: true,
  band: true,
  artworkUrl: true,
  audioUrl: true,
  durationSeconds: true,
});

export const savedEpisode = (): PlayerEpisode | null => {
  const raw = read("episode");
  if (!raw) {
    return null;
  }
  try {
    const parsed = playerEpisodeSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

export const saveEpisode = (episode: PlayerEpisode | null): void => {
  if (episode) {
    write("episode", JSON.stringify(episode));
  } else {
    remove("episode");
  }
};
