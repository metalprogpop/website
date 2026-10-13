import type { ColumnDef } from "@tanstack/react-table";
import { ChevronRightIcon } from "lucide-react";
import type { SubscriberRow } from "shared";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatIsoDate } from "./format";
import { statusBadgeVariant, statusLabels } from "./labels";
import {
  SubscriberTextCell,
  type SubscriberTextField,
} from "./SubscriberFieldCell";

// Only names are edited in the grid; everything else is read-only here and
// notes live in the expanded row.
const editableColumn = (
  field: SubscriberTextField,
  header: string,
): ColumnDef<SubscriberRow> => ({
  id: field,
  header,
  cell: ({ row }) => (
    <SubscriberTextCell
      subscriber={row.original}
      field={field}
      label={header}
    />
  ),
});

const readOnlyColumn = (
  id: string,
  header: string,
  render: (row: SubscriberRow) => React.ReactNode,
  className?: string,
): ColumnDef<SubscriberRow> => ({
  id,
  header,
  cell: ({ row }) => (
    <span className={cn("block px-2 text-sm text-text-primary", className)}>
      {render(row.original)}
    </span>
  ),
});

export const subscriberColumns: ColumnDef<SubscriberRow>[] = [
  {
    id: "expand",
    header: () => <span className="sr-only">Detalle</span>,
    cell: ({ row }) => (
      <button
        type="button"
        aria-expanded={row.getIsExpanded()}
        aria-label={`Detalle de ${row.original.email}`}
        onClick={row.getToggleExpandedHandler()}
        className="inline-flex size-8 items-center justify-center gap-0.5 rounded-md text-text-muted hover:text-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
      >
        <ChevronRightIcon
          className={cn(
            "size-4 transition-transform",
            row.getIsExpanded() && "rotate-90",
          )}
        />
        {row.original.subscriptionCount > 1 ? (
          <span className="text-xs">{row.original.subscriptionCount}</span>
        ) : null}
      </button>
    ),
  },
  readOnlyColumn("email", "Email", (row) => row.email),
  editableColumn("firstName", "Nombre"),
  editableColumn("lastName", "Apellido"),
  editableColumn("fanName", "Fan name"),
  {
    id: "status",
    header: "Estado",
    cell: ({ row }) => {
      const latest = row.original.latestSubscription;
      return latest ? (
        <Badge variant={statusBadgeVariant[latest.status]}>
          {statusLabels[latest.status]}
        </Badge>
      ) : (
        <span className="px-2 text-text-muted">—</span>
      );
    },
  },
  readOnlyColumn(
    "startedOn",
    "Alta",
    (row) => formatIsoDate(row.latestSubscription?.startedOn ?? null),
    "tabular-nums",
  ),
];
