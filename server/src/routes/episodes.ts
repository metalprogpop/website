import { Router, type Response } from "express";
import { z } from "zod";
import type {
  EpisodeDetail,
  EpisodeLink,
  EpisodeList,
  EpisodeSummary,
} from "shared";
import { asyncHandler } from "../lib/asyncHandler.js";
import { truncateAtWord } from "../lib/text.js";
import { listEpisodes } from "../episodes/catalog.js";
import type { FeedEpisode } from "../episodes/feed.js";
import { relatedEpisodes } from "../episodes/related.js";

// Public: the podcast's episodes, mirrored from the Audioboom feed.
export const episodesRouter = Router();

const EXCERPT_MAX = 240;

const numberSchema = z.coerce.number().int().nonnegative();

export const toSummary = (episode: FeedEpisode): EpisodeSummary => ({
  number: episode.number,
  slug: episode.slug,
  title: episode.title,
  album: episode.album,
  band: episode.band,
  genre: episode.genre,
  excerpt: truncateAtWord(episode.descriptionText, EXCERPT_MAX),
  artworkUrl: episode.artworkUrl,
  audioUrl: episode.audioUrl,
  durationSeconds: episode.durationSeconds,
  publishedAt: episode.publishedAt.toISOString(),
});

const toLink = (episode: FeedEpisode | undefined): EpisodeLink | null =>
  episode
    ? { number: episode.number, slug: episode.slug, title: episode.title }
    : null;

const unavailable = (err: unknown, res: Response): void => {
  console.error("Episodes unavailable:", err);
  res.status(502).json({ error: "No se pudieron cargar los episodios" });
};

episodesRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    let episodes: FeedEpisode[];
    try {
      episodes = await listEpisodes();
    } catch (err) {
      unavailable(err, res);
      return;
    }
    const body: EpisodeList = { items: episodes.map(toSummary) };
    // Revalidated every time (cheap: the ETag usually matches), so a staff
    // re-sync shows up right away.
    res.set("Cache-Control", "no-cache").json(body);
  }),
);

episodesRouter.get(
  "/:number",
  asyncHandler(async (req, res) => {
    const number = numberSchema.safeParse(req.params.number);
    if (!number.success) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    let episodes: FeedEpisode[];
    try {
      episodes = await listEpisodes();
    } catch (err) {
      unavailable(err, res);
      return;
    }
    const index = episodes.findIndex((e) => e.number === number.data);
    const episode = index === -1 ? undefined : episodes.at(index);
    if (!episode) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    // The list is newest first: the next episode sits before this one.
    const body: EpisodeDetail = {
      ...toSummary(episode),
      descriptionHtml: episode.descriptionHtml,
      previous: toLink(episodes.at(index + 1)),
      next: toLink(index > 0 ? episodes.at(index - 1) : undefined),
      related: relatedEpisodes(episode, episodes).map(toSummary),
    };
    res.set("Cache-Control", "no-cache").json(body);
  }),
);
