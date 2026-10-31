import { z } from "zod";
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
      mainTopic: z.string().trim().min(1),
      durationSeconds: z.number().int().positive(),
      thumbnailKey: z.string().startsWith(PONE_REC_PREFIX).nullable(),
      tags: z.array(z.string().trim().min(1)),
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
