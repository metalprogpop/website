import { describe, expect, it } from "vitest";
import { adminPoneRecUpdateSchema } from "shared";
import {
  candidateKeys,
  dedupeTags,
  diffTags,
  parsePoneRecKey,
  planPoneRecImport,
  poneRecImportSchema,
  poneRecProposalSchema,
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

describe("proposals", () => {
  it("lists a proposal's candidate images in name order", () => {
    const objects = [
      { key: "Poné REC/propuestas/098/b.webp", size: 1 },
      { key: "Poné REC/propuestas/098/propuesta.json", size: 1 },
      { key: "Poné REC/propuestas/098/a.webp", size: 1 },
      { key: "Poné REC/propuestas/0980/x.webp", size: 1 },
      { key: "Poné REC/propuestas/097/a.webp", size: 1 },
      { key: "Poné REC/propuestas/098/viejas/c.webp", size: 1 },
      { key: "Poné REC/Poné Rec 098.mp3", size: 1 },
    ];
    expect(candidateKeys(98, objects)).toEqual([
      "Poné REC/propuestas/098/a.webp",
      "Poné REC/propuestas/098/b.webp",
    ]);
  });

  it("matches a folder stored with a decomposed accent", () => {
    const key = "Pone\u0301 REC/propuestas/098/a.webp";
    expect(candidateKeys(98, [{ key, size: 1 }])).toEqual([key]);
  });

  it("validates the pipeline's proposal and rejects unknown fields", () => {
    const proposal = {
      program: 98,
      mainTopic: "Cómo nos llevamos con la sangre",
      durationSeconds: 1101,
      tags: ["Sangre"],
      topics: [{ title: "Un dedal", start: "16:55", searchable: true }],
    };
    expect(poneRecProposalSchema.safeParse(proposal).success).toBe(true);
    expect(
      poneRecProposalSchema.safeParse({ ...proposal, thumbnail: "x" }).success,
    ).toBe(false);
  });
});

describe("dedupeTags", () => {
  it("keeps the first of tags that differ only in case", () => {
    expect(dedupeTags(["Sangre", "sangre", "Viajes", "SANGRE"])).toEqual([
      "Sangre",
      "Viajes",
    ]);
  });
});

describe("diffTags", () => {
  it("soft-deletes the tags that go and adds the new ones", () => {
    const current = [
      { id: 1, name: "Sangre" },
      { id: 2, name: "Jingles" },
    ];
    expect(diffTags(current, ["Sangre", "Halloween"])).toEqual({
      gone: [{ id: 2, name: "Jingles" }],
      added: ["Halloween"],
    });
  });
});

describe("limits shared with the admin", () => {
  it("rejects a proposal the admin couldn't edit later", () => {
    const proposal = {
      program: 98,
      mainTopic: "Tema",
      durationSeconds: 1,
      tags: Array.from({ length: 13 }, (_, i) => `Etiqueta ${String(i)}`),
      topics: [],
    };
    expect(poneRecProposalSchema.safeParse(proposal).success).toBe(false);
    expect(
      poneRecProposalSchema.safeParse({ ...proposal, tags: ["x".repeat(41)] })
        .success,
    ).toBe(false);
  });

  it("lets staff edit only the main topic, the tags and the image", () => {
    expect(
      adminPoneRecUpdateSchema.safeParse({ mainTopic: "Otro", tags: [] })
        .success,
    ).toBe(true);
    for (const field of [
      { topics: [] },
      { program: 5 },
      { searchable: false },
      { thumbnailKey: "Poné REC/x.webp" },
    ]) {
      const result = adminPoneRecUpdateSchema.safeParse(field);
      expect(result.success).toBe(false);
      expect(result.error?.issues.at(0)?.message).toMatch(/solo se pueden/i);
    }
  });
});
