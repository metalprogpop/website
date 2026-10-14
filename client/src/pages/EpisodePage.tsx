import { Link, Navigate, useParams } from "react-router-dom";
import { episodeNumberFromPath, episodePath } from "shared";
import { Header } from "../components/landing/Header";
import { Footer } from "../components/landing/Footer";
import { Container } from "../components/layout/Container";
import { Section } from "../components/layout/Section";
import { EpisodeDetails } from "../components/episode/EpisodeDetails";
import { EpisodeNav } from "../components/episode/EpisodeNav";
import { RelatedEpisodes } from "../components/episode/RelatedEpisodes";
import { EpisodeNotFoundError, useEpisode } from "../hooks/useEpisodes";

// /episodes/<number>-<slug>: the number identifies the episode; an outdated
// or missing slug redirects to the current one.
export function EpisodePage() {
  const { episodeRef = "" } = useParams();
  const number = episodeNumberFromPath(`/episodes/${episodeRef}`);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {number === null ? (
          <NotFound />
        ) : (
          <EpisodeContent number={number} episodeRef={episodeRef} />
        )}
      </main>
      <Footer />
    </div>
  );
}

function EpisodeContent({
  number,
  episodeRef,
}: {
  number: number;
  episodeRef: string;
}) {
  const { data: episode, isLoading, error } = useEpisode(number);

  if (isLoading) {
    return (
      <Section>
        <Container>
          <div
            role="status"
            aria-label="Cargando episodio"
            className="flex min-h-[40vh] items-center justify-center"
          >
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
          </div>
        </Container>
      </Section>
    );
  }

  if (error instanceof EpisodeNotFoundError) {
    return <NotFound />;
  }

  if (!episode) {
    return (
      <Section>
        <Container>
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            No se pudo cargar el episodio. Probá de nuevo en un rato.
          </div>
        </Container>
      </Section>
    );
  }

  const canonical = episodePath(episode);
  if (`/episodes/${episodeRef}` !== canonical) {
    return <Navigate to={canonical} replace />;
  }

  return (
    <>
      <Section>
        <Container>
          <EpisodeDetails episode={episode} />
          <div className="mt-16">
            <EpisodeNav previous={episode.previous} next={episode.next} />
          </div>
        </Container>
      </Section>
      {episode.related.length > 0 && (
        <Section className="border-t border-border">
          <Container>
            <RelatedEpisodes episodes={episode.related} />
          </Container>
        </Section>
      )}
    </>
  );
}

function NotFound() {
  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <span className="mb-3 inline-block font-display text-sm font-semibold uppercase tracking-widest text-brand">
            Error 404
          </span>
          <h1 className="mb-6 font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            No encontramos este episodio
          </h1>
          <p className="mb-10 text-text-secondary">
            Puede que el link esté mal o que el episodio ya no esté publicado.
          </p>
          <Link
            to="/episodes"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-brand px-6 font-display text-base font-semibold text-white transition-all hover:bg-brand-hover"
          >
            Ver todos los episodios
          </Link>
        </div>
      </Container>
    </Section>
  );
}
