import { useState } from "react";
import { Loader2, Pause, Play } from "lucide-react";
import { toast } from "sonner";
import type { PoneRec } from "shared";
import logo from "../../../assets/images/logo-caras.png";
import { fetchPoneRecUrl } from "../../../hooks/usePoneRecs";
import {
  poneRecAsPlayerEpisode,
  poneRecPlayerNumber,
} from "../../../lib/poneRec";
import { usePlayer } from "../../../player/PlayerProvider";

// Plays an episode in the site's mini-player, so it keeps going while you
// browse. The URL is signed right before playing.
export function PoneRecPlayButton({ rec }: { rec: PoneRec }) {
  const player = usePlayer();
  const [signing, setSigning] = useState(false);
  const isCurrent = player.episode?.number === poneRecPlayerNumber(rec.program);
  const isPlaying = isCurrent && player.playing;

  const toggle = async () => {
    if (isPlaying) {
      player.pause();
      return;
    }
    if (isCurrent) {
      player.play();
      return;
    }
    setSigning(true);
    try {
      const url = await fetchPoneRecUrl(rec.program);
      player.play(poneRecAsPlayerEpisode(rec, url, logo));
    } catch {
      toast.error("No pudimos cargar este Poné Rec™. Probá de nuevo.");
    } finally {
      setSigning(false);
    }
  };

  return (
    <button
      type="button"
      aria-label={`${isPlaying ? "Pausar" : "Escuchar"}: ${rec.mainTopic}`}
      disabled={signing}
      onClick={() => void toggle()}
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-all hover:scale-105 hover:bg-brand-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:opacity-80"
    >
      {signing ? (
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      ) : isPlaying ? (
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
