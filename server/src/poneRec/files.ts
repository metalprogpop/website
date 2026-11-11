import { z } from "zod";
import { poneRecMainTopicSchema, poneRecTagsSchema } from "shared";
import type { MediaObject } from "../lib/media.js";

// Poné Rec™ files: "Poné REC/Poné Rec 097.mp3", with the same leniency as
// fanmail about spaces, padding and the accent. Tests ("Poné Rec prueba 1")
// and the thumbnails under "Poné REC/thumbs/" don't match.
const AUDIO_KEY_RE = /^Pon[eé] REC\/Pon[eé]\s*Rec\s*0*(\d+)\s*\.mp3$/i;

export const PONE_REC_PREFIX = "Poné REC/";

export type PoneRecAudio = { program: number; key: string; size: number };

export const parsePoneRecKey = ({
  key,
  size,
}: MediaObject): PoneRecAudio | null => {
  const program = Number(AUDIO_KEY_RE.exec(key.normalize("NFC"))?.[1]);
  return Number.isInteger(program) && program > 0 && size > 0
    ? { program, key, size }
    : null;
};

// What staff approved for each episode, as exported from the review.
export const poneRecImportSchema = z.array(
  z
    .object({
      program: z.number().int().positive(),
      mainTopic: poneRecMainTopicSchema,
      durationSeconds: z.number().int().positive(),
      thumbnailKey: z.string().startsWith(PONE_REC_PREFIX).nullable(),
      tags: poneRecTagsSchema,
      topics: z.array(
        z.object({
          title: z.string().trim().min(1),
          start: z.string().nullable().optional(),
          quote: z.string().nullable().optional(),
          searchable: z.boolean(),
        }),
      ),
    })
    .strict(),
);

export type PoneRecImport = z.infer<typeof poneRecImportSchema>;

export type PoneRecImportPlan = {
  rows: (PoneRecImport[number] & { key: string; size: number })[];
  // Approved episodes whose audio isn't in the bucket.
  missingAudio: number[];
};

// Joins the approved content with the bucket's audio files by program. Two
// files for one program (an older upload) resolve to the first by key.
export const planPoneRecImport = (
  entries: PoneRecImport,
  objects: MediaObject[],
): PoneRecImportPlan => {
  const audio = new Map<number, PoneRecAudio>();
  for (const file of objects
    .flatMap((object) => {
      const parsed = parsePoneRecKey(object);
      return parsed ? [parsed] : [];
    })
    .sort((a, b) => a.key.localeCompare(b.key))) {
    if (!audio.has(file.program)) {
      audio.set(file.program, file);
    }
  }
  const rows: PoneRecImportPlan["rows"] = [];
  const missingAudio: number[] = [];
  for (const entry of entries) {
    const file = audio.get(entry.program);
    if (file) {
      rows.push({ ...entry, key: file.key, size: file.size });
    } else {
      missingAudio.push(entry.program);
    }
  }
  return { rows, missingAudio };
};

// A new episode's proposal, as the pipeline uploads it to the bucket:
// "Poné REC/propuestas/098/propuesta.json" plus candidate images (.webp)
// in the same folder.
export const PROPOSALS_PREFIX = `${PONE_REC_PREFIX}propuestas/`;

export const proposalFolder = (program: number) =>
  `${PROPOSALS_PREFIX}${String(program).padStart(3, "0")}/`;

export const poneRecProposalSchema = z
  .object({
    program: z.number().int().positive(),
    mainTopic: poneRecMainTopicSchema,
    durationSeconds: z.number().int().positive(),
    tags: poneRecTagsSchema,
    topics: z.array(
      z.object({
        title: z.string().trim().min(1),
        start: z.string().nullable().optional(),
        quote: z.string().nullable().optional(),
        searchable: z.boolean(),
      }),
    ),
  })
  .strict();

export type PoneRecProposal = z.infer<typeof poneRecProposalSchema>;

// The candidate images right in a proposal's folder (not in subfolders),
// in name order.
export const candidateKeys = (program: number, objects: MediaObject[]) => {
  const folder = proposalFolder(program).normalize("NFC");
  return objects
    .map((object) => object.key)
    .filter((key) => {
      const name = key.normalize("NFC");
      return (
        name.startsWith(folder) &&
        !name.slice(folder.length).includes("/") &&
        /\.webp$/i.test(name)
      );
    })
    .sort((a, b) => a.localeCompare(b));
};

// Same tag twice, differing only in case, counts once (the first wins).
export const dedupeTags = (tags: string[]) => {
  const seen = new Set<string>();
  return tags.filter((tag) => {
    const key = tag.toLocaleLowerCase("es");
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

// What changes when an episode's tags become `wanted`: the live tags to
// soft-delete and the names to add.
export const diffTags = (
  current: { id: number; name: string }[],
  wanted: string[],
) => ({
  gone: current.filter((tag) => !wanted.includes(tag.name)),
  added: wanted.filter((name) => !current.some((tag) => tag.name === name)),
});
