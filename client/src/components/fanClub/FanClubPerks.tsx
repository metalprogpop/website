import { Link } from "react-router-dom";
import {
  Clapperboard,
  Headphones,
  Mic,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { useHallOfFans } from "../../hooks/useHallOfFans";

type Perk = { Icon: LucideIcon; title: string; text: string };

// The fan destacado and Hall of Fans sentences are Guido's, verbatim from
// the old aguante.metalprogpop.com page; keep their wording. The count and
// the link after the Hall of Fans sentence are ours.
const perks: Perk[] = [
  {
    Icon: Clapperboard,
    title: "Los videos de los programas",
    text: "Los programas grabados en video, desde el primero. Los mirás acá cuando quieras, o los bajás.",
  },
  {
    Icon: Headphones,
    title: "Poné Rec™",
    text: "El podcast adicional: episodios extra, solo para el Fan Clú.",
  },
  {
    Icon: Mic,
    title: "Fan destacado",
    text: "Ser fan destacado de uno de nuestros programas, con mención al aire y todo eso.",
  },
];

// What a member gets on top of the show.
export function FanClubPerks() {
  const { data: fans } = useHallOfFans();
  // The list can repeat a name; count each name once.
  const fanCount = new Set(fans).size;
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {perks.map(({ Icon, title, text }) => (
        <PerkItem key={title} Icon={Icon} title={title}>
          {text}
        </PerkItem>
      ))}
      <PerkItem Icon={Trophy} title="Hall of Fans">
        Tu nombre será inmortalizado en piedra (bueno, en bytes) en el{" "}
        <em>Hall of Fans</em> de MetalProgPop Cast (al final de esta misma
        página).{" "}
        {fanCount > 1 ? `Ya hay ${String(fanCount)} personas hermosas. ` : ""}
        <Link
          to="/fan-clu#hall-of-fans"
          className="font-semibold text-brand underline-offset-4 hover:underline"
        >
          Mirá quiénes son
        </Link>
      </PerkItem>
    </ul>
  );
}

function PerkItem({
  Icon,
  title,
  children,
}: Omit<Perk, "text"> & { children: React.ReactNode }) {
  return (
    <li className="flex gap-4 rounded-2xl border border-border bg-surface p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="text-base leading-relaxed">
        <span className="mb-1 block font-display text-lg font-semibold text-text-primary">
          {title}
        </span>
        <span className="text-text-secondary">{children}</span>
      </span>
    </li>
  );
}
