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
};

type PlayerTime = { currentTime: number; duration: number };

// Split in two so components that only care about what is playing don't
// re-render on every timeupdate (several times a second).
const ControlsContext = createContext<PlayerControls | null>(null);
const TimeContext = createContext<PlayerTime>({ currentTime: 0, duration: 0 });

// One <audio> for the whole app, so playback survives navigation.
export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const episodeRef = useRef<PlayerEpisode | null>(null);
  const [episode, setEpisode] = useState<PlayerEpisode | null>(null);
  const [playing, setPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [time, setTime] = useState<PlayerTime>({ currentTime: 0, duration: 0 });

  const play = useCallback((next?: PlayerEpisode) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    if (next && next.number !== episodeRef.current?.number) {
      episodeRef.current = next;
      setEpisode(next);
      setTime({ currentTime: 0, duration: next.durationSeconds });
      audio.src = next.audioUrl;
    }
    if (!episodeRef.current) {
      return;
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
    if (audio) {
      audio.currentTime = seconds;
    }
  }, []);

  const skip = useCallback((deltaSeconds: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.max(0, audio.currentTime + deltaSeconds);
    }
  }, []);

  const changeRate = useCallback((next: number) => {
    const audio = audioRef.current;
    if (audio) {
      // defaultPlaybackRate survives switching episodes; playbackRate not.
      audio.defaultPlaybackRate = next;
      audio.playbackRate = next;
    }
    setPlaybackRate(next);
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
    }),
    [episode, playing, playbackRate, play, pause, seek, skip, changeRate],
  );

  const syncTime = (audio: HTMLAudioElement) => {
    setTime({
      currentTime: audio.currentTime,
      duration: Number.isFinite(audio.duration)
        ? audio.duration
        : (episodeRef.current?.durationSeconds ?? 0),
    });
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
          onPause={() => {
            setPlaying(false);
          }}
          onEnded={() => {
            setPlaying(false);
          }}
          onTimeUpdate={(e) => {
            syncTime(e.currentTarget);
          }}
          onLoadedMetadata={(e) => {
            syncTime(e.currentTarget);
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
