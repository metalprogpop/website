import { Router } from "express";
import { z } from "zod";
import { adminPoneRecUpdateSchema } from "shared";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireStaff } from "../middleware/requireStaff.js";
import {
  InvalidThumbnailError,
  listAdminPoneRecs,
  readThumbnailOption,
  updatePoneRec,
} from "../poneRec/admin.js";

// Staff-only editor of the published Poné Rec™ episodes: main topic, tags
// and which image they show. Episodes are published by the import, never
// created or deleted here.
export const adminPoneRecRouter = Router();
adminPoneRecRouter.use(requireStaff);

const idSchema = z.coerce.number().int().positive();

adminPoneRecRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.set("Cache-Control", "no-store").json(await listAdminPoneRecs());
  }),
);

adminPoneRecRouter.patch(
  "/:program",
  asyncHandler(async (req, res) => {
    const program = idSchema.safeParse(req.params.program);
    const update = adminPoneRecUpdateSchema.safeParse(req.body);
    if (!program.success || !update.success) {
      res.status(400).json({
        error: update.error?.issues.at(0)?.message ?? "Datos inválidos",
      });
      return;
    }
    try {
      const saved = await updatePoneRec(program.data, update.data);
      if (!saved) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(saved);
    } catch (err) {
      if (err instanceof InvalidThumbnailError) {
        res.status(400).json({ error: err.message });
        return;
      }
      throw err;
    }
  }),
);

adminPoneRecRouter.get(
  "/thumbnails/:id",
  asyncHandler(async (req, res) => {
    const id = idSchema.safeParse(req.params.id);
    const image = id.success ? await readThumbnailOption(id.data) : null;
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
