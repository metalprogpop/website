import { Link } from "react-router-dom";
import type { FanClubProgram, FanClubVideoPart } from "shared";
import { EpisodeArtwork } from "../../landing/EpisodeArtwork";
import {
  dayMonth,
  partAlbum,
  partTitle,
  programPath,
  type PartItem,
} from "../../../lib/fanClubVideos";

// The album covers of a program's parts, side by side.
export function ProgramStrip({ parts }: { parts: FanClubVideoPart[] }) {
  const episodes = parts.flatMap((p) => p.episodes).slice(0, 3);
  return (
    <div className="grid grid-cols-3">
      {episodes.map((e) => (
        <div key={e.number} className="relative aspect-square overflow-hidden">
          <EpisodeArtwork url={e.artworkUrl} alt="" sizes="200px" />
        </div>
      ))}
    </div>
  );
}

function TileCaption({
  program,
  date,
  title,
}: {
  program: number;
  date: string | null | undefined;
  title: string;
}) {
  return (
    <>
      <p className="mt-2 flex items-baseline justify-between gap-2 text-xs text-text-muted">
        <span className="font-display font-semibold text-text-secondary">
          Programa {program}
        </span>
        <span>{dayMonth(date)}</span>
      </p>
      <p className="line-clamp-2 text-sm font-medium text-text-primary group-hover:text-brand">
        {title}
      </p>
    </>
  );
}

// A whole program: opens at its first part. In a row it has a fixed width;
// in a grid it fills its cell.
export function ProgramTile({
  program,
  inRow = true,
}: {
  program: FanClubProgram;
  inRow?: boolean;
}) {
  return (
    <Link
      to={programPath(program.number)}
      className={`group block ${inRow ? "w-60 shrink-0 snap-start sm:w-72" : ""}`}
    >
      <div className="overflow-hidden rounded-xl shadow-sm transition-shadow group-hover:shadow-lg">
        <ProgramStrip parts={program.parts} />
      </div>
      <TileCaption
        program={program.number}
        date={program.publishedAt}
        title={program.parts.map(partAlbum).join(" · ")}
      />
    </Link>
  );
}

// One part (while a genre filter is on): opens exactly that part.
export function PartTile({
  item,
  inRow = true,
}: {
  item: PartItem;
  inRow?: boolean;
}) {
  const episode = item.part.episodes.at(0);
  return (
    <Link
      to={programPath(item.program.number, item.part.part)}
      className={`group block ${inRow ? "w-40 shrink-0 snap-start sm:w-48" : ""}`}
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-text-primary shadow-sm transition-shadow group-hover:shadow-lg">
        {episode ? (
          <EpisodeArtwork url={episode.artworkUrl} alt="" sizes="200px" />
        ) : null}
        {item.part.missing ? (
          <span className="absolute right-2 top-2 rounded-full bg-black/75 px-2.5 py-0.5 font-display text-[11px] font-semibold text-white">
            Sin video
          </span>
        ) : null}
      </div>
      <TileCaption
        program={item.program.number}
        date={episode?.publishedAt}
        title={partTitle(item.part)}
      />
    </Link>
  );
}
