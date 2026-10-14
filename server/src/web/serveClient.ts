import { readFile } from "node:fs/promises";
import path from "node:path";
import express, { Router } from "express";
import { episodeNumberFromPath, episodePath } from "shared";
import { findEpisode } from "../episodes/catalog.js";
import type { FeedEpisode } from "../episodes/feed.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { injectMeta } from "./injectMeta.js";

// A path ending in a file extension is a static file request (e.g. a chunk
// from a previous deploy), never a page.
const FILE_PATH = /\.[a-z0-9]+$/i;

// In production the server also serves the built client (one origin, no
// CORS). Every route gets the SPA's index.html; episode pages get it with
// their own title and link-preview tags.
export const serveClient = (distDir: string, siteUrl: string): Router => {
  const router = Router();
  const indexPath = path.join(distDir, "index.html");
  let template: Promise<string> | null = null;
  const loadTemplate = (): Promise<string> => {
    template ??= readFile(indexPath, "utf8").catch((err: unknown) => {
      template = null;
      throw err;
    });
    return template;
  };

  router.use(express.static(distDir, { index: false }));

  router.get(
    /^(?!\/api\/).*/,
    asyncHandler(async (req, res) => {
      if (FILE_PATH.test(req.path)) {
        res.status(404).end();
        return;
      }
      const html = await loadTemplate();
      const number = episodeNumberFromPath(req.path);
      if (number === null) {
        res.type("html").send(html);
        return;
      }
      let episode: FeedEpisode | undefined;
      try {
        episode = await findEpisode(number);
      } catch (err) {
        // The page still works; it just goes without its preview tags.
        console.error("Episode lookup for page meta failed:", err);
        res.type("html").send(html);
        return;
      }
      if (!episode) {
        res.status(404).type("html").send(html);
        return;
      }
      res.type("html").send(
        injectMeta(html, {
          title:
            episode.number > 0
              ? `${String(episode.number)}: ${episode.title}`
              : episode.title,
          description: episode.descriptionText,
          imageUrl: episode.artworkUrl,
          url: `${siteUrl}${episodePath(episode)}`,
        }),
      );
    }),
  );

  return router;
};
