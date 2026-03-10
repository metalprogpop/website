import { z } from "zod";

export const magicLinkRequestSchema = z.object({
  email: z.string().email(),
});

export type MagicLinkRequest = z.infer<typeof magicLinkRequestSchema>;

export const authUserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
});

export type AuthUser = z.infer<typeof authUserSchema>;
