import { z } from 'zod';

export const episodeSchema = z.object({
  id: z.string(),
  spotifyEpisodeId: z.string().optional(),
  title: z.string(),
  description: z.string(),
  episodeNumber: z.number().int().positive().optional(),
  publishedAt: z.string(),
  durationSeconds: z.number().int().positive(),
  artworkUrl: z.string().url(),
  spotifyUrl: z.string().url().optional(),
  applePodcastsUrl: z.string().url().optional(),
  youtubeUrl: z.string().url().optional(),
});

export type Episode = z.infer<typeof episodeSchema>;

export const episodesResponseSchema = z.object({
  items: z.array(episodeSchema),
  total: z.number().int().nonnegative(),
  hasMore: z.boolean(),
});

export type EpisodesResponse = z.infer<typeof episodesResponseSchema>;
