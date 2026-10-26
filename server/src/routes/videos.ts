import { Router } from "express";
import { z } from "zod";
import type { FanClubVideosResponse } from "shared";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireFanClubAccess } from "../middleware/requireFanClubAccess.js";
import { listPrograms, signPart } from "../videos/catalog.js";

// Fan Club program videos, for members only. The catalog carries no file
// names (the bucket's objects are still public, so names alone would let
// anyone download them); each part's URLs are presigned on request.
export const videosRouter = Router();
videosRouter.use(requireFanClubAccess);

const numberSchema = z.coerce.number().int().positive();

videosRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const body: FanClubVideosResponse = { programs: await listPrograms() };
    res.set("Cache-Control", "private, no-store").json(body);
  }),
);

videosRouter.get(
  "/:program/:part/urls",
  asyncHandler(async (req, res) => {
    const program = numberSchema.safeParse(req.params.program);
    const part = numberSchema.safeParse(req.params.part);
    const urls =
      program.success && part.success
        ? await signPart(program.data, part.data)
        : null;
    if (!urls) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.set("Cache-Control", "private, no-store").json(urls);
  }),
);
