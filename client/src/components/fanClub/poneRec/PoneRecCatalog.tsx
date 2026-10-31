import { useState } from "react";
import type { PoneRec } from "shared";
import { usePoneRecs } from "../../../hooks/usePoneRecs";
import { groupByYear } from "../../../lib/fanClubVideos";
import { poneRecMatches } from "../../../lib/poneRec";
import { Skeleton } from "../../ui/skeleton";
import { PoneRecCard } from "./PoneRecCard";

const GRID = "grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4";

function CatalogSkeleton() {
  return (
    <div role="status" aria-label="Cargando Poné Rec™" className={GRID}>
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index}>
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <Skeleton className="mt-3 h-5 w-4/5" />
          <Skeleton className="mt-2 h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

const dateOf = (rec: PoneRec) => rec.publishedAt;

// Every episode by year, newest first, with a search over what was talked
// about: the main topic, the topics and the tags.
export function PoneRecCatalog() {
  const { data: episodes, isLoading, isError } = usePoneRecs();
  const [search, setSearch] = useState("");

  if (isLoading) {
    return <CatalogSkeleton />;
  }
  if (isError || !episodes) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        No pudimos cargar Poné Rec™. Probá de nuevo en un rato.
      </div>
    );
  }

  const found = episodes.filter((rec) => poneRecMatches(rec, search));
  return (
    <>
      <input
        type="search"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
        placeholder="Buscar por tema: olores, colegio, viajes…"
        aria-label="Buscar en Poné Rec™"
        className="mb-10 w-full rounded-lg border border-border bg-surface px-4 py-3 font-display text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 md:max-w-md"
      />
      {found.length === 0 ? (
        <p className="text-text-muted">No hay episodios que coincidan.</p>
      ) : (
        groupByYear(found, dateOf).map(([year, group]) => (
          <section key={year ?? "none"} className="mb-12">
            <h2 className="mb-4 font-display text-xl font-bold text-text-primary">
              {year ? String(year) : "Sin fecha"}
            </h2>
            <div className={GRID}>
              {group.map((rec) => (
                <PoneRecCard key={rec.program} rec={rec} />
              ))}
            </div>
          </section>
        ))
      )}
    </>
  );
}
