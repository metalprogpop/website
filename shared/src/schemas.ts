import { z } from 'zod';

export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().nullable(),
  createdAt: z.date()
});

export type User = z.infer<typeof userSchema>;
