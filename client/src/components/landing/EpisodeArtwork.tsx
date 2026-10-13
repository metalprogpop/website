import { useState } from "react";
import { cn } from "@/lib/utils";
import { artworkSources } from "../../lib/artwork";

type EpisodeArtworkProps = {
  url: string;
  alt: string;
  eager?: boolean;
};

// Card widths: full width on mobile, half on md, a third (max ~370px) on lg.
const SIZES = "(min-width: 1024px) 370px, (min-width: 768px) 50vw, 100vw";

// Progressive artwork: a blurred 75px copy fills the square at once and the
// sized image fades in over it when it has loaded.
export function EpisodeArtwork({
  url,
  alt,
  eager = false,
}: EpisodeArtworkProps) {
  const { src, srcSet, placeholder } = artworkSources(url);
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {placeholder ? (
        <img
          src={placeholder}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-lg"
        />
      ) : null}
      <img
        // Cached images can finish loading before React attaches onLoad.
        ref={(img) => {
          if (img?.complete && img.naturalWidth > 0) {
            setLoaded(true);
          }
        }}
        src={src}
        srcSet={srcSet}
        sizes={srcSet ? SIZES : undefined}
        width={600}
        height={600}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => {
          setLoaded(true);
        }}
        className={cn(
          "relative h-full w-full object-cover transition duration-500 group-hover:scale-110",
          placeholder && !loaded && "opacity-0",
        )}
      />
    </>
  );
}
