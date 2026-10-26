import { and, asc, count, eq, gte, isNull, lte, sql } from "drizzle-orm";
import type { FanClubProgram, VideoSyncResult, VideoUrls } from "shared";
import { db } from "../db/index.js";
import { fanClubVideos } from "../db/schema.js";
import { findEpisode, listEpisodes } from "../episodes/catalog.js";
import { attachmentDisposition, downloadFileName } from "./download.js";
import { episodeNumbersOf, parseVideoKey } from "./keys.js";
import { buildPrograms } from "./programs.js";
import { listVideoObjects, SIGNED_URL_SECONDS, signObjectUrl } from "./s3.js";
import { planVideoSync, type VideoSyncMode } from "./sync.js";

const isLive = isNull(fanClubVideos.deletedAt);

// Syncs run one at a time, in the order they were asked for.
let queue: Promise<unknown> = Promise.resolve();

const runSync = async (mode: VideoSyncMode): Promise<VideoSyncResult> => {
  const objects = await listVideoObjects();
  const listing = objects.flatMap((object) => {
    const parsed = parseVideoKey(object);
    return parsed ? [parsed] : [];
  });
  const stored = await db
    .select({
      program: fanClubVideos.program,
      part: fanClubVideos.part,
      hidden: sql<boolean>`${fanClubVideos.deletedAt} IS NOT NULL`,
    })
    .from(fanClubVideos);
  const plan = planVideoSync(stored, listing, mode);

  await db.transaction(async (tx) => {
    const now = new Date();
    if (plan.upsert.length > 0) {
      await tx
        .insert(fanClubVideos)
        .values(
          plan.upsert.map((video) => ({
            program: video.program,
            part: video.part,
            lastPart: video.lastPart,
            s3Key: video.key,
            sizeBytes: video.size,
          })),
        )
        .onConflictDoUpdate({
          target: [fanClubVideos.program, fanClubVideos.part],
          // Each row takes the values it tried to insert.
          set: {
            lastPart: sql.raw(`excluded."${fanClubVideos.lastPart.name}"`),
            s3Key: sql.raw(`excluded."${fanClubVideos.s3Key.name}"`),
            sizeBytes: sql.raw(`excluded."${fanClubVideos.sizeBytes.name}"`),
            updatedAt: now,
            deletedAt: null,
          },
        });
    }
    for (const { program, part } of plan.hide) {
      await tx
        .update(fanClubVideos)
        .set({ deletedAt: now, updatedAt: now })
        .where(
          and(eq(fanClubVideos.program, program), eq(fanClubVideos.part, part)),
        );
    }
  });

  const total =
    (await db.select({ n: count() }).from(fanClubVideos).where(isLive)).at(0)
      ?.n ?? 0;
  return {
    total,
    added: plan.added,
    updated: plan.upsert.length - plan.added,
    hidden: plan.hide.length,
    ignored: objects.length - listing.length + plan.duplicates,
  };
};

export const syncVideos = (mode: VideoSyncMode): Promise<VideoSyncResult> => {
  const run = queue.then(() => runSync(mode));
  queue = run.catch(() => undefined);
  return run;
};

// Every live program, newest first, with its parts' episodes.
export const listPrograms = async (): Promise<FanClubProgram[]> => {
  const [videos, episodes] = await Promise.all([
    db
      .select({
        program: fanClubVideos.program,
        part: fanClubVideos.part,
        lastPart: fanClubVideos.lastPart,
      })
      .from(fanClubVideos)
      .where(isLive)
      .orderBy(asc(fanClubVideos.program), asc(fanClubVideos.part)),
    listEpisodes(),
  ]);
  const byNumber = new Map(
    episodes.map((episode) => [
      episode.number,
      {
        number: episode.number,
        slug: episode.slug,
        title: episode.title,
        album: episode.album,
        band: episode.band,
        genre: episode.genre,
        artworkUrl: episode.artworkUrl,
        publishedAt: episode.publishedAt.toISOString(),
      },
    ]),
  );
  return buildPrograms(videos, (number) => byNumber.get(number));
};

// Presigned URLs to play and download a part, or null when no live file
// covers it (an unknown part, or a lost one).
export const signPart = async (
  program: number,
  part: number,
): Promise<VideoUrls | null> => {
  const video = (
    await db
      .select({
        part: fanClubVideos.part,
        lastPart: fanClubVideos.lastPart,
        s3Key: fanClubVideos.s3Key,
      })
      .from(fanClubVideos)
      .where(
        and(
          isLive,
          eq(fanClubVideos.program, program),
          lte(fanClubVideos.part, part),
          gte(fanClubVideos.lastPart, part),
        ),
      )
      .limit(1)
  ).at(0);
  if (!video) {
    return null;
  }
  const episodes = await Promise.all(
    episodeNumbersOf({ program, ...video }).map(findEpisode),
  );
  const fileName = downloadFileName({
    program,
    part: video.part,
    lastPart: video.lastPart,
    albums: episodes.flatMap((episode) => (episode ? [episode.album] : [])),
  });
  const expiresAt = new Date(Date.now() + SIGNED_URL_SECONDS * 1000);
  const [url, downloadUrl] = await Promise.all([
    signObjectUrl(video.s3Key),
    signObjectUrl(video.s3Key, attachmentDisposition(fileName)),
  ]);
  return { url, downloadUrl, expiresAt: expiresAt.toISOString() };
};
