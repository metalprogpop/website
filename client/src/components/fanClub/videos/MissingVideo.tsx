import { Link } from "react-router-dom";
import { VideoOff } from "lucide-react";
import { episodePath, type FanClubVideoPart } from "shared";
import { EpisodeArtwork } from "../../landing/EpisodeArtwork";

// A lost part's slot: says plainly that the video doesn't exist and that it
// was our fault, so nobody thinks the site is broken. The episode is fine.
export function MissingVideo({ part }: { part: FanClubVideoPart }) {
  const episode = part.episodes.at(0);
  return (
    <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl bg-text-primary shadow-xl">
      {episode ? (
        <div className="absolute inset-0 opacity-20 blur-sm grayscale">
          <EpisodeArtwork url={episode.artworkUrl} alt="" sizes="800px" />
        </div>
      ) : null}
      <div className="relative max-w-md px-6 text-center text-white">
        <VideoOff
          className="mx-auto mb-4 h-10 w-10 text-brand"
          aria-hidden="true"
        />
        <p className="mb-2 font-display text-xl font-bold">
          Este video no existe
        </p>
        <p className="text-sm text-white/80">
          Tuvimos un problema al grabar esta parte y el video se perdió. Fue
          culpa nuestra, perdón.
          {episode ? " El episodio sí está, y lo podés escuchar." : ""}
        </p>
        {episode ? (
          <Link
            to={episodePath(episode)}
            className="mt-5 inline-flex h-11 items-center rounded-lg bg-brand px-5 font-display text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            Escuchar el episodio
          </Link>
        ) : null}
      </div>
    </div>
  );
}
