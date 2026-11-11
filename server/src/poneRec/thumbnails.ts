import { and, eq, inArray, isNull } from "drizzle-orm";
import type { db } from "../db/index.js";
import { poneRecThumbnails } from "../db/schema.js";

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Adds images to an episode's options, skipping the ones it already has.
// Returns how many were new.
export const addThumbnailOptions = async (
  tx: Tx,
  poneRecId: number,
  keys: string[],
): Promise<number> => {
  if (keys.length === 0) {
    return 0;
  }
  const existing = new Set(
    (
      await tx
        .select({ s3Key: poneRecThumbnails.s3Key })
        .from(poneRecThumbnails)
        .where(
          and(
            eq(poneRecThumbnails.poneRecId, poneRecId),
            inArray(poneRecThumbnails.s3Key, keys),
            isNull(poneRecThumbnails.deletedAt),
          ),
        )
    ).map((row) => row.s3Key),
  );
  const fresh = [...new Set(keys)].filter((key) => !existing.has(key));
  if (fresh.length > 0) {
    await tx
      .insert(poneRecThumbnails)
      .values(fresh.map((s3Key) => ({ poneRecId, s3Key })));
  }
  return fresh.length;
};
