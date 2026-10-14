import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Container } from "../components/layout/Container";
import { Section } from "../components/layout/Section";
import { EpisodeCard } from "../components/landing/EpisodeCard";
import { EpisodeGridSkeleton } from "../components/landing/EpisodeCardSkeleton";
import { Header } from "../components/landing/Header";
import { Footer } from "../components/landing/Footer";
import { episodesQueryOptions } from "../hooks/useEpisodes";

export function EpisodesPage() {
  const [search, setSearch] = useState("");

  const {
    data: episodes,
    isLoading,
    isError,
  } = useQuery(episodesQueryOptions);

  const filteredEpisodes = useMemo(() => {
    if (!episodes) {
      return [];
    }
    if (!search.trim()) {
      return episodes;
    }

    const searchLower = search.toLowerCase();
    return episodes.filter((episode) =>
      episode.title.toLowerCase().includes(searchLower),
    );
  }, [episodes, search]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <Section>
          <Container>
            <div className="mb-12 text-center">
              <span className="mb-3 inline-block font-display text-sm font-semibold uppercase tracking-widest text-brand">
                Catálogo
              </span>
              <h1 className="mb-3 font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                Todos los episodios
              </h1>
              {!isLoading && !isError && (
                <p className="text-text-secondary">
                  {episodes?.length ?? 0} episodios disponibles
                </p>
              )}
            </div>

            <div className="mb-10 flex justify-center">
              <input
                type="text"
                placeholder="Buscar episodios..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-md rounded-lg border border-border bg-surface px-4 py-3 font-display text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>

            {isLoading && <EpisodeGridSkeleton count={6} />}

            {isError && (
              <div className="py-12 text-center text-text-secondary">
                Error al cargar los episodios. Por favor, intenta de nuevo más
                tarde.
              </div>
            )}

            {!isLoading && !isError && (
              <>
                {filteredEpisodes.length === 0 ? (
                  <div className="py-12 text-center text-text-secondary">
                    No se encontraron episodios que coincidan con &ldquo;
                    {search}&rdquo;
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {filteredEpisodes.map((episode, index) => (
                      <EpisodeCard
                        key={episode.number}
                        episode={episode}
                        eager={index < 3}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </Container>
        </Section>
      </main>

      <Footer />
    </div>
  );
}
