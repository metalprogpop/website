import { desc, inArray, isNull, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { episodes } from "../db/schema.js";
import { fetchEpisodeFeed } from "../services/episodeFeed.js";
import { parseFeed, type FeedEpisode } from "./feed.js";
import { planSync, type SyncMode } from "./sync.js";

const HOURLY_MS = 60 * 60 * 1000;

export type SyncResult = { total: number; hidden: number };

// The live episodes, newest first. Postgres is the source of truth; this
// copy is loaded on first use and replaced after every sync.
let live: FeedEpisode[] = [];
let byNumber = new Map<number, FeedEpisode>();
let loading: Promise<void> | null = null;
// Syncs run one at a time, in the order they were asked for.
let queue: Promise<unknown> = Promise.resolve();

const columns = {
  guid: episodes.guid,
  number: episodes.number,
  slug: episodes.slug,
  title: episodes.title,
  album: episodes.album,
  band: episodes.band,
  genre: episodes.genre,
  descriptionHtml: episodes.descriptionHtml,
  descriptionText: episodes.descriptionText,
  audioUrl: episodes.audioUrl,
  artworkUrl: episodes.artworkUrl,
  audioboomUrl: episodes.audioboomUrl,
  durationSeconds: episodes.durationSeconds,
  publishedAt: episodes.publishedAt,
};

// For the multi-row upsert: on conflict, each column takes the value that row
// tried to insert.
const fromInsertedRow = Object.fromEntries(
  Object.entries(columns).map(([key, column]) => [
    key,
    sql.raw(`excluded."${column.name}"`),
  ]),
);

const reload = async (): Promise<void> => {
  live = await db
    .select(columns)
    .from(episodes)
    .where(isNull(episodes.deletedAt))
    .orderBy(desc(episodes.number));
  byNumber = new Map(live.map((episode) => [episode.number, episode]));
};

const runSync = async (mode: SyncMode): Promise<SyncResult> => {
  const feed = parseFeed(await fetchEpisodeFeed());
  const stored = await db
    .select({
      number: episodes.number,
      hidden: sql<boolean>`${episodes.deletedAt} IS NOT NULL`,
    })
    .from(episodes);
  const plan = planSync(stored, feed, mode);

  await db.transaction(async (tx) => {
    const now = new Date();
    if (plan.upsert.length > 0) {
      await tx
        .insert(episodes)
        .values(plan.upsert)
        .onConflictDoUpdate({
          target: episodes.number,
          set: { ...fromInsertedRow, updatedAt: now, deletedAt: null },
        });
    }
    if (plan.hide.length > 0) {
      await tx
        .update(episodes)
        .set({ deletedAt: now, updatedAt: now })
        .where(inArray(episodes.number, plan.hide));
    }
  });

  await reload();
  return { total: live.length, hidden: plan.hide.length };
};

// Syncs with the feed. A full re-sync asked for during an hourly one runs
// right after it rather than being skipped.
export const syncEpisodes = (mode: SyncMode): Promise<SyncResult> => {
  const run = queue.then(() => runSync(mode));
  queue = run.catch(() => undefined);
  return run;
};

// Loads the catalog on first use, syncing everything when the table is empty
// (a fresh database). A failed load is retried on the next call.
const ensureLoaded = (): Promise<void> => {
  loading ??= (async () => {
    await reload();
    if (live.length === 0) {
      await syncEpisodes("full");
    }
  })().catch((err: unknown) => {
    loading = null;
    throw err;
  });
  return loading;
};

export const listEpisodes = async (): Promise<FeedEpisode[]> => {
  await ensureLoaded();
  return live;
};

export const findEpisode = async (
  number: number,
): Promise<FeedEpisode | undefined> => {
  await ensureLoaded();
  return byNumber.get(number);
};

// Refreshes the newest episodes every hour, starting right away.
export const startHourlySync = (): void => {
  const tick = () => {
    syncEpisodes("recent").catch((err: unknown) => {
      console.error("Hourly episode sync failed:", err);
    });
  };
  ensureLoaded().then(tick, (err: unknown) => {
    console.error("Initial episode load failed:", err);
  });
  setInterval(tick, HOURLY_MS).unref();
};
