import { useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { genreSchema, type FanClubProgram } from "shared";
import { useFanClubVideos } from "../../../hooks/useFanClubVideos";
import {
  groupByYear,
  partMatches,
  partsOfGenre,
  programMatches,
  type PartItem,
} from "../../../lib/fanClubVideos";
import { ContinueRow } from "./ContinueRow";
import { FeaturedVideo, type Featured } from "./FeaturedVideo";
import { ScrollRow } from "./ScrollRow";
import { VideoHubSkeleton } from "./VideoHubSkeleton";
import { PartTile, ProgramTile } from "./VideoTiles";
import { VideoTools } from "./VideoTools";

const partKey = (item: PartItem) =>
  `${String(item.program.number)}-${String(item.part.part)}`;

const yearTitle = (year: number | null) => (year ? String(year) : "Sin fecha");

function YearGrids<T>({
  items,
  dateOf,
  compact,
  render,
}: {
  items: T[];
  dateOf: (item: T) => string | null | undefined;
  compact: boolean;
  render: (item: T) => ReactNode;
}) {
  return groupByYear(items, dateOf).map(([year, group]) => (
    <section key={year ?? "none"} className="mb-10">
      <h3 className="mb-4 font-display text-xl font-bold text-text-primary">
        {yearTitle(year)}
      </h3>
      <div
        className={`grid gap-6 ${compact ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" : "sm:grid-cols-2 lg:grid-cols-3"}`}
      >
        {group.map(render)}
      </div>
    </section>
  ));
}

const programDate = (p: FanClubProgram) => p.publishedAt;
const partDate = (i: PartItem) => i.part.episodes.at(0)?.publishedAt;

// The members' video room: the newest program first, then what you were
// watching, then every program by year. A genre filter turns each tile into
// that genre's part, so a tile always opens what it shows.
export function VideoHub() {
  const { data: programs, isLoading, isError } = useFanClubVideos();
  const [params, setParams] = useSearchParams();
  const genre = genreSchema.safeParse(params.get("genero")).data ?? null;
  const [search, setSearch] = useState("");

  if (isLoading) {
    return <VideoHubSkeleton />;
  }
  if (isError || !programs) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        No pudimos cargar los videos. Probá de nuevo en un rato.
      </div>
    );
  }

  const searching = search.trim() !== "";
  const foundPrograms = programs.filter((p) => programMatches(p, search));
  const foundParts = genre
    ? partsOfGenre(programs, genre).filter((i) => partMatches(i, search))
    : [];
  const newestPart = foundParts.at(0);
  const newestProgram = programs.at(0);

  let content: ReactNode;
  if (genre ? foundParts.length === 0 : foundPrograms.length === 0) {
    content = <p className="text-text-muted">No hay videos que coincidan.</p>;
  } else if (searching) {
    content = genre ? (
      <YearGrids
        items={foundParts}
        dateOf={partDate}
        compact
        render={(i) => <PartTile key={partKey(i)} item={i} inRow={false} />}
      />
    ) : (
      <YearGrids
        items={foundPrograms}
        dateOf={programDate}
        compact={false}
        render={(p) => <ProgramTile key={p.number} program={p} inRow={false} />}
      />
    );
  } else {
    // One element for both cases, so switching genres animates its height
    // instead of mounting a new block.
    const featured: Featured | null =
      genre && newestPart
        ? { kind: "part", ...newestPart, genre }
        : !genre && newestProgram
          ? { kind: "program", program: newestProgram }
          : null;
    content = (
      <>
        {featured ? <FeaturedVideo item={featured} /> : null}
        <ContinueRow programs={programs} />
        {genre
          ? groupByYear(foundParts.slice(1), partDate).map(([year, items]) => (
              <ScrollRow key={year ?? "none"} title={yearTitle(year)}>
                {items.map((i) => (
                  <PartTile key={partKey(i)} item={i} />
                ))}
              </ScrollRow>
            ))
          : groupByYear(programs.slice(1), programDate).map(([year, items]) => (
              <ScrollRow key={year ?? "none"} title={yearTitle(year)}>
                {items.map((p) => (
                  <ProgramTile key={p.number} program={p} />
                ))}
              </ScrollRow>
            ))}
      </>
    );
  }

  return (
    <section aria-labelledby="videos-title">
      <h2
        id="videos-title"
        className="mb-4 font-display text-3xl font-bold tracking-tight text-text-primary"
      >
        Videos de los programas
      </h2>
      <VideoTools
        search={search}
        onSearch={setSearch}
        genre={genre}
        onGenre={(g) => {
          setParams(g ? { genero: g } : {}, { replace: true });
        }}
      />
      {content}
    </section>
  );
}
