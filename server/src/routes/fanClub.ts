import { Router } from "express";
import type { HallOfFansResponse } from "shared";
import { listHallOfFans } from "../fanClub/queries.js";
import { asyncHandler } from "../lib/asyncHandler.js";

// Public side of the Fan Club.
export const fanClubRouter = Router();

fanClubRouter.get(
  "/hall-of-fans",
  asyncHandler(async (_req, res) => {
    const body: HallOfFansResponse = { names: await listHallOfFans() };
    // Public and costly to build: cache briefly, so staff hiding someone
    // still shows up within a minute.
    res.set("Cache-Control", "public, max-age=60").json(body);
  }),
);
