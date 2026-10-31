import { Router } from "express";
import { z } from "zod";
import type { PoneRecList } from "shared";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireFanClubAccess } from "../middleware/requireFanClubAccess.js";
import {
  listPoneRecs,
  readPoneRecThumbnail,
  signPoneRec,
} from "../poneRec/catalog.js";

// Poné Rec™, for members only: the catalog (no file names), a presigned URL
// to play each episode, and its thumbnail, relayed so it isn't public.
export const poneRecRouter = Router();
poneRecRouter.use(requireFanClubAccess);

const programSchema = z.coerce.number().int().positive();

poneRecRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const body: PoneRecList = { episodes: await listPoneRecs() };
    res.set("Cache-Control", "private, no-store").json(body);
  }),
);

poneRecRouter.get(
  "/:program/url",
  asyncHandler(async (req, res) => {
    const program = programSchema.safeParse(req.params.program);
    const url = program.success ? await signPoneRec(program.data) : null;
    if (!url) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.set("Cache-Control", "private, no-store").json(url);
  }),
);

poneRecRouter.get(
  "/:program/thumbnail",
  asyncHandler(async (req, res) => {
    const program = programSchema.safeParse(req.params.program);
    const image = program.success
      ? await readPoneRecThumbnail(program.data)
      : null;
    if (!image) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res
      .set("Cache-Control", "private, max-age=86400")
      .type(image.contentType ?? "image/webp")
      .send(Buffer.from(image.bytes));
  }),
);
