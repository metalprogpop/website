import { SearchIcon } from "lucide-react";
import type { StatusCounts } from "shared";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { platformOptions, statusOptions } from "./labels";

export type Filters = {
  q: string;
  status: string;
  platform: string;
};

export const ALL = "all";

type FilterSelectProps = {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
};

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="min-w-36 bg-surface">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value={ALL}>{label}: todos</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {label}: {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

type SubscribersToolbarProps = {
  filters: Filters;
  onChange: (next: Filters) => void;
  counts: StatusCounts | undefined;
  total: number | undefined;
};

export function SubscribersToolbar({
  filters,
  onChange,
  counts,
  total,
}: SubscribersToolbarProps) {
  const set = (key: keyof Filters) => (value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-64 flex-1">
          <span className="sr-only">Buscar</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            value={filters.q}
            onChange={(event) => {
              set("q")(event.target.value);
            }}
            placeholder="Buscar por email, nombre o fan name"
            className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </label>
        <FilterSelect
          label="Estado"
          value={filters.status}
          options={statusOptions}
          onChange={set("status")}
        />
        <FilterSelect
          label="Plataforma"
          value={filters.platform}
          options={platformOptions}
          onChange={set("platform")}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
        {counts ? (
          <>
            <Badge>{counts.active} activas</Badge>
            <Badge variant="secondary">{counts.paused} pausadas</Badge>
            <Badge variant="outline">{counts.cancelled} canceladas</Badge>
          </>
        ) : null}
        {total === undefined ? null : (
          <span className="ml-auto">
            {total} {total === 1 ? "resultado" : "resultados"}
          </span>
        )}
      </div>
    </div>
  );
}
