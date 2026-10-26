import type { ReactNode } from "react";
import { GENRE_LABELS } from "../../episode/GenreBadge";
import { partAlbum, partBand } from "../../../lib/fanClubVideos";
import type { Featured } from "./FeaturedVideo";

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="mb-2 block font-display text-sm font-semibold uppercase tracking-widest text-brand">
      {children}
    </span>
  );
}

// What the featured block says: album over band (two lines, the band
// smaller and grey), or the program with its parts.
export function FeaturedText({ item }: { item: Featured }) {
  if (item.kind === "part") {
    return (
      <>
        <Eyebrow>Último de {GENRE_LABELS[item.genre].toLowerCase()}</Eyebrow>
        <h3 className="font-display text-3xl font-bold leading-tight tracking-tight">
          {partAlbum(item.part)}
        </h3>
        <p className="mb-4 mt-1 font-display text-lg font-semibold text-white/60">
          {partBand(item.part)}
        </p>
        <p className="text-sm text-white/70">
          Programa {item.program.number} · parte {item.part.part}
        </p>
      </>
    );
  }
  return (
    <>
      <Eyebrow>Último programa</Eyebrow>
      <h3 className="mb-4 font-display text-3xl font-bold tracking-tight">
        Programa {item.program.number}
      </h3>
      <ol className="space-y-2 text-sm">
        {item.program.parts.map((part) => (
          <li key={part.part} className="flex gap-2">
            <span className="text-white/50">{part.part}.</span>
            <span>
              <span className="block font-medium text-white">
                {partAlbum(part)}
              </span>
              <span className="block text-xs text-white/55">
                {partBand(part)}
              </span>
              {part.missing ? (
                <span className="text-xs text-white/50">Sin video</span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}
