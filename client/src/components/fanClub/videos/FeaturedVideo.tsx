import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import type { FanClubProgram, FanClubVideoPart, Genre } from "shared";
import { GENRE_LABELS } from "../../episode/GenreBadge";
import { EpisodeArtwork } from "../../landing/EpisodeArtwork";
import { partAlbum, partBand, programPath } from "../../../lib/fanClubVideos";
import { ProgramStrip } from "./VideoTiles";

export type Featured =
  | { kind: "program"; program: FanClubProgram }
  | {
      kind: "part";
      program: FanClubProgram;
      part: FanClubVideoPart;
      genre: Genre;
    };

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="mb-2 block font-display text-sm font-semibold uppercase tracking-widest text-brand">
      {children}
    </span>
  );
}

function FeaturedText({ item }: { item: Featured }) {
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

// The newest program (or, with a genre filter, the newest part of that
// genre). Switching filters changes its content and natural height, so the
// box animates to the new height while the content fades in.
export function FeaturedVideo({ item }: { item: Featured }) {
  const inner = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);
  useLayoutEffect(() => {
    const el = inner.current;
    if (!el || typeof ResizeObserver === "undefined") {
      return undefined;
    }
    const observer = new ResizeObserver(() => {
      setHeight(el.offsetHeight);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  const key =
    item.kind === "program"
      ? String(item.program.number)
      : `${String(item.program.number)}-${String(item.part.part)}`;
  const cover = item.kind === "part" ? item.part.episodes.at(0) : undefined;
  const to = programPath(
    item.program.number,
    item.kind === "part" ? item.part.part : undefined,
  );
  const fade = "animate-in fade-in duration-500 motion-reduce:animate-none";

  return (
    <div
      className="mb-12 overflow-hidden rounded-3xl bg-text-primary text-white shadow-xl transition-[height] duration-500 ease-in-out motion-reduce:transition-none"
      style={{ height }}
    >
      <div
        ref={inner}
        className="md:grid md:grid-cols-[3fr_2fr] md:items-center"
      >
        <div key={key} className="contents">
          {item.kind === "program" ? (
            <div className={fade}>
              <ProgramStrip parts={item.program.parts} />
            </div>
          ) : (
            <div
              className={`relative mx-auto aspect-square w-full max-w-sm ${fade}`}
            >
              {cover ? (
                <EpisodeArtwork
                  url={cover.artworkUrl}
                  alt=""
                  eager
                  sizes="400px"
                />
              ) : null}
            </div>
          )}
          <div className={`flex flex-col justify-center p-6 sm:p-8 ${fade}`}>
            <FeaturedText item={item} />
            <Link
              to={to}
              aria-label={
                item.kind === "program"
                  ? `Mirar el programa ${String(item.program.number)}`
                  : `Mirar ${partAlbum(item.part)}`
              }
              className="mt-6 inline-flex h-12 w-fit items-center gap-2 rounded-lg bg-brand px-6 font-display font-semibold transition-colors hover:bg-brand-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-text-primary"
            >
              <Play
                className="h-4 w-4"
                fill="currentColor"
                aria-hidden="true"
              />
              Mirar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
