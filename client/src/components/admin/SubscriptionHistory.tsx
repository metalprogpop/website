import type { Subscription, SubscriberRow } from "shared";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUpdateSubscription } from "@/hooks/useAdminMutations";
import { useSubscriptionHistory } from "@/hooks/useAdminQueries";
import { EditableTextCell } from "./EditableTextCell";
import { formatAmount, formatIsoDate } from "./format";
import { platformLabels, statusBadgeVariant, statusLabels } from "./labels";

function NotesCell({
  subscription,
  owner,
}: {
  subscription: Subscription;
  owner: string;
}) {
  const update = useUpdateSubscription();
  return (
    <EditableTextCell
      label={`Notas de la suscripción de ${owner}`}
      value={subscription.notes}
      className="min-w-56"
      onCommit={(next) => {
        update.mutate({ id: subscription.id, data: { notes: next } });
      }}
    />
  );
}

type SubscriptionHistoryProps = {
  subscriber: SubscriberRow;
};

// Read-only history; only each subscription's notes can be edited. The end
// date column appears only when some subscription has one.
export function SubscriptionHistory({ subscriber }: SubscriptionHistoryProps) {
  const history = useSubscriptionHistory(subscriber.id);
  const showEndDate =
    history.data?.some((subscription) => subscription.endedOn !== null) ??
    false;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
      <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-brand">
        Historial de suscripciones
      </h3>
      {history.isPending ? (
        <Skeleton className="h-16 w-full" />
      ) : history.isError ? (
        <p className="text-sm text-destructive">
          No se pudo cargar el historial.
        </p>
      ) : history.data.length === 0 ? (
        <p className="text-sm text-text-muted">Sin suscripciones.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Estado</TableHead>
              <TableHead>Plataforma</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Moneda</TableHead>
              <TableHead>Alta</TableHead>
              {showEndDate ? <TableHead>Baja</TableHead> : null}
              <TableHead>Plan original</TableHead>
              <TableHead>Notas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.data.map((subscription) => (
              <TableRow key={subscription.id}>
                <TableCell>
                  <Badge variant={statusBadgeVariant[subscription.status]}>
                    {statusLabels[subscription.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {subscription.platform
                    ? platformLabels[subscription.platform]
                    : "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatAmount(subscription.amount)}
                </TableCell>
                <TableCell>{subscription.currency ?? "—"}</TableCell>
                <TableCell className="tabular-nums">
                  {formatIsoDate(subscription.startedOn)}
                </TableCell>
                {showEndDate ? (
                  <TableCell className="tabular-nums">
                    {subscription.endedOn
                      ? formatIsoDate(subscription.endedOn)
                      : ""}
                  </TableCell>
                ) : null}
                <TableCell className="text-text-muted">
                  {subscription.planOriginal ?? "—"}
                </TableCell>
                <TableCell>
                  <NotesCell
                    subscription={subscription}
                    owner={subscriber.email}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
