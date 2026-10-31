import type { MediaObject } from "../lib/media.js";

// Parsing of the media bucket's video keys. Uploads are inconsistent, so the
// pattern is lenient about spaces and zero padding:
//   videos/Programa097-Parte 1-<album>.mp4     the usual name
//   videos/Programa 089-Parte 1-<album>.mp4    a space after "Programa"
//   videos/Programa007-Parte1-<album>.mp4      no space before the part
//   videos/Programa003-Episodio2-<album>.mp4   programs 1-6 ("Epsiodio" too)
//   videos/Programa001-Episodio1 2 y 3-<a>.mp4 program 1: one file, 3 parts
// Anything else under videos/ (specials, promos, images) is not a program
// part and is ignored, and so is an empty file (a failed upload).

const VIDEO_KEY_RE =
  /^videos\/Programa\s*0*(\d+)\s*-\s*(?:Parte|Ep(?:is|si)odio)\s*(\d+(?:\s*(?:y\s*)?\d+)*)\s*-.*\.mp4$/i;

export type ParsedVideo = {
  program: number;
  part: number;
  // Same as part, except for a file that covers several parts.
  lastPart: number;
  // The key exactly as stored (accents included), to read the object.
  key: string;
  size: number;
};

export const parseVideoKey = ({
  key,
  size,
}: MediaObject): ParsedVideo | null => {
  const match = VIDEO_KEY_RE.exec(key.normalize("NFC"));
  if (!match?.[1] || !match[2] || size <= 0) {
    return null;
  }
  const parts = (match[2].match(/\d+/g) ?? []).map(Number);
  const program = Number(match[1]);
  if (program < 1 || parts.length === 0 || parts.some((p) => p < 1 || p > 3)) {
    return null;
  }
  return {
    program,
    part: Math.min(...parts),
    lastPart: Math.max(...parts),
    key,
    size,
  };
};

// Episode numbers a file covers: part k of program N is 3 × (N − 1) + k.
export const episodeNumbersOf = (video: {
  program: number;
  part: number;
  lastPart: number;
}): number[] =>
  Array.from(
    { length: video.lastPart - video.part + 1 },
    (_, index) => 3 * (video.program - 1) + video.part + index,
  );
