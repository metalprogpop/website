import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { getEpisodeFeed } from "../services/episodeFeed.js";

// Public: the podcast RSS feed, relayed from Audioboom.
export const episodesRouter = Router();

episodesRouter.get(
  "/feed",
  asyncHandler(async (_req, res) => {
    try {
      const xml = await getEpisodeFeed();
      res
        .type("application/rss+xml; charset=utf-8")
        .set("Cache-Control", "public, max-age=300")
        .send(xml);
    } catch (err) {
      console.error("Episode feed unavailable:", err);
      res.status(502).json({ error: "No se pudieron cargar los episodios" });
    }
  }),
);
