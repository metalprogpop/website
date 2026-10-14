import type { FeedEpisode } from "./feed.js";

// Hourly syncs only refresh the newest episodes: once published, older ones
// only change when something was uploaded by mistake, and that is what the
// staff-triggered full re-sync is for.
const RECENT_COUNT = 3;

// Episodes are removed from the feed one at a time, if ever. A full re-sync
// that would hide more than this is reading a broken or truncated feed, and
// is refused rather than wiping the back catalog.
const MAX_HIDDEN_PER_RESYNC = 10;

export class SyncRefusedError extends Error {}

export type SyncMode = "recent" | "full";

export type StoredEpisodeState = { number: number; hidden: boolean };

export type SyncPlan = {
  // Episodes to insert or overwrite (and un-hide), keyed by number.
  upsert: FeedEpisode[];
  // Numbers of live episodes to hide because they left the feed.
  hide: number[];
};

// Decides what a sync writes, given what is stored and the feed (newest
// first). Only a full re-sync hides episodes; the hourly one never sees
// enough of the feed's history to know something was removed on purpose.
export const planSync = (
  stored: StoredEpisodeState[],
  feed: FeedEpisode[],
  mode: SyncMode,
): SyncPlan => {
  if (mode === "full") {
    const inFeed = new Set(feed.map((episode) => episode.number));
    const hide = stored
      .filter((episode) => !episode.hidden && !inFeed.has(episode.number))
      .map((episode) => episode.number);
    if (feed.length === 0 || hide.length > MAX_HIDDEN_PER_RESYNC) {
      throw new SyncRefusedError(
        `El feed trae ${String(feed.length)} episodios y habría que ocultar ${String(hide.length)}: parece incompleto, así que no se tocó nada.`,
      );
    }
    return { upsert: feed, hide };
  }
  const known = new Set(stored.map((episode) => episode.number));
  return {
    upsert: feed.filter(
      (episode, index) => index < RECENT_COUNT || !known.has(episode.number),
    ),
    hide: [],
  };
};
