import { Link } from "react-router-dom";
import { episodePath, type EpisodeSummary } from "shared";
import { formatDate, formatDuration } from "../../lib/format";
import { CardPlayButton } from "../episode/CardPlayButton";
import { GenreBadge } from "../episode/GenreBadge";
import { Card } from "../ui/brand/Card";
import { EpisodeArtwork } from "./EpisodeArtwork";

type EpisodeCardProps = {
  episode: EpisodeSummary;
  // Load the artwork right away (cards visible without scrolling).
  eager?: boolean;
};

export function EpisodeCard({ episode, eager = false }: EpisodeCardProps) {
  return (
    <Card variant="interactive" className="group relative">
      <div className="relative aspect-square overflow-hidden">
        <EpisodeArtwork url={episode.artworkUrl} alt="" eager={eager} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {episode.number > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-brand px-3 py-1 font-display text-xs font-bold text-white shadow-lg">
            EP {episode.number}
          </span>
        )}
        {episode.genre && (
          <span className="absolute right-3 top-3">
            <GenreBadge genre={episode.genre} />
          </span>
        )}
        <CardPlayButton episode={episode} />
      </div>

      <div className="p-5">
        <h3 className="mb-2 line-clamp-2 font-display text-lg font-bold text-text-primary transition-colors group-hover:text-brand">
          {/* The link's hit area stretches over the whole card. */}
          <Link
            to={episodePath(episode)}
            className="after:absolute after:inset-0 focus:outline-none focus-visible:after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-brand"
          >
            {episode.title}
          </Link>
        </h3>

        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-text-secondary">
          {episode.excerpt}
        </p>

        <div className="flex items-center gap-3 text-xs font-medium text-text-muted">
          <span className="whitespace-nowrap">
            {formatDuration(episode.durationSeconds)}
          </span>
          <span className="h-1 w-1 shrink-0 rounded-full bg-text-muted" />
          <span className="whitespace-nowrap">
            {formatDate(episode.publishedAt)}
          </span>
        </div>
      </div>
    </Card>
  );
}
