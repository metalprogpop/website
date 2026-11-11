import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";
import type { AdminPoneRec, AdminPoneRecUpdate } from "shared";
import { db } from "../db/index.js";
import { poneRecTags, poneRecThumbnails, poneRecs } from "../db/schema.js";
import { findEpisode } from "../episodes/catalog.js";
import { readMediaObject } from "../lib/media.js";
import { dedupeTags, diffTags } from "./files.js";

const optionPath = (id: number) =>
  `/api/v1/admin/pone-rec/thumbnails/${String(id)}`;

// Every live episode, or just one.
const liveEpisodes = (id?: number) =>
  db
    .select({
      id: poneRecs.id,
      program: poneRecs.program,
      mainTopic: poneRecs.mainTopic,
      durationSeconds: poneRecs.durationSeconds,
      thumbnailKey: poneRecs.thumbnailKey,
    })
    .from(poneRecs)
    .where(
      id === undefined
        ? isNull(poneRecs.deletedAt)
        : and(eq(poneRecs.id, id), isNull(poneRecs.deletedAt)),
    )
    .orderBy(desc(poneRecs.program));

type LiveEpisode = Awaited<ReturnType<typeof liveEpisodes>>[number];

const describe = async (episodes: LiveEpisode[]): Promise<AdminPoneRec[]> => {
  const ids = episodes.map((e) => e.id);
  if (ids.length === 0) {
    return [];
  }
  const [tags, options] = await Promise.all([
    db
      .select({ poneRecId: poneRecTags.poneRecId, name: poneRecTags.name })
      .from(poneRecTags)
      .where(
        and(inArray(poneRecTags.poneRecId, ids), isNull(poneRecTags.deletedAt)),
      )
      .orderBy(asc(poneRecTags.id)),
    db
      .select({
        id: poneRecThumbnails.id,
        poneRecId: poneRecThumbnails.poneRecId,
        s3Key: poneRecThumbnails.s3Key,
      })
      .from(poneRecThumbnails)
      .where(
        and(
          inArray(poneRecThumbnails.poneRecId, ids),
          isNull(poneRecThumbnails.deletedAt),
        ),
      )
      .orderBy(asc(poneRecThumbnails.id)),
  ]);
  return Promise.all(
    episodes.map(async (episode) => {
      const mine = options.filter((o) => o.poneRecId === episode.id);
      return {
        program: episode.program,
        mainTopic: episode.mainTopic,
        publishedAt:
          (await findEpisode(3 * episode.program))?.publishedAt.toISOString() ??
          null,
        durationSeconds: episode.durationSeconds,
        tags: tags.filter((t) => t.poneRecId === episode.id).map((t) => t.name),
        thumbnails: mine.map((o) => ({ id: o.id, path: optionPath(o.id) })),
        thumbnailId:
          mine.find((o) => o.s3Key === episode.thumbnailKey)?.id ?? null,
      };
    }),
  );
};

export const listAdminPoneRecs = async () => {
  const episodes = await describe(await liveEpisodes());
  const tags = [...new Set(episodes.flatMap((e) => e.tags))].sort((a, b) =>
    a.localeCompare(b, "es"),
  );
  return { episodes, tags };
};

export class InvalidThumbnailError extends Error {}

// Applies staff's edit and returns the episode as it now is, or null if
// there's no such live episode. Tags that go away are soft-deleted. The
// episode's row is locked meanwhile, so two edits to it run one after the
// other.
export const updatePoneRec = async (
  program: number,
  update: AdminPoneRecUpdate,
): Promise<AdminPoneRec | null> => {
  const id = await db.transaction(async (tx) => {
    const episode = (
      await tx
        .select({ id: poneRecs.id })
        .from(poneRecs)
        .where(and(eq(poneRecs.program, program), isNull(poneRecs.deletedAt)))
        .limit(1)
        .for("update")
    ).at(0);
    if (!episode) {
      return null;
    }
    const now = new Date();
    const set: Partial<typeof poneRecs.$inferInsert> = {};
    if (update.mainTopic !== undefined) {
      set.mainTopic = update.mainTopic;
    }
    if (update.thumbnailId !== undefined) {
      if (update.thumbnailId === null) {
        set.thumbnailKey = null;
      } else {
        const option = (
          await tx
            .select({ s3Key: poneRecThumbnails.s3Key })
            .from(poneRecThumbnails)
            .where(
              and(
                eq(poneRecThumbnails.id, update.thumbnailId),
                eq(poneRecThumbnails.poneRecId, episode.id),
                isNull(poneRecThumbnails.deletedAt),
              ),
            )
            .limit(1)
        ).at(0);
        if (!option) {
          throw new InvalidThumbnailError("Esa portada no es de este episodio");
        }
        set.thumbnailKey = option.s3Key;
      }
    }
    if (Object.keys(set).length > 0) {
      await tx
        .update(poneRecs)
        .set({ ...set, updatedAt: now })
        .where(eq(poneRecs.id, episode.id));
    }
    if (update.tags !== undefined) {
      const wanted = dedupeTags(update.tags);
      const current = await tx
        .select({ id: poneRecTags.id, name: poneRecTags.name })
        .from(poneRecTags)
        .where(
          and(
            eq(poneRecTags.poneRecId, episode.id),
            isNull(poneRecTags.deletedAt),
          ),
        );
      const { gone, added } = diffTags(current, wanted);
      if (gone.length > 0) {
        await tx
          .update(poneRecTags)
          .set({ deletedAt: now })
          .where(
            inArray(
              poneRecTags.id,
              gone.map((t) => t.id),
            ),
          );
      }
      if (added.length > 0) {
        await tx
          .insert(poneRecTags)
          .values(added.map((name) => ({ poneRecId: episode.id, name })));
      }
    }
    return episode.id;
  });
  return id === null
    ? null
    : ((await describe(await liveEpisodes(id))).at(0) ?? null);
};

// A live option's image, for staff to choose from.
export const readThumbnailOption = async (id: number) => {
  const option = (
    await db
      .select({ s3Key: poneRecThumbnails.s3Key })
      .from(poneRecThumbnails)
      .innerJoin(poneRecs, eq(poneRecs.id, poneRecThumbnails.poneRecId))
      .where(
        and(
          eq(poneRecThumbnails.id, id),
          isNull(poneRecThumbnails.deletedAt),
          isNull(poneRecs.deletedAt),
        ),
      )
      .limit(1)
  ).at(0);
  return option ? readMediaObject(option.s3Key) : null;
};
