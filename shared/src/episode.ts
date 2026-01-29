import { z } from 'zod';

export const episodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  episodeNumber: z.number().int().positive(),
  publishedAt: z.string(),
  durationSeconds: z.number().int().positive(),
  artworkUrl: z.string().url(),
  spotifyUrl: z.string().url().optional(),
  applePodcastsUrl: z.string().url().optional(),
  youtubeUrl: z.string().url().optional(),
});

export type Episode = z.infer<typeof episodeSchema>;
