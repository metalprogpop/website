import { describe, expect, it } from "vitest";
import { attachmentDisposition, downloadFileName } from "./download.js";

describe("downloadFileName", () => {
  it("names a part by program, part and album", () => {
    expect(
      downloadFileName({
        program: 97,
        part: 1,
        lastPart: 1,
        albums: ["Un paso más"],
      }),
    ).toBe("MetalProgPop - Programa 97 - Parte 1 - Un paso más.mp4");
  });

  it("names a file covering several parts with every album", () => {
    expect(
      downloadFileName({
        program: 1,
        part: 1,
        lastPart: 3,
        albums: ["A", "B", "C"],
      }),
    ).toBe("MetalProgPop - Programa 1 - Partes 1 a 3 - A - B - C.mp4");
  });

  it("drops characters file systems reject", () => {
    expect(
      downloadFileName({
        program: 5,
        part: 2,
        lastPart: 2,
        albums: ['AC/DC: "Live"?'],
      }),
    ).toBe("MetalProgPop - Programa 5 - Parte 2 - ACDC Live.mp4");
  });

  it("works without an album", () => {
    expect(
      downloadFileName({ program: 5, part: 2, lastPart: 2, albums: [] }),
    ).toBe("MetalProgPop - Programa 5 - Parte 2.mp4");
  });
});

describe("attachmentDisposition", () => {
  it("gives an ASCII fallback and the UTF-8 name", () => {
    expect(attachmentDisposition("Canción (en vivo).mp4")).toBe(
      "attachment; filename=\"Cancion (en vivo).mp4\"; filename*=UTF-8''Canci%C3%B3n%20%28en%20vivo%29.mp4",
    );
  });
});
