import { z } from "zod";
import { episodeSummarySchema } from "./episode.ts";

// Public Hall of Fans: display names only, oldest supporters first.
export const hallOfFansResponseSchema = z.object({
  names: z.array(z.string()),
});

export type HallOfFansResponse = z.infer<typeof hallOfFansResponseSchema>;

// --- Program videos (members only) ---

// What a video card needs from the episode a part belongs to.
export const videoEpisodeSchema = episodeSummarySchema.pick({
  number: true,
  slug: true,
  title: true,
  album: true,
  band: true,
  genre: true,
  artworkUrl: true,
  publishedAt: true,
});

export type VideoEpisode = z.infer<typeof videoEpisodeSchema>;

// Part k of program N is episode 3 × (N − 1) + k. Program 1 is one video
// covering its three episodes. A missing part was lost (badly recorded): it
// keeps its slot, with its episode, but has nothing to play.
export const fanClubVideoPartSchema = z.object({
  part: z.number().int().positive(),
  missing: z.boolean(),
  episodes: z.array(videoEpisodeSchema),
});

export type FanClubVideoPart = z.infer<typeof fanClubVideoPartSchema>;

export const fanClubProgramSchema = z.object({
  number: z.number().int().positive(),
  // When its last episode was published; null if the feed doesn't have it.
  publishedAt: z.string().nullable(),
  parts: z.array(fanClubVideoPartSchema),
});

export type FanClubProgram = z.infer<typeof fanClubProgramSchema>;

// Newest program first.
export const fanClubVideosResponseSchema = z.object({
  programs: z.array(fanClubProgramSchema),
});

export type FanClubVideosResponse = z.infer<typeof fanClubVideosResponseSchema>;

// Presigned URLs for one part: to play it, and to download it as a file.
export const videoUrlsSchema = z.object({
  url: z.string().url(),
  downloadUrl: z.string().url(),
  expiresAt: z.string(),
});

export type VideoUrls = z.infer<typeof videoUrlsSchema>;

// Staff-run sync with the media bucket. By default it re-checks the two
// newest programs and adds any program it doesn't know; `full` re-checks
// everything and hides the videos no longer in the bucket.
export const videoSyncRequestSchema = z
  .object({ full: z.boolean().default(false) })
  .strict();

export type VideoSyncRequest = z.infer<typeof videoSyncRequestSchema>;

export const videoSyncResultSchema = z.object({
  // Live videos after the sync.
  total: z.number().int().nonnegative(),
  added: z.number().int().nonnegative(),
  updated: z.number().int().nonnegative(),
  hidden: z.number().int().nonnegative(),
  // Files in the bucket that aren't program parts (specials, stray files).
  ignored: z.number().int().nonnegative(),
});

export type VideoSyncResult = z.infer<typeof videoSyncResultSchema>;
