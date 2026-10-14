import { Pause, Play } from "lucide-react";
import { usePlayer, type PlayerEpisode } from "../../player/PlayerProvider";

type CardPlayButtonProps = {
  episode: PlayerEpisode;
};

// Plays an episode straight from its card. With a mouse it shows on hover
// (and on keyboard focus); on touch screens, which have no hover, it is always
// visible, with a 48px target.
export function CardPlayButton({ episode }: CardPlayButtonProps) {
  const player = usePlayer();
  const isPlaying = player.playing && player.episode?.number === episode.number;

  return (
    <button
      type="button"
      aria-label={`${isPlaying ? "Pausar" : "Reproducir"} ${episode.title}`}
      onClick={() => {
        if (isPlaying) {
          player.pause();
        } else {
          player.play(episode);
        }
      }}
      className={`absolute bottom-3 right-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-black/20 transition-all duration-200 hover:scale-105 hover:bg-brand-hover focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white ${
        isPlaying
          ? ""
          : "pointer-fine:translate-y-2 pointer-fine:opacity-0 pointer-fine:group-hover:translate-y-0 pointer-fine:group-hover:opacity-100 pointer-fine:focus-visible:translate-y-0"
      }`}
    >
      {isPlaying ? (
        <Pause className="h-5 w-5" fill="currentColor" aria-hidden="true" />
      ) : (
        <Play
          className="ml-0.5 h-5 w-5"
          fill="currentColor"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
