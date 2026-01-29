import type { Episode } from 'shared';
import { Section } from '../layout/Section';
import { Container } from '../layout/Container';
import { EpisodeCard } from './EpisodeCard';

type LatestEpisodesProps = {
  episodes: Episode[];
};

export function LatestEpisodes({ episodes }: LatestEpisodesProps) {
  const displayedEpisodes = episodes.slice(0, 3);

  return (
    <Section id="episodes" className="bg-surface/30">
      <Container>
        <h2 className="mb-10 text-center text-2xl font-bold text-text-primary sm:text-3xl">
          Latest Episodes
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedEpisodes.map((episode) => (
            <EpisodeCard key={episode.id} episode={episode} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
