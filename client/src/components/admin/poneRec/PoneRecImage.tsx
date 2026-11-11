import { Headphones } from "lucide-react";
import { API_URL } from "../../../lib/api";

// An episode's image, or the default (headphones) one members see when
// none is chosen.
export function PoneRecImage({
  path,
  className = "",
}: {
  path: string | null;
  className?: string;
}) {
  return path ? (
    <img
      src={`${API_URL}${path}`}
      alt=""
      loading="lazy"
      decoding="async"
      className={`aspect-square object-cover ${className}`}
    />
  ) : (
    <span
      className={`flex aspect-square items-center justify-center bg-text-primary ${className}`}
    >
      <Headphones className="h-1/3 w-1/3 text-white/40" aria-hidden="true" />
    </span>
  );
}
