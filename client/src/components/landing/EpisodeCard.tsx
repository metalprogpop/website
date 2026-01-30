import type { Episode } from 'shared';
import { Card } from '../ui/Card';

type EpisodeCardProps = {
  episode: Episode;
};

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes} min`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function EpisodeCard({ episode }: EpisodeCardProps) {
  return (
    <Card variant="interactive" className="group">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={episode.artworkUrl}
          alt={`Episodio ${episode.episodeNumber}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="absolute left-3 top-3 rounded-full bg-brand px-3 py-1 font-display text-xs font-bold text-white shadow-lg">
          EP {episode.episodeNumber}
        </span>
      </div>

      <div className="p-5">
        <h3 className="mb-2 line-clamp-2 font-display text-lg font-bold text-text-primary transition-colors group-hover:text-brand">
          {episode.title}
        </h3>

        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-text-secondary">{episode.description}</p>

        <div className="flex items-center gap-3 text-xs font-medium text-text-muted">
          <span>{formatDuration(episode.durationSeconds)}</span>
          <span className="h-1 w-1 rounded-full bg-text-muted" />
          <span>{formatDate(episode.publishedAt)}</span>
        </div>
      </div>
    </Card>
  );
}
