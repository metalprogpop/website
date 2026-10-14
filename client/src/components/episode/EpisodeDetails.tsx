import { episodePath, type EpisodeDetail } from "shared";
import { formatDate, formatDuration } from "../../lib/format";
import { EpisodeArtwork } from "../landing/EpisodeArtwork";
import { EpisodePlayer } from "./EpisodePlayer";
import { GenreBadge } from "./GenreBadge";
import { ListenElsewhere } from "./ListenElsewhere";
import { ShareButton } from "./ShareButton";

type EpisodeDetailsProps = {
  episode: EpisodeDetail;
};

// Artwork, title, player and description: what Spotify, Apple Podcasts or
// Audioboom show for an episode, without their platform-specific extras.
export function EpisodeDetails({ episode }: EpisodeDetailsProps) {
  const url = `${window.location.origin}${episodePath(episode)}`;

  return (
    <article className="grid gap-10 md:grid-cols-5 md:gap-12">
      <div className="md:col-span-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-border shadow-sm">
          <EpisodeArtwork
            url={episode.artworkUrl}
            alt={`Tapa de ${episode.album}`}
            eager
            sizes="(min-width: 768px) 40vw, 100vw"
          />
        </div>
      </div>

      <div className="md:col-span-3">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="font-display text-sm font-semibold uppercase tracking-widest text-brand">
            {episode.number > 0
              ? `Episodio ${String(episode.number)}`
              : "Presentación"}
          </span>
          {episode.genre && <GenreBadge genre={episode.genre} />}
        </div>

        <h1 className="font-display text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
          {episode.album}
        </h1>
        {episode.band && (
          <p className="mt-2 font-display text-xl font-semibold text-text-secondary sm:text-2xl">
            {episode.band}
          </p>
        )}
        <p className="mt-4 text-sm font-medium text-text-muted">
          {formatDate(episode.publishedAt)} ·{" "}
          {formatDuration(episode.durationSeconds)}
        </p>

        <div className="mt-8">
          <EpisodePlayer episode={episode} />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
          <ShareButton title={episode.title} url={url} />
          <ListenElsewhere />
        </div>

        <div
          className="episode-description mt-10 text-text-secondary"
          // Sanitized on the server (see server/src/episodes/feed.ts).
          dangerouslySetInnerHTML={{ __html: episode.descriptionHtml }}
        />
      </div>
    </article>
  );
}
