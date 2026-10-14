import { describe, expect, it } from "vitest";
import { injectMeta } from "./injectMeta.js";

const template = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>MetalProgPop Cast</title>
  </head>
  <body><div id="root"></div></body>
</html>`;

describe("injectMeta", () => {
  it("sets the title and the link-preview tags", () => {
    const html = injectMeta(template, {
      title: "La dicha en movimiento - Los Twist",
      description: "El álbum debut de Los Twist.",
      imageUrl: "https://audioboom.com/i/43814774.png",
      url: "https://metalprogpop.com/episodes/291-la-dicha-en-movimiento-los-twist",
    });

    expect(html).toContain(
      "<title>La dicha en movimiento - Los Twist | MetalProgPop Cast</title>",
    );
    expect(html).not.toContain("<title>MetalProgPop Cast</title>");
    for (const tag of [
      '<meta name="description" content="El álbum debut de Los Twist." />',
      '<meta property="og:title" content="La dicha en movimiento - Los Twist" />',
      '<meta property="og:description" content="El álbum debut de Los Twist." />',
      '<meta property="og:image" content="https://audioboom.com/i/43814774.png" />',
      '<meta property="og:url" content="https://metalprogpop.com/episodes/291-la-dicha-en-movimiento-los-twist" />',
      '<meta property="og:site_name" content="MetalProgPop Cast" />',
      '<meta name="twitter:card" content="summary_large_image" />',
      '<link rel="canonical" href="https://metalprogpop.com/episodes/291-la-dicha-en-movimiento-los-twist" />',
    ]) {
      expect(html).toContain(tag);
    }
    expect(html.indexOf("og:title")).toBeLessThan(html.indexOf("</head>"));
  });

  it("escapes feed text so it cannot break out of the markup", () => {
    const html = injectMeta(template, {
      title: "</title><script>alert(1)</script>",
      description: '"><script>alert(2)</script> & más',
      imageUrl: "https://audioboom.com/i/1.png",
      url: "https://metalprogpop.com/episodes/1-x",
    });

    expect(html).not.toContain("<script>");
    expect(html).toContain(
      "<title>&lt;/title&gt;&lt;script&gt;alert(1)&lt;/script&gt; | MetalProgPop Cast</title>",
    );
    expect(html).toContain(
      'content="&quot;&gt;&lt;script&gt;alert(2)&lt;/script&gt; &amp; más"',
    );
  });

  it("shortens long descriptions for previews", () => {
    const html = injectMeta(template, {
      title: "Largo",
      description: "palabra ".repeat(100),
      imageUrl: "https://audioboom.com/i/1.png",
      url: "https://metalprogpop.com/episodes/1-x",
    });

    const description = /name="description" content="([^"]*)"/.exec(html)?.[1];
    expect(description?.length).toBeLessThanOrEqual(200);
    expect(description?.endsWith("…")).toBe(true);
  });
});
