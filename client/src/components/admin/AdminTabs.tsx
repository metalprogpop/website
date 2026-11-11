import { Link, useSearchParams } from "react-router-dom";

export type AdminSection = "suscriptores" | "pone-rec";

const TABS: { section: AdminSection; label: string; to: string }[] = [
  { section: "suscriptores", label: "Suscriptores", to: "/admin" },
  { section: "pone-rec", label: "Poné Rec™", to: "/admin?seccion=pone-rec" },
];

// The section lives in the URL, so a reload or a shared link keeps it.
export const useAdminSection = (): AdminSection =>
  useSearchParams()[0].get("seccion") === "pone-rec"
    ? "pone-rec"
    : "suscriptores";

export function AdminTabs({ current }: { current: AdminSection }) {
  return (
    <nav
      aria-label="Secciones del admin"
      className="mb-8 flex gap-6 border-b border-border font-display text-lg font-semibold"
    >
      {TABS.map((tab) => (
        <Link
          key={tab.section}
          to={tab.to}
          aria-current={tab.section === current ? "page" : undefined}
          className={`-mb-px border-b-2 pb-3 transition-colors ${
            tab.section === current
              ? "border-brand text-text-primary"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
