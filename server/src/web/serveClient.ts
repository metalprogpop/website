import { readFile } from "node:fs/promises";
import path from "node:path";
import express, { Router } from "express";
import { episodePath } from "shared";
import { findEpisode } from "../episodes/catalog.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { injectMeta } from "./injectMeta.js";

const EPISODE_ROUTE = /^\/episodes\/(\d+)(?:-[^/]*)?\/?$/;

// In production the server also serves the built client (one origin, no
// CORS). Every route gets the SPA's index.html; episode pages get it with
// their own title and link-preview tags.
export const serveClient = (distDir: string, siteUrl: string): Router => {
  const router = Router();
  const indexPath = path.join(distDir, "index.html");
  let template: Promise<string> | null = null;
  const loadTemplate = () => {
    template ??= readFile(indexPath, "utf8");
    return template;
  };

  router.use(express.static(distDir, { index: false }));

  router.get(
    /^(?!\/api\/).*/,
    asyncHandler(async (req, res) => {
      const html = await loadTemplate();
      const match = EPISODE_ROUTE.exec(req.path);
      if (!match?.[1]) {
        res.type("html").send(html);
        return;
      }
      const episode = await findEpisode(Number(match[1])).catch(
        (err: unknown) => {
          console.error("Episode lookup for page meta failed:", err);
          return undefined;
        },
      );
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
