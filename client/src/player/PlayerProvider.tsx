import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { EpisodeSummary } from "shared";
import {
  clearPosition,
  saveEpisode,
  savePosition,
  saveRate,
  savedEpisode,
  savedPosition,
  savedRate,
} from "./storage";
import { useMediaSession } from "./useMediaSession";

export type PlayerEpisode = Pick<
  EpisodeSummary,
  | "number"
  | "slug"
  | "title"
  | "album"
  | "band"
  | "artworkUrl"
  | "audioUrl"
  | "durationSeconds"
>;

export const PLAYBACK_RATES = [1, 1.25, 1.5, 2] as const;

// How often the position is remembered while playing.
const SAVE_EVERY_SECONDS = 5;
// Closer than this to the end, an episode counts as finished: the next play
// starts from the beginning.
const FINISHED_MARGIN_SECONDS = 30;

type PlayerControls = {
  episode: PlayerEpisode | null;
  playing: boolean;
  rate: number;
  // Plays the given episode (switching to it if needed), or resumes.
  play: (episode?: PlayerEpisode) => void;
  pause: () => void;
  seek: (seconds: number) => void;
  skip: (deltaSeconds: number) => void;
  setRate: (rate: number) => void;
  // Stops and dismisses the mini-player.
  close: () => void;
};

type PlayerTime = { currentTime: number; duration: number };

// Split in two so components that only care about what is playing don't
// re-render on every timeupdate (several times a second).
const ControlsContext = createContext<PlayerControls | null>(null);
const TimeContext = createContext<PlayerTime>({ currentTime: 0, duration: 0 });

const resumePoint = (episode: PlayerEpisode): number => {
  const seconds = savedPosition(episode.number);
  return seconds < episode.durationSeconds - FINISHED_MARGIN_SECONDS
    ? seconds
    : 0;
};

// One <audio> for the whole app, so playback survives navigation. The last
// episode and where each one was left are remembered in this browser.
export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [episode, setEpisode] = useState<PlayerEpisode | null>(savedEpisode);
  const episodeRef = useRef(episode);
  // The episode whose audio is loaded in the element, if any. A remembered
  // episode is shown right away but only loaded on play.
  const loadedRef = useRef<number | null>(null);
  // Where to jump once the loaded audio's metadata arrives.
  const pendingSeekRef = useRef(0);
  const lastSavedRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(() =>
    savedRate(PLAYBACK_RATES),
  );
  const rateRef = useRef(playbackRate);
  const [time, setTime] = useState<PlayerTime>(() =>
    episode
      ? {
          currentTime: resumePoint(episode),
          duration: episode.durationSeconds,
        }
      : { currentTime: 0, duration: 0 },
  );

  const play = useCallback((next?: PlayerEpisode) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    if (next && next.number !== episodeRef.current?.number) {
      episodeRef.current = next;
      setEpisode(next);
      saveEpisode(next);
      setTime({
        currentTime: resumePoint(next),
        duration: next.durationSeconds,
      });
    }
    const current = episodeRef.current;
    if (!current) {
      return;
    }
    if (loadedRef.current !== current.number) {
      loadedRef.current = current.number;
      pendingSeekRef.current = resumePoint(current);
      lastSavedRef.current = pendingSeekRef.current;
      audio.src = current.audioUrl;
      // A new source resets playbackRate to defaultPlaybackRate.
      audio.defaultPlaybackRate = rateRef.current;
      audio.playbackRate = rateRef.current;
    }
    // play() rejects when the browser blocks it or the source fails.
    Promise.resolve(audio.play()).catch(() => {
      setPlaying(false);
    });
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    const current = episodeRef.current;
    if (!audio || !current) {
      return;
    }
    const target = Math.max(0, seconds);
    if (loadedRef.current === current.number) {
      audio.currentTime = target;
    } else {
      pendingSeekRef.current = target;
      setTime((prev) => ({ ...prev, currentTime: target }));
    }
    savePosition(current.number, target);
  }, []);

  const skip = useCallback(
    (deltaSeconds: number) => {
      const audio = audioRef.current;
      const current = episodeRef.current;
      if (!audio || !current) {
        return;
      }
      const from =
        loadedRef.current === current.number
          ? audio.currentTime
          : pendingSeekRef.current;
      seek(from + deltaSeconds);
    },
    [seek],
  );

  const changeRate = useCallback((next: number) => {
    rateRef.current = next;
    const audio = audioRef.current;
    if (audio) {
      audio.defaultPlaybackRate = next;
      audio.playbackRate = next;
    }
    setPlaybackRate(next);
    saveRate(next);
  }, []);

  const close = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    loadedRef.current = null;
    episodeRef.current = null;
    setEpisode(null);
    saveEpisode(null);
  }, []);

  const controls = useMemo<PlayerControls>(
    () => ({
      episode,
      playing,
      rate: playbackRate,
      play,
      pause,
      seek,
      skip,
      setRate: changeRate,
      close,
    }),
    [
      episode,
      playing,
      playbackRate,
      play,
      pause,
      seek,
      skip,
      changeRate,
      close,
    ],
  );

  useMediaSession(controls, audioRef);

  const syncTime = (audio: HTMLAudioElement) => {
    setTime({
      currentTime: audio.currentTime,
      duration: Number.isFinite(audio.duration)
        ? audio.duration
        : (episodeRef.current?.durationSeconds ?? 0),
    });
  };

  const rememberPosition = (audio: HTMLAudioElement, force = false) => {
    const current = episodeRef.current;
    if (!current) {
      return;
    }
    if (loadedRef.current !== current.number) {
      return;
    }
    if (
      force ||
      Math.abs(audio.currentTime - lastSavedRef.current) >= SAVE_EVERY_SECONDS
    ) {
      lastSavedRef.current = audio.currentTime;
      savePosition(current.number, audio.currentTime);
    }
  };

  return (
    <ControlsContext.Provider value={controls}>
      <TimeContext.Provider value={time}>
        {children}
        <audio
          ref={audioRef}
          preload="metadata"
          onPlay={() => {
            setPlaying(true);
          }}
          onPause={(e) => {
            setPlaying(false);
            rememberPosition(e.currentTarget, true);
          }}
          onEnded={() => {
            setPlaying(false);
            if (episodeRef.current) {
              clearPosition(episodeRef.current.number);
            }
          }}
          onTimeUpdate={(e) => {
            syncTime(e.currentTarget);
            rememberPosition(e.currentTarget);
          }}
          onLoadedMetadata={(e) => {
            const audio = e.currentTarget;
            if (pendingSeekRef.current > 0) {
              audio.currentTime = pendingSeekRef.current;
              pendingSeekRef.current = 0;
            }
            syncTime(audio);
          }}
        />
      </TimeContext.Provider>
    </ControlsContext.Provider>
  );
}

export function usePlayer(): PlayerControls {
  const controls = useContext(ControlsContext);
  if (!controls) {
    throw new Error("usePlayer must be used inside PlayerProvider");
  }
  return controls;
}

export function usePlayerTime(): PlayerTime {
  return useContext(TimeContext);
}
