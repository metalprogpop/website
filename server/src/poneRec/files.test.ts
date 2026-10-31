import { describe, expect, it } from "vitest";
import {
  parsePoneRecKey,
  planPoneRecImport,
  poneRecImportSchema,
} from "./files.js";

// Invented names: the bucket's real keys never go into the repo.
const parse = (key: string, size = 100) => parsePoneRecKey({ key, size });

const entry = (program: number) => ({
  program,
  mainTopic: `Tema ${String(program)}`,
  durationSeconds: 1200,
  thumbnailKey: `Poné REC/thumbs/${String(program)}.webp`,
  tags: ["Viajes"],
  topics: [
    { title: "Un viaje", start: "00:10", quote: "fuimos", searchable: true },
  ],
});

describe("parsePoneRecKey", () => {
  it("reads the program number, however it was padded or spaced", () => {
    for (const key of [
      "Poné REC/Poné Rec 097.mp3",
      "Poné REC/Poné Rec 97.mp3",
      "Poné REC/Poné Rec097.mp3",
      "Poné REC/Pone Rec 97.mp3",
    ]) {
      expect(parse(key)?.program).toBe(97);
    }
  });

  it("matches decomposed accents, keeping the key as stored", () => {
    const key = "Pone\u0301 REC/Pone\u0301 Rec 060.mp3";
    expect(parse(key)).toEqual({ program: 60, key, size: 100 });
  });

  it("ignores tests, thumbnails, other names and empty files", () => {
    for (const key of [
      "Poné REC/",
      "Poné REC/Poné Rec prueba 1.mp3",
      "Poné REC/thumbs/097.webp",
      "Poné REC/pone-rec-060.mp3",
      "videos/Poné Rec 97.mp3",
    ]) {
      expect(parse(key)).toBeNull();
    }
    expect(parse("Poné REC/Poné Rec 97.mp3", 0)).toBeNull();
  });
});

describe("planPoneRecImport", () => {
  it("joins approved episodes with their audio and lists the ones without", () => {
    const plan = planPoneRecImport(
      [entry(97), entry(96)],
      [
        { key: "Poné REC/Poné Rec 097.mp3", size: 5 },
        { key: "Poné REC/Poné Rec prueba 1.mp3", size: 5 },
      ],
    );
    expect(plan.rows.map((r) => [r.program, r.key])).toEqual([
      [97, "Poné REC/Poné Rec 097.mp3"],
    ]);
    expect(plan.missingAudio).toEqual([96]);
  });
});

describe("poneRecImportSchema", () => {
  it("accepts the review export and rejects unknown fields", () => {
    expect(poneRecImportSchema.safeParse([entry(97)]).success).toBe(true);
    expect(
      poneRecImportSchema.safeParse([{ ...entry(97), thumbnail: "x.png" }])
        .success,
    ).toBe(false);
  });

  it("only takes thumbnails from the Poné Rec prefix", () => {
    expect(
      poneRecImportSchema.safeParse([
        { ...entry(97), thumbnailKey: "videos/x.webp" },
      ]).success,
    ).toBe(false);
  });
});
