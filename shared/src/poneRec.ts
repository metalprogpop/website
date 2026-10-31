import { z } from "zod";

// Poné Rec™, the Fan Club's bonus podcast (members only). Each episode
// belongs to a program and shows only its main topic; its searchable topics
// and its tags come along for search, and nothing else is served.
export const poneRecSchema = z.object({
  program: z.number().int().positive(),
  mainTopic: z.string(),
  // When the program's last episode was published; null if unknown.
  publishedAt: z.string().nullable(),
  durationSeconds: z.number().int().nonnegative(),
  // Same-origin API path that serves the thumbnail to members.
  thumbnailPath: z.string().startsWith("/api/v1/fan-clu/pone-rec/").nullable(),
  topics: z.array(z.string()),
  tags: z.array(z.string()),
});

export type PoneRec = z.infer<typeof poneRecSchema>;

// Newest first.
export const poneRecListSchema = z.object({
  episodes: z.array(poneRecSchema),
});

export type PoneRecList = z.infer<typeof poneRecListSchema>;

// A presigned URL to play an episode. There is no download one: Poné Rec™
// is for listening on the site.
export const poneRecUrlSchema = z.object({
  url: z.string().url(),
  expiresAt: z.string(),
});

export type PoneRecUrl = z.infer<typeof poneRecUrlSchema>;

export const poneRecUrlPath = (program: number) =>
  `/api/v1/fan-clu/pone-rec/${String(program)}/url`;
