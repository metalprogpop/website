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

export const userRoleSchema = z.enum(["fan", "staff"]);

export type UserRole = z.infer<typeof userRoleSchema>;

// /auth/me response. The role is read from the database on every request,
// never from the JWT, so revoking staff access takes effect immediately.
export const meResponseSchema = authUserSchema.extend({
  role: userRoleSchema,
});

export type MeResponse = z.infer<typeof meResponseSchema>;
