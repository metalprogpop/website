import { useEffect, useState } from "react";
import { z } from "zod";
import type { FanClubProgram } from "shared";
import type { PartItem } from "../lib/fanClubVideos";

// Where each part was left, kept on this device. A part counts as started
// past the first 10 seconds and until the last 30.
const progressSchema = z.object({
  t: z.number(),
  d: z.number(),
  at: z.number(),
});

type Progress = z.infer<typeof progressSchema>;

const PREFIX = "fan-club-video-progress:";
const CHANGED = "fan-club-video-progress";

export const progressKey = (program: number, part: number) =>
  `${String(program)}-${String(part)}`;

export const readProgress = (key: string): Progress | null => {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(PREFIX + key) ?? "null",
    );
    const parsed = progressSchema.safeParse(value);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

const notify = () => {
  window.dispatchEvent(new Event(CHANGED));
};

export const saveProgress = (key: string, t: number, d: number) => {
  localStorage.setItem(
    PREFIX + key,
    JSON.stringify({ t, d, at: Date.now() } satisfies Progress),
  );
  notify();
};

// Returns what was removed, so it can be put back (undo).
export const removeProgress = (key: string): Progress | null => {
  const saved = readProgress(key);
  localStorage.removeItem(PREFIX + key);
  notify();
  return saved;
};

export const restoreProgress = (key: string, saved: Progress) => {
  localStorage.setItem(PREFIX + key, JSON.stringify(saved));
  notify();
};

export const isStarted = (progress: Progress | null) =>
  progress !== null && progress.t > 10 && progress.t < progress.d - 30;

// Re-renders whenever any part's progress changes, here or in another tab.
function useProgressVersion() {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const bump = () => {
      setVersion((v) => v + 1);
    };
    window.addEventListener(CHANGED, bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener(CHANGED, bump);
      window.removeEventListener("storage", bump);
    };
  }, []);
  return version;
}

export function useProgress(key: string) {
  useProgressVersion();
  return readProgress(key);
}

// Started parts, most recently watched first.
export function useStartedParts(programs: FanClubProgram[]): PartItem[] {
  useProgressVersion();
  return programs
    .flatMap((program) =>
      program.parts.flatMap((part) => {
        const progress = readProgress(progressKey(program.number, part.part));
        return progress && isStarted(progress)
          ? [{ item: { program, part }, at: progress.at }]
          : [];
      }),
    )
    .sort((a, b) => b.at - a.at)
    .map(({ item }) => item);
}
