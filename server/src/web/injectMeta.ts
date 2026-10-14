import { truncateAtWord } from "../lib/text.js";

const SITE_NAME = "MetalProgPop Cast";

// Link previews (WhatsApp, X, etc.) cut descriptions around here anyway.
const DESCRIPTION_MAX = 200;

export type PageMeta = {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
};

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Fills in the page title and the tags link previews read. The SPA's
// index.html is the same for every route, so the server injects these per
// request; the text comes from the podcast feed and is always escaped.
export const injectMeta = (template: string, meta: PageMeta): string => {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(
    truncateAtWord(meta.description, DESCRIPTION_MAX),
  );
  const imageUrl = escapeHtml(meta.imageUrl);
  const url = escapeHtml(meta.url);
  const tags = [
    `<meta name="description" content="${description}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:image" content="${imageUrl}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<link rel="canonical" href="${url}" />`,
  ]
    .map((tag) => `    ${tag}\n`)
    .join("");
  return template
    .replace(
      /<title>[\s\S]*?<\/title>/,
      () => `<title>${title} | ${SITE_NAME}</title>`,
    )
    .replace("</head>", () => `${tags}  </head>`);
};
