import { useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { genreSchema, type FanClubProgram } from "shared";
import { useFanClubVideos } from "../../../hooks/useFanClubVideos";
import {
  partMatches,
  partsOfGenre,
  programMatches,
  type PartItem,
} from "../../../lib/fanClubVideos";
import { ContinueRow } from "./ContinueRow";
import { FeaturedVideo, type Featured } from "./FeaturedVideo";
import { VideoHubSkeleton } from "./VideoHubSkeleton";
import { PartTile, ProgramTile } from "./VideoTiles";
import { VideoTools } from "./VideoTools";
import { YearGrids, YearRows } from "./YearGroups";

const partKey = (item: PartItem) =>
  `${String(item.program.number)}-${String(item.part.part)}`;
const programDate = (p: FanClubProgram) => p.publishedAt;
const partDate = (i: PartItem) => i.part.episodes.at(0)?.publishedAt;

// The members' video room: the newest program first, then what you were
// watching (whatever the filter or search), then every program by year. A
// genre filter turns each tile into that genre's part, so a tile always
// opens what it shows.
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

  // One element for both cases, so switching genres animates its height
  // instead of mounting a new block. A lost part is never featured.
  const newestPart =
    foundParts.find((i) => !i.part.missing) ?? foundParts.at(0);
  const newestProgram = programs.at(0);
  let featured: Featured | null = null;
  if (!searching && genre && newestPart) {
    featured = { kind: "part", ...newestPart, genre };
  } else if (!searching && !genre && newestProgram) {
    featured = { kind: "program", program: newestProgram };
  }

  let results: ReactNode;
  if (genre ? foundParts.length === 0 : foundPrograms.length === 0) {
    results = <p className="text-text-muted">No hay videos que coincidan.</p>;
  } else if (genre) {
    const Groups = searching ? YearGrids : YearRows;
    results = (
      <Groups
        items={foundParts.filter((i) => i !== newestPart || searching)}
        dateOf={partDate}
        compact
        render={(i) => (
          <PartTile key={partKey(i)} item={i} inRow={!searching} />
        )}
      />
    );
  } else {
    const Groups = searching ? YearGrids : YearRows;
    results = (
      <Groups
        items={searching ? foundPrograms : programs.slice(1)}
        dateOf={programDate}
        compact={false}
        render={(p) => (
          <ProgramTile key={p.number} program={p} inRow={!searching} />
        )}
      />
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
      {featured ? <FeaturedVideo item={featured} /> : null}
      <ContinueRow programs={programs} />
      {results}
    </section>
  );
}
