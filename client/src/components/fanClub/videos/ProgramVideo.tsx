import { Download } from "lucide-react";
import {
  episodePath,
  type FanClubProgram,
  type FanClubVideoPart,
} from "shared";
import { Link } from "react-router-dom";
import { usePartUrls } from "../../../hooks/useFanClubVideos";
import { formatDate } from "../../../lib/format";
import { partAlbum, partBand } from "../../../lib/fanClubVideos";
import { GenreBadge } from "../../episode/GenreBadge";
import { ButtonLink } from "../../ui/brand/Button";
import { MissingVideo } from "./MissingVideo";
import { VideoPlayer } from "./VideoPlayer";

// The current part: its player (or the lost-video notice), what it is, a
// link to its episode and, for videos, a download.
export function ProgramVideo({
  program,
  part,
  autoPlay,
  onEnded,
}: {
  program: FanClubProgram;
  part: FanClubVideoPart;
  autoPlay: boolean;
  onEnded: () => void;
}) {
  // Shares the player's query, so it signs nothing extra.
  const urls = usePartUrls(program.number, part.part, !part.missing);
  const episode = part.episodes.at(0);
  const date = episode?.publishedAt ?? program.publishedAt;

  return (
    <div>
      {part.missing ? (
        <MissingVideo part={part} />
      ) : (
        <VideoPlayer
          program={program.number}
          part={part}
          autoPlay={autoPlay}
          onEnded={onEnded}
        />
      )}
      <p className="mt-5 font-display text-sm font-semibold uppercase tracking-widest text-brand">
        Programa {program.number} ·{" "}
        {part.episodes.length > 1
          ? `partes ${String(part.part)} a ${String(part.part + part.episodes.length - 1)}`
          : `parte ${String(part.part)}`}
      </p>
      <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-text-primary">
        {partAlbum(part)}
      </h1>
      <p className="mt-1 font-display text-lg font-semibold text-text-secondary">
        {partBand(part)}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-text-muted">
        {episode?.genre && part.episodes.length === 1 ? (
          <GenreBadge genre={episode.genre} />
        ) : null}
        {date ? <span>{formatDate(date)}</span> : null}
        {part.episodes.map((e) => (
          <Link
            key={e.number}
            to={episodePath(e)}
            className="font-display font-semibold text-brand transition-colors hover:text-brand-hover"
          >
            {part.episodes.length > 1
              ? `Escuchar el episodio ${String(e.number)}`
              : "Escuchar el episodio"}
          </Link>
        ))}
        {urls.data && !part.missing ? (
          <ButtonLink
            href={urls.data.downloadUrl}
            variant="secondary"
            size="sm"
            className="sm:ml-auto"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Descargar
          </ButtonLink>
        ) : null}
      </div>
    </div>
  );
}
