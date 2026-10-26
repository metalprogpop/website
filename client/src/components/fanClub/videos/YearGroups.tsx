import type { ReactNode } from "react";
import { groupByYear } from "../../../lib/fanClubVideos";
import { ScrollRow } from "./ScrollRow";

export const yearTitle = (year: number | null) =>
  year ? String(year) : "Sin fecha";

type ByYearProps<T> = {
  items: T[];
  dateOf: (item: T) => string | null | undefined;
  render: (item: T) => ReactNode;
  // Grids only: smaller cells for single parts.
  compact?: boolean;
};

// Browsing: one horizontal row per year.
export function YearRows<T>({ items, dateOf, render }: ByYearProps<T>) {
  return groupByYear(items, dateOf).map(([year, group]) => (
    <ScrollRow key={year ?? "none"} title={yearTitle(year)}>
      {group.map(render)}
    </ScrollRow>
  ));
}

// Search results: one grid per year, so every match is visible at once.
export function YearGrids<T>({
  items,
  dateOf,
  compact = false,
  render,
}: ByYearProps<T>) {
  return groupByYear(items, dateOf).map(([year, group]) => (
    <section key={year ?? "none"} className="mb-10">
      <h3 className="mb-4 font-display text-xl font-bold text-text-primary">
        {yearTitle(year)}
      </h3>
      <div
        className={`grid gap-6 ${compact ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" : "sm:grid-cols-2 lg:grid-cols-3"}`}
      >
        {group.map(render)}
      </div>
    </section>
  ));
}
