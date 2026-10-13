// Audioboom serves every artwork at a few fixed sizes under
// /i/<id>/<W>x<H>/c. The feed links the original upload, which is often a
// 2000px PNG of several MB, so cards ask for a sized copy instead.
const AUDIOBOOM_IMAGE = /^https:\/\/audioboom\.com\/i\/(\d+)(?:[./].*)?$/;

export type ArtworkSources = {
  src: string;
  srcSet?: string;
  // A tiny copy (75px, ~15 KB) shown blurred until the real image loads.
  placeholder?: string;
};

export const artworkSources = (url: string): ArtworkSources => {
  const id = AUDIOBOOM_IMAGE.exec(url)?.[1];
  if (!id) {
    return { src: url };
  }
  const sized = (size: number) =>
    `https://audioboom.com/i/${id}/${String(size)}x${String(size)}/c`;
  return {
    src: sized(300),
    srcSet: `${sized(300)} 300w, ${sized(600)} 600w`,
    placeholder: sized(75),
  };
};
