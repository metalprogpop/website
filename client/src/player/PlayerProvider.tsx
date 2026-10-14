import { createContext, useContext, type ReactNode } from "react";
import type { PlayerControls, PlayerTime } from "./types";
import { useMediaSession } from "./useMediaSession";
import { usePlayerEngine } from "./usePlayerEngine";

export {
  PLAYBACK_RATES,
  type PlayerControls,
  type PlayerEpisode,
  type PlayerTime,
} from "./types";

// Split in two so components that only care about what is playing don't
// re-render on every timeupdate (several times a second).
const ControlsContext = createContext<PlayerControls | null>(null);
const TimeContext = createContext<PlayerTime>({ currentTime: 0, duration: 0 });

// One <audio> for the whole app, so playback survives navigation.
export function PlayerProvider({ children }: { children: ReactNode }) {
  const { controls, time, audioProps } = usePlayerEngine();
  useMediaSession(controls, audioProps.ref);

  return (
    <ControlsContext.Provider value={controls}>
      <TimeContext.Provider value={time}>
        {children}
        <audio {...audioProps} />
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
