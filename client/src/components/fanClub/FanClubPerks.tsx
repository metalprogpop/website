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

// The Hall of Fans and fan destacado lines are Guido's, from the old
// aguante.metalprogpop.com page; keep their wording.
const perks: Perk[] = [
  {
    Icon: Clapperboard,
    title: "Los videos de los programas",
    text: "Cada programa grabado en video, desde el primero. Lo mirás acá cuando quieras, o lo bajás.",
  },
  {
    Icon: Headphones,
    title: "Poné Rec™",
    text: "El podcast adicional: con cada programa, un episodio extra solo para el Fan Clú.",
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
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {perks.map(({ Icon, title, text }) => (
        <PerkItem key={title} Icon={Icon} title={title}>
          {text}
        </PerkItem>
      ))}
      <PerkItem Icon={Trophy} title="Hall of Fans">
        Tu nombre inmortalizado en piedra (bueno, en bytes) en el Hall of Fans
        {fans && fans.length > 0
          ? `, junto a ${String(fans.length)} personas hermosas que ya están`
          : ""}
        .{" "}
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
