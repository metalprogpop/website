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
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function EpisodeCard({ episode }: EpisodeCardProps) {
  return (
    <Card variant="interactive" className="group">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={episode.artworkUrl}
          alt={`Episode ${episode.episodeNumber} artwork`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-md bg-brand px-2 py-1 text-xs font-semibold text-white">
          EP {episode.episodeNumber}
        </span>
      </div>

      <div className="p-4">
        <h3 className="mb-2 line-clamp-2 text-base font-semibold text-text-primary transition-colors group-hover:text-brand">
          {episode.title}
        </h3>

        <p className="mb-3 line-clamp-2 text-sm text-text-secondary">{episode.description}</p>

        <div className="flex items-center gap-3 text-xs text-text-secondary">
          <span>{formatDuration(episode.durationSeconds)}</span>
          <span className="text-border">|</span>
          <span>{formatDate(episode.publishedAt)}</span>
        </div>
      </div>
    </Card>
  );
}
