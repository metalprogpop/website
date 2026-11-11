import { poneRecUrlPath, type PoneRec } from "shared";
import { API_URL } from "./api";
import type { PlayerEpisode } from "../player/PlayerProvider";

export const PONE_REC_PATH = "/fan-clu/pone-rec";

// Player numbers for Poné Rec™ sit far above any episode's, so their saved
// positions never collide.
const PLAYER_NUMBER_OFFSET = 100_000;

export const poneRecPlayerNumber = (program: number) =>
  PLAYER_NUMBER_OFFSET + program;

export const thumbnailUrl = (rec: PoneRec) =>
  rec.thumbnailPath ? `${API_URL}${rec.thumbnailPath}` : null;

// Plays in the site's mini-player: the title links back to Poné Rec™, and
// the player re-signs the URL if it expires.
export const poneRecAsPlayerEpisode = (
  rec: PoneRec,
  audioUrl: string,
  fallbackArtwork: string,
): PlayerEpisode => ({
  number: poneRecPlayerNumber(rec.program),
  slug: "pone-rec",
  title: rec.mainTopic,
  album: rec.mainTopic,
  band: `Poné Rec™ · programa ${String(rec.program)}`,
  artworkUrl: thumbnailUrl(rec) ?? fallbackArtwork,
  audioUrl,
  durationSeconds: rec.durationSeconds,
  href: PONE_REC_PATH,
  refreshUrlPath: poneRecUrlPath(rec.program),
});

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

// Matches the main topic and the tags, ignoring accents and case. A number
// matches the program.
export const poneRecMatches = (rec: PoneRec, search: string) => {
  const needle = normalize(search.trim());
  if (!needle) {
    return true;
  }
  if (/^\d+$/.test(needle)) {
    return String(rec.program) === needle;
  }
  return [rec.mainTopic, ...rec.tags].some((text) =>
    normalize(text).includes(needle),
  );
};

// "21 min".
export const minutes = (seconds: number) =>
  `${String(Math.max(1, Math.round(seconds / 60)))} min`;
