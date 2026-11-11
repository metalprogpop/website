import { z } from "zod";

// Poné Rec™, the Fan Club's bonus podcast (members only). Each episode
// belongs to a program and shows only its main topic; its tags come along
// for search. The topics the pipeline finds in the transcript stay on the
// server.
export const poneRecSchema = z.object({
  program: z.number().int().positive(),
  mainTopic: z.string(),
  // When the program's last episode was published; null if unknown.
  publishedAt: z.string().nullable(),
  durationSeconds: z.number().int().nonnegative(),
  // Same-origin API path that serves the thumbnail to members.
  thumbnailPath: z.string().startsWith("/api/v1/fan-clu/pone-rec/").nullable(),
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

// --- Staff: /admin, Poné Rec™ ---

export const adminPoneRecSchema = z.object({
  program: z.number().int().positive(),
  mainTopic: z.string(),
  publishedAt: z.string().nullable(),
  durationSeconds: z.number().int().nonnegative(),
  tags: z.array(z.string()),
  // The images it can show (the chosen one included); null is the default.
  thumbnails: z.array(
    z.object({
      id: z.number().int().positive(),
      path: z.string().startsWith("/api/v1/admin/pone-rec/"),
    }),
  ),
  thumbnailId: z.number().int().positive().nullable(),
});

export type AdminPoneRec = z.infer<typeof adminPoneRecSchema>;

export const adminPoneRecListSchema = z.object({
  // Newest first.
  episodes: z.array(adminPoneRecSchema),
  // Every tag in use, to suggest when adding one.
  tags: z.array(z.string()),
});

export type AdminPoneRecList = z.infer<typeof adminPoneRecListSchema>;

// Limits shared by the imports and the admin, so whatever the pipeline
// publishes can always be edited.
export const poneRecMainTopicSchema = z
  .string()
  .trim()
  .min(1, "El tema principal no puede quedar vacío")
  .max(200, "El tema principal es muy largo (hasta 200 caracteres)");

export const poneRecTagsSchema = z
  .array(
    z
      .string()
      .trim()
      .min(1, "Hay una etiqueta vacía")
      .max(40, "Una etiqueta es muy larga (hasta 40 caracteres)"),
  )
  .max(12, "Hasta 12 etiquetas por episodio");

// Staff edit only the main topic, the tags and the image. Anything else is
// a 400, not silently ignored.
export const adminPoneRecUpdateSchema = z
  .object({
    mainTopic: poneRecMainTopicSchema,
    tags: poneRecTagsSchema,
    thumbnailId: z.number().int().positive().nullable(),
  })
  .partial()
  .strict(
    "Solo se pueden editar el tema principal, las etiquetas y la portada",
  );

export type AdminPoneRecUpdate = z.infer<typeof adminPoneRecUpdateSchema>;
