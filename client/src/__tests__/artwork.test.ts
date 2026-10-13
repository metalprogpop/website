import { describe, expect, it } from "vitest";
import { artworkSources } from "../lib/artwork";

describe("artworkSources", () => {
  it("uses sized copies for an Audioboom upload", () => {
    expect(artworkSources("https://audioboom.com/i/43814774.png")).toEqual({
      src: "https://audioboom.com/i/43814774/300x300/c",
      srcSet:
        "https://audioboom.com/i/43814774/300x300/c 300w, https://audioboom.com/i/43814774/600x600/c 600w",
      placeholder: "https://audioboom.com/i/43814774/75x75/c",
    });
  });

  it("handles Audioboom's older resized URL format", () => {
    expect(
      artworkSources(
        "https://audioboom.com/i/35020390/s=1400x1400/el=1/rt=fill.jpg",
      ).src,
    ).toBe("https://audioboom.com/i/35020390/300x300/c");
  });

  it("leaves other URLs untouched", () => {
    expect(artworkSources("https://example.com/cover.png")).toEqual({
      src: "https://example.com/cover.png",
    });
    expect(artworkSources("")).toEqual({ src: "" });
  });
});
