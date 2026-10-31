import { Link } from "react-router-dom";
import { ArrowRight, Headphones } from "lucide-react";
import { usePoneRecs } from "../../../hooks/usePoneRecs";
import { PONE_REC_PATH } from "../../../lib/poneRec";

// The big, clear way into Poné Rec™ from the Fan Clú's home. It's a perk of
// its own, so it gets its own page rather than sharing the videos'.
export function PoneRecBanner() {
  const { data: episodes } = usePoneRecs();
  return (
    <Link
      to={PONE_REC_PATH}
      className="group mb-12 flex items-center gap-5 rounded-3xl border-2 border-text-primary bg-surface p-5 transition-colors hover:border-brand sm:p-6"
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-text-primary text-white transition-colors group-hover:bg-brand">
        <Headphones className="h-7 w-7" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-2xl font-bold tracking-tight text-text-primary">
          Poné Rec™
        </span>
        <span className="text-sm text-text-secondary">
          El podcast adicional, solo para el Fan Clú
          {episodes ? ` · ${String(episodes.length)} episodios` : ""}
        </span>
      </span>
      <ArrowRight
        className="h-6 w-6 shrink-0 text-text-primary transition-transform group-hover:translate-x-1 group-hover:text-brand"
        aria-hidden="true"
      />
    </Link>
  );
}
