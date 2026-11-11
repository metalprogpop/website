import { and, eq, isNull } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  poneRecTags,
  poneRecThumbnails,
  poneRecTopics,
  poneRecs,
} from "../db/schema.js";
import { listMediaObjects, readMediaObject } from "../lib/media.js";
import {
  candidateKeys,
  dedupeTags,
  planPoneRecImport,
  PONE_REC_PREFIX,
  poneRecProposalSchema,
  proposalFolder,
} from "./files.js";
import { addThumbnailOptions } from "./thumbnails.js";

export type ProposalResult = {
  // False when the episode was already published: its text is left as
  // staff edited it and only new candidate images are added.
  created: boolean;
  candidatesAdded: number;
};

// Publishes a new episode straight away from the pipeline's proposal in
// the bucket, with the default image until staff pick a candidate. Run it
// again after uploading more candidates to offer them too.
export const publishProposal = async (
  program: number,
): Promise<ProposalResult> => {
  const folder = proposalFolder(program);
  const file = await readMediaObject(`${folder}propuesta.json`);
  const proposal = poneRecProposalSchema.parse(
    JSON.parse(new TextDecoder().decode(file.bytes)),
  );
  if (proposal.program !== program) {
    throw new Error(
      `${folder}propuesta.json is for program ${String(proposal.program)}`,
    );
  }
  const objects = await listMediaObjects(PONE_REC_PREFIX);
  const audio = planPoneRecImport(
    [{ ...proposal, thumbnailKey: null }],
    objects,
  ).rows.at(0);
  if (!audio) {
    throw new Error(`No audio in the bucket for Poné Rec ${String(program)}`);
  }
  const candidates = candidateKeys(program, objects);

  return db.transaction(async (tx) => {
    const live = (
      await tx
        .select({ id: poneRecs.id })
        .from(poneRecs)
        .where(and(eq(poneRecs.program, program), isNull(poneRecs.deletedAt)))
        .limit(1)
    ).at(0);
    if (live) {
      return {
        created: false,
        candidatesAdded: await addThumbnailOptions(tx, live.id, candidates),
      };
    }
    const values = {
      s3Key: audio.key,
      sizeBytes: audio.size,
      durationSeconds: proposal.durationSeconds,
      mainTopic: proposal.mainTopic,
      thumbnailKey: null,
    };
    const saved = (
      await tx
        .insert(poneRecs)
        .values({ program, ...values })
        // A soft-deleted episode comes back with the new proposal.
        .onConflictDoUpdate({
          target: poneRecs.program,
          set: { ...values, updatedAt: new Date(), deletedAt: null },
        })
        .returning({ id: poneRecs.id })
    ).at(0);
    if (!saved) {
      throw new Error(`Could not save Poné Rec ${String(program)}`);
    }
    // A revived episode drops whatever it had before (kept on record).
    const now = new Date();
    for (const table of [poneRecTopics, poneRecTags, poneRecThumbnails]) {
      await tx
        .update(table)
        .set({ deletedAt: now })
        .where(and(eq(table.poneRecId, saved.id), isNull(table.deletedAt)));
    }
    if (proposal.topics.length > 0) {
      await tx.insert(poneRecTopics).values(
        proposal.topics.map((topic, position) => ({
          poneRecId: saved.id,
          position,
          title: topic.title,
          startsAt: topic.start ?? null,
          quote: topic.quote ?? null,
          searchable: topic.searchable,
        })),
      );
    }
    if (proposal.tags.length > 0) {
      await tx.insert(poneRecTags).values(
        dedupeTags(proposal.tags).map((name) => ({
          poneRecId: saved.id,
          name,
        })),
      );
    }
    return {
      created: true,
      candidatesAdded: await addThumbnailOptions(tx, saved.id, candidates),
    };
  });
};
