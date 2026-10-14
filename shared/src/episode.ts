import { z } from "zod";

// Episodes cycle through the three genres by number: 1 metal, 2 prog, 3 pop,
// 4 metal, and so on. Episode 0 (the 2017 presentation) has none.
export const genreSchema = z.enum(["metal", "prog", "pop"]);

export type Genre = z.infer<typeof genreSchema>;

export const episodeSummarySchema = z.object({
  number: z.number().int().nonnegative(),
  slug: z.string(),
  // "La dicha en movimiento - Los Twist": album and band as published.
  title: z.string(),
  album: z.string(),
  band: z.string().nullable(),
  genre: genreSchema.nullable(),
  excerpt: z.string(),
  artworkUrl: z.string().url(),
  audioUrl: z.string().url(),
  durationSeconds: z.number().int().nonnegative(),
  publishedAt: z.string(),
});

export type EpisodeSummary = z.infer<typeof episodeSummarySchema>;

export const episodeLinkSchema = episodeSummarySchema.pick({
  number: true,
  slug: true,
  title: true,
});

export type EpisodeLink = z.infer<typeof episodeLinkSchema>;

export const episodeDetailSchema = episodeSummarySchema.extend({
  // Sanitized server-side: only paragraphs, line breaks, emphasis, lists and
  // links survive.
  descriptionHtml: z.string(),
  previous: episodeLinkSchema.nullable(),
  next: episodeLinkSchema.nullable(),
  related: z.array(episodeSummarySchema),
});

export type EpisodeDetail = z.infer<typeof episodeDetailSchema>;

export const episodeListSchema = z.object({
  items: z.array(episodeSummarySchema),
});

export type EpisodeList = z.infer<typeof episodeListSchema>;

// The episode page URL: /episodes/<number>-<slug>.
export const episodePath = (episode: { number: number; slug: string }) =>
  `/episodes/${String(episode.number)}-${episode.slug}`;
