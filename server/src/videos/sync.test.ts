import { describe, expect, it } from "vitest";
import type { ParsedVideo } from "./keys.js";
import { planVideoSync, VideoSyncRefusedError } from "./sync.js";

const file = (program: number, part: number, key?: string): ParsedVideo => ({
  program,
  part,
  lastPart: part,
  key: key ?? `videos/Programa${String(program)}-Parte ${String(part)}-X.mp4`,
  size: 100,
});

// Three parts per program.
const programs = (...numbers: number[]) =>
  numbers.flatMap((n) => [file(n, 1), file(n, 2), file(n, 3)]);

const stored = (files: ParsedVideo[], hidden = false) =>
  files.map(({ program, part }) => ({ program, part, hidden }));

const slots = (files: { program: number; part: number }[]) =>
  files.map((f) => `${String(f.program)}-${String(f.part)}`).sort();

describe("planVideoSync, recent", () => {
  it("re-checks only the two newest programs when nothing is new", () => {
    const plan = planVideoSync(
      stored(programs(5, 4, 3)),
      programs(5, 4, 3),
      "recent",
    );
    expect(slots(plan.upsert)).toEqual(slots(programs(5, 4)));
    expect(plan.added).toBe(0);
    expect(plan.hide).toEqual([]);
  });

  it("also adds any older part the table doesn't have", () => {
    const plan = planVideoSync(
      stored(programs(5, 4)),
      programs(5, 4, 2),
      "recent",
    );
    expect(slots(plan.upsert)).toEqual(slots(programs(5, 4, 2)));
    expect(plan.added).toBe(3);
  });

  it("brings back a hidden part that is in the bucket again", () => {
    const plan = planVideoSync(
      [...stored(programs(5, 4)), ...stored([file(1, 1)], true)],
      [...programs(5, 4), file(1, 1)],
      "recent",
    );
    expect(slots(plan.upsert)).toContain("1-1");
    expect(plan.added).toBe(0);
  });

  it("never hides anything", () => {
    const plan = planVideoSync(
      stored(programs(5, 4, 3)),
      programs(5),
      "recent",
    );
    expect(plan.hide).toEqual([]);
  });

  it("keeps one file per part when two claim the same one", () => {
    const plan = planVideoSync(
      [],
      [file(5, 1, "videos/b.mp4"), file(5, 1, "videos/a.mp4")],
      "recent",
    );
    expect(plan.upsert.map((f) => f.key)).toEqual(["videos/a.mp4"]);
    expect(plan.duplicates).toBe(1);
  });
});

describe("planVideoSync, overlapping files", () => {
  it("keeps the file covering the whole program over a stray part", () => {
    const whole = { ...file(1, 1, "videos/z-whole.mp4"), lastPart: 3 };
    const plan = planVideoSync(
      [],
      [file(1, 2, "videos/a-part.mp4"), whole],
      "full",
    );
    expect(plan.upsert.map((f) => f.key)).toEqual(["videos/z-whole.mp4"]);
    expect(plan.duplicates).toBe(1);
  });
});

describe("planVideoSync, full", () => {
  it("re-checks every file and hides the parts that left the bucket", () => {
    const plan = planVideoSync(
      stored(programs(5, 4, 3)),
      programs(5, 4).filter((f) => !(f.program === 4 && f.part === 2)),
      "full",
    );
    expect(plan.upsert).toHaveLength(5);
    expect(plan.hide).toEqual([
      { program: 4, part: 2 },
      { program: 3, part: 1 },
      { program: 3, part: 2 },
      { program: 3, part: 3 },
    ]);
  });

  it("doesn't hide what is already hidden", () => {
    const plan = planVideoSync(
      [...stored(programs(5)), ...stored(programs(4), true)],
      programs(5),
      "full",
    );
    expect(plan.hide).toEqual([]);
  });

  it("refuses an empty listing", () => {
    expect(() => planVideoSync(stored(programs(5)), [], "full")).toThrow(
      VideoSyncRefusedError,
    );
  });

  it("refuses to hide more than ten videos at once", () => {
    expect(() =>
      planVideoSync(stored(programs(9, 8, 7, 6, 5)), programs(9), "full"),
    ).toThrow(VideoSyncRefusedError);
  });
});
