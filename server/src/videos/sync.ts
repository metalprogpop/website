import type { ParsedVideo } from "./keys.js";

// Videos don't change once uploaded and right, so the default sync only
// re-checks the newest programs (plus anything it has never seen); a full
// sync re-checks the whole bucket.
const RECENT_PROGRAMS = 2;

// Videos are removed one at a time, if ever. A full sync that would hide
// more than this is reading a broken listing and is refused.
const MAX_HIDDEN_PER_SYNC = 10;

export class VideoSyncRefusedError extends Error {}

export type VideoSyncMode = "recent" | "full";

export type StoredVideoState = {
  program: number;
  part: number;
  hidden: boolean;
};

export type VideoSyncPlan = {
  // Files to insert or overwrite (and un-hide).
  upsert: ParsedVideo[];
  // How many of those are new to the table.
  added: number;
  // Live rows to hide because their file left the bucket.
  hide: { program: number; part: number }[];
  // Bucket files left out because another file has the same program and part.
  duplicates: number;
};

const slot = (video: { program: number; part: number }) =>
  `${String(video.program)}-${String(video.part)}`;

// Two files claiming the same part (or overlapping parts, like a stray
// part next to a file covering the whole program): keep the widest, then
// the first by key, so the choice is stable between syncs.
const dedupe = (listing: ParsedVideo[]) => {
  const kept: ParsedVideo[] = [];
  const ordered = [...listing].sort(
    (a, b) =>
      b.lastPart - b.part - (a.lastPart - a.part) || a.key.localeCompare(b.key),
  );
  for (const video of ordered) {
    const overlaps = kept.some(
      (other) =>
        other.program === video.program &&
        other.part <= video.lastPart &&
        video.part <= other.lastPart,
    );
    if (!overlaps) {
      kept.push(video);
    }
  }
  return kept;
};

export const planVideoSync = (
  stored: StoredVideoState[],
  listing: ParsedVideo[],
  mode: VideoSyncMode,
): VideoSyncPlan => {
  const files = dedupe(listing);
  const duplicates = listing.length - files.length;
  const known = new Set(stored.map(slot));
  const live = new Set(stored.filter((v) => !v.hidden).map(slot));
  const countAdded = (upsert: ParsedVideo[]) =>
    upsert.filter((video) => !known.has(slot(video))).length;

  if (mode === "full") {
    const inBucket = new Set(files.map(slot));
    const hide = stored
      .filter((video) => !video.hidden && !inBucket.has(slot(video)))
      .map(({ program, part }) => ({ program, part }));
    if (files.length === 0 || hide.length > MAX_HIDDEN_PER_SYNC) {
      throw new VideoSyncRefusedError(
        `El bucket trae ${String(files.length)} videos y habría que ocultar ${String(hide.length)}: parece incompleto, así que no se tocó nada.`,
      );
    }
    return { upsert: files, added: countAdded(files), hide, duplicates };
  }

  const newest = new Set(
    [...new Set(files.map((video) => video.program))]
      .sort((a, b) => b - a)
      .slice(0, RECENT_PROGRAMS),
  );
  const upsert = files.filter(
    (video) => newest.has(video.program) || !live.has(slot(video)),
  );
  return { upsert, added: countAdded(upsert), hide: [], duplicates };
};
