import { PlusIcon } from "lucide-react";
import type { SubscriberRow } from "shared";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCreateSubscription,
  useDeleteSubscription,
} from "@/hooks/useAdminMutations";
import { useSubscriptionHistory } from "@/hooks/useAdminQueries";
import { Button } from "../ui/brand/Button";
import { ConfirmDeleteButton } from "./ConfirmDeleteButton";
import {
  SubscriptionFieldCell,
  subscriptionFields,
} from "./SubscriptionFieldCell";

type SubscriptionHistoryProps = {
  subscriber: SubscriberRow;
};

// Expanded row: every live subscription of one subscriber, editable in place.
export function SubscriptionHistory({ subscriber }: SubscriptionHistoryProps) {
  const history = useSubscriptionHistory(subscriber.id);
  const create = useCreateSubscription();
  const remove = useDeleteSubscription();

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-brand">
          Historial de suscripciones
        </h3>
        <Button
          variant="secondary"
          size="sm"
          disabled={create.isPending}
          onClick={() => {
            create.mutate({ subscriberId: subscriber.id, data: {} });
          }}
        >
          <PlusIcon className="size-4" />
          Agregar suscripción
        </Button>
      </div>
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
              {subscriptionFields.map((field) => (
                <TableHead key={field.key}>{field.header}</TableHead>
              ))}
              <TableHead>Notas</TableHead>
              <TableHead>Plan original</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.data.map((subscription) => (
              <TableRow key={subscription.id}>
                {subscriptionFields.map((field) => (
                  <TableCell key={field.key}>
                    <SubscriptionFieldCell
                      subscription={subscription}
                      field={field.key}
                      owner={subscriber.email}
                    />
                  </TableCell>
                ))}
                <TableCell>
                  <SubscriptionFieldCell
                    subscription={subscription}
                    field="notes"
                    owner={subscriber.email}
                  />
                </TableCell>
                <TableCell className="text-text-muted">
                  {subscription.planOriginal ?? "—"}
                </TableCell>
                <TableCell>
                  <ConfirmDeleteButton
                    label={`Borrar suscripción de ${subscriber.email}`}
                    title="¿Mandar esta suscripción a la papelera?"
                    description="Se puede restaurar desde la papelera."
                    onConfirm={() => {
                      remove.mutate(subscription.id);
                    }}
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
