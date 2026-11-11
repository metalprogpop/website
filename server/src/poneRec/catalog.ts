import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";
import type { PoneRec, PoneRecUrl } from "shared";
import { db } from "../db/index.js";
import {
  poneRecTags,
  poneRecThumbnails,
  poneRecTopics,
  poneRecs,
} from "../db/schema.js";
import { findEpisode } from "../episodes/catalog.js";
import {
  listMediaObjects,
  readMediaObject,
  SIGNED_URL_SECONDS,
  signMediaUrl,
} from "../lib/media.js";
import {
  planPoneRecImport,
  PONE_REC_PREFIX,
  type PoneRecImport,
  dedupeTags,
} from "./files.js";
import { addThumbnailOptions } from "./thumbnails.js";

export type PoneRecImportResult = { imported: number; missingAudio: number[] };

export class CatalogNotEmptyError extends Error {}

// Fills an empty catalog from an export of the approved content. It refuses
// when episodes are already published, so it can't overwrite staff edits
// (new episodes go through the proposal import).
export const importPoneRecs = async (
  entries: PoneRecImport,
): Promise<PoneRecImportResult> => {
  const plan = planPoneRecImport(
    entries,
    await listMediaObjects(PONE_REC_PREFIX),
  );
  await db.transaction(async (tx) => {
    const live = (
      await tx
        .select({ id: poneRecs.id })
        .from(poneRecs)
        .where(isNull(poneRecs.deletedAt))
        .limit(1)
    ).at(0);
    if (live) {
      throw new CatalogNotEmptyError(
        "Ya hay Poné Rec publicados: para uno nuevo usá --propuesta <programa>.",
      );
    }
    const now = new Date();
    for (const row of plan.rows) {
      const values = {
        s3Key: row.key,
        sizeBytes: row.size,
        durationSeconds: row.durationSeconds,
        mainTopic: row.mainTopic,
        thumbnailKey: row.thumbnailKey,
      };
      const saved = (
        await tx
          .insert(poneRecs)
          .values({ program: row.program, ...values })
          .onConflictDoUpdate({
            target: poneRecs.program,
            set: { ...values, updatedAt: now, deletedAt: null },
          })
          .returning({ id: poneRecs.id })
      ).at(0);
      if (!saved) {
        throw new Error(`Could not save Poné Rec ${String(row.program)}`);
      }
      for (const table of [poneRecTopics, poneRecTags]) {
        await tx
          .update(table)
          .set({ deletedAt: now })
          .where(and(eq(table.poneRecId, saved.id), isNull(table.deletedAt)));
      }
      if (row.topics.length > 0) {
        await tx.insert(poneRecTopics).values(
          row.topics.map((topic, position) => ({
            poneRecId: saved.id,
            position,
            title: topic.title,
            startsAt: topic.start ?? null,
            quote: topic.quote ?? null,
            searchable: topic.searchable,
          })),
        );
      }
      if (row.tags.length > 0) {
        await tx
          .insert(poneRecTags)
          .values(
            dedupeTags(row.tags).map((name) => ({ poneRecId: saved.id, name })),
          );
      }
      if (row.thumbnailKey) {
        await addThumbnailOptions(tx, saved.id, [row.thumbnailKey]);
      }
    }
  });
  return { imported: plan.rows.length, missingAudio: plan.missingAudio };
};

// The chosen image's option id goes in the URL as a version, so browsers
// that cached an earlier image (it's cached for a day) fetch the new one.
// The id says nothing about the S3 key.
const thumbnailPath = (program: number, version: number) =>
  `/api/v1/fan-clu/pone-rec/${String(program)}/thumbnail?v=${String(version)}`;

// Every live episode, newest first, with its tags. The transcript's topics
// never leave the server.
export const listPoneRecs = async (): Promise<PoneRec[]> => {
  const episodes = await db
    .select({
      id: poneRecs.id,
      program: poneRecs.program,
      mainTopic: poneRecs.mainTopic,
      durationSeconds: poneRecs.durationSeconds,
      thumbnailVersion: poneRecThumbnails.id,
    })
    .from(poneRecs)
    .leftJoin(
      poneRecThumbnails,
      and(
        eq(poneRecThumbnails.poneRecId, poneRecs.id),
        eq(poneRecThumbnails.s3Key, poneRecs.thumbnailKey),
        isNull(poneRecThumbnails.deletedAt),
      ),
    )
    .where(isNull(poneRecs.deletedAt))
    .orderBy(desc(poneRecs.program));
  const ids = episodes.map((e) => e.id);
  if (ids.length === 0) {
    return [];
  }
  const tags = await db
    .select({ poneRecId: poneRecTags.poneRecId, name: poneRecTags.name })
    .from(poneRecTags)
    .where(
      and(inArray(poneRecTags.poneRecId, ids), isNull(poneRecTags.deletedAt)),
    )
    .orderBy(asc(poneRecTags.id));
  return Promise.all(
    episodes.map(async (episode) => {
      // The program's last episode dates it.
      const last = await findEpisode(3 * episode.program);
      return {
        program: episode.program,
        mainTopic: episode.mainTopic,
        publishedAt: last?.publishedAt.toISOString() ?? null,
        durationSeconds: episode.durationSeconds,
        thumbnailPath:
          episode.thumbnailVersion === null
            ? null
            : thumbnailPath(episode.program, episode.thumbnailVersion),
        tags: tags.filter((t) => t.poneRecId === episode.id).map((t) => t.name),
      };
    }),
  );
};

const findLive = async (program: number) =>
  (
    await db
      .select({ s3Key: poneRecs.s3Key, thumbnailKey: poneRecs.thumbnailKey })
      .from(poneRecs)
      .where(and(eq(poneRecs.program, program), isNull(poneRecs.deletedAt)))
      .limit(1)
  ).at(0);

export const signPoneRec = async (
  program: number,
): Promise<PoneRecUrl | null> => {
  const episode = await findLive(program);
  if (!episode) {
    return null;
  }
  const expiresAt = new Date(Date.now() + SIGNED_URL_SECONDS * 1000);
  return {
    url: await signMediaUrl(episode.s3Key, "audio/mpeg"),
    expiresAt: expiresAt.toISOString(),
  };
};

export const readPoneRecThumbnail = async (program: number) => {
  const episode = await findLive(program);
  return episode?.thumbnailKey ? readMediaObject(episode.thumbnailKey) : null;
};
