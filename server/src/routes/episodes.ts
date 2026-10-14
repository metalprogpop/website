import { Router, type Response } from "express";
import { z } from "zod";
import type {
  EpisodeDetail,
  EpisodeLink,
  EpisodeList,
  EpisodeSummary,
} from "shared";
import { asyncHandler } from "../lib/asyncHandler.js";
import { listEpisodes } from "../episodes/catalog.js";
import type { FeedEpisode } from "../episodes/feed.js";
import { relatedEpisodes } from "../episodes/related.js";

// Public: the podcast's episodes, mirrored from the Audioboom feed.
export const episodesRouter = Router();

const EXCERPT_MAX = 240;

const numberSchema = z.coerce.number().int().nonnegative();

const excerpt = (text: string): string => {
  if (text.length <= EXCERPT_MAX) {
    return text;
  }
  const cut = text.slice(0, EXCERPT_MAX);
  return `${cut.slice(0, cut.lastIndexOf(" ")).trimEnd()}…`;
};

export const toSummary = (episode: FeedEpisode): EpisodeSummary => ({
  number: episode.number,
  slug: episode.slug,
  title: episode.title,
  album: episode.album,
  band: episode.band,
  genre: episode.genre,
  excerpt: excerpt(episode.descriptionText),
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
    res.set("Cache-Control", "public, max-age=300").json(body);
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
    // Related episodes are picked at random, so this is cached briefly.
    res.set("Cache-Control", "public, max-age=60").json(body);
  }),
);
