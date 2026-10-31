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
> & {
  // Where the title links; an episode's page by default. Poné Rec™ links
  // to its own page.
  href?: string;
  // For audio served from a presigned URL, the API path that signs a new
  // one; the player asks it when the URL stops working (it expired).
  refreshUrlPath?: string;
};

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
