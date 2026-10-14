import type { EpisodeSummary } from "shared";

export type PlayerEpisode = Pick<
  EpisodeSummary,
  | "number"
  | "slug"
  | "title"
  | "album"
  | "band"
  | "artworkUrl"
  | "audioUrl"
  | "durationSeconds"
>;

export const PLAYBACK_RATES = [1, 1.25, 1.5, 2] as const;

export type PlayerControls = {
  episode: PlayerEpisode | null;
  playing: boolean;
  rate: number;
  // Plays the given episode (switching to it if needed), or resumes.
  play: (episode?: PlayerEpisode) => void;
  pause: () => void;
  seek: (seconds: number) => void;
  skip: (deltaSeconds: number) => void;
  setRate: (rate: number) => void;
  // Stops and dismisses the mini-player.
  close: () => void;
};

export type PlayerTime = { currentTime: number; duration: number };
