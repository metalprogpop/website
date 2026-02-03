import { Link } from 'react-router-dom';
import { Section } from '../layout/Section';
import { Container } from '../layout/Container';
import { EpisodeCard } from './EpisodeCard';
import { useEpisodes } from '../../hooks/useEpisodes';

const HOMEPAGE_EPISODE_LIMIT = 9;

export function LatestEpisodes() {
  const { episodes, isLoading, isError } = useEpisodes();
  const displayedEpisodes = episodes.slice(0, HOMEPAGE_EPISODE_LIMIT);

  return (
    <Section id="episodes">
      <Container>
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block font-display text-sm font-semibold uppercase tracking-widest text-brand">
            Nuevos Episodios
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Últimos Lanzamientos
          </h2>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
          </div>
        )}

        {isError && (
          <div className="py-12 text-center text-text-secondary">
            Error al cargar los episodios. Por favor, intenta de nuevo más tarde.
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {displayedEpisodes.map((episode) => (
                <EpisodeCard key={episode.id} episode={episode} />
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                to="/episodes"
                className="group inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 font-display text-sm font-semibold text-white transition-all hover:bg-brand-dark"
              >
                Ver todos los episodios
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </>
        )}
      </Container>
    </Section>
  );
}
