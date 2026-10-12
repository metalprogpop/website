import type { ColumnDef } from "@tanstack/react-table";
import { ChevronRightIcon } from "lucide-react";
import type { SubscriberRow } from "shared";
import { cn } from "@/lib/utils";
import { useDeleteSubscriber } from "@/hooks/useAdminMutations";
import { ConfirmDeleteButton } from "./ConfirmDeleteButton";
import {
  SubscriberFlagCell,
  SubscriberTextCell,
  type SubscriberFlagField,
  type SubscriberTextField,
} from "./SubscriberFieldCell";
import {
  SubscriptionFieldCell,
  subscriptionFields,
} from "./SubscriptionFieldCell";

const textColumn = (
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

const flagColumn = (
  field: SubscriberFlagField,
  header: string,
): ColumnDef<SubscriberRow> => ({
  id: field,
  header,
  cell: ({ row }) => (
    <SubscriberFlagCell
      subscriber={row.original}
      field={field}
      label={header}
    />
  ),
});

function DeleteSubscriberCell({ subscriber }: { subscriber: SubscriberRow }) {
  const remove = useDeleteSubscriber();
  return (
    <ConfirmDeleteButton
      label={`Borrar a ${subscriber.email}`}
      title={`¿Mandar a ${subscriber.email} a la papelera?`}
      description="Sus suscripciones quedan guardadas y vuelven si lo restaurás desde la papelera."
      onConfirm={() => {
        remove.mutate(subscriber.id);
      }}
    />
  );
}

export const subscriberColumns: ColumnDef<SubscriberRow>[] = [
  {
    id: "expand",
    header: () => <span className="sr-only">Historial</span>,
    cell: ({ row }) => (
      <button
        type="button"
        aria-expanded={row.getIsExpanded()}
        aria-label={`Historial de ${row.original.email} (${row.original.subscriptionCount})`}
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
  textColumn("email", "Email"),
  textColumn("firstName", "Nombre"),
  textColumn("lastName", "Apellido"),
  textColumn("fanName", "Fan name"),
  ...subscriptionFields.map(
    (field): ColumnDef<SubscriberRow> => ({
      id: field.key,
      header: field.header,
      cell: ({ row }) => {
        const latest = row.original.latestSubscription;
        return latest ? (
          <SubscriptionFieldCell
            subscription={latest}
            field={field.key}
            owner={row.original.email}
          />
        ) : (
          <span className="px-2 text-text-muted">—</span>
        );
      },
    }),
  ),
  flagColumn("inHallOfFame", "HoF"),
  flagColumn("fanSpotlight", "Spotlight"),
  flagColumn("contacted", "Contactadx"),
  flagColumn("replied", "Contestó"),
  textColumn("notes", "Notas"),
  {
    id: "actions",
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row }) => <DeleteSubscriberCell subscriber={row.original} />,
  },
];
