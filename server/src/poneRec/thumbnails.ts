import { sql } from "drizzle-orm";
import type { db } from "../db/index.js";
import { poneRecThumbnails } from "../db/schema.js";

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Adds images to an episode's options, skipping the ones it already has
// (the partial unique index decides, so concurrent runs can't clash).
// Returns how many were new.
export const addThumbnailOptions = async (
  tx: Tx,
  poneRecId: number,
  keys: string[],
): Promise<number> => {
  if (keys.length === 0) {
    return 0;
  }
  const inserted = await tx
    .insert(poneRecThumbnails)
    .values([...new Set(keys)].map((s3Key) => ({ poneRecId, s3Key })))
    .onConflictDoNothing({
      target: [poneRecThumbnails.poneRecId, poneRecThumbnails.s3Key],
      where: sql`${poneRecThumbnails.deletedAt} IS NULL`,
    })
    .returning({ id: poneRecThumbnails.id });
  return inserted.length;
};
