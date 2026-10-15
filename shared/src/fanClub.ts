import { z } from "zod";

// Public Hall of Fans: display names only, oldest supporters first.
export const hallOfFansResponseSchema = z.object({
  names: z.array(z.string()),
});

export type HallOfFansResponse = z.infer<typeof hallOfFansResponseSchema>;
