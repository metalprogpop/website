import { RotateCcwIcon } from "lucide-react";
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
  useRestoreSubscriber,
  useRestoreSubscription,
} from "@/hooks/useAdminMutations";
import { useTrash } from "@/hooks/useAdminQueries";
import { Button } from "../ui/brand/Button";
import { platformLabels, statusLabels } from "./labels";

const formatDate = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleString("es-AR") : "—";

function RestoreButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button variant="ghost" size="sm" aria-label={label} onClick={onClick}>
      <RotateCcwIcon className="size-4" />
      Restaurar
    </Button>
  );
}

export function TrashView() {
  const trash = useTrash();
  const restoreSubscriber = useRestoreSubscriber();
  const restoreSubscription = useRestoreSubscription();

  if (trash.isPending) {
    return <Skeleton className="h-32 w-full" />;
  }
  if (trash.isError) {
    return <p className="text-destructive">No se pudo cargar la papelera.</p>;
  }

  const { subscribers, subscriptions } = trash.data;
  if (subscribers.length === 0 && subscriptions.length === 0) {
    return (
      <p className="py-12 text-center text-text-muted">
        La papelera está vacía.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Qué</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Detalle</TableHead>
          <TableHead>Borrado</TableHead>
          <TableHead>
            <span className="sr-only">Acciones</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subscribers.map((subscriber) => (
          <TableRow key={`subscriber-${subscriber.id}`}>
            <TableCell>Suscriptor</TableCell>
            <TableCell>{subscriber.email}</TableCell>
            <TableCell className="text-text-secondary">
              {[subscriber.firstName, subscriber.lastName]
                .filter(Boolean)
                .join(" ") || "—"}
            </TableCell>
            <TableCell>{formatDate(subscriber.deletedAt)}</TableCell>
            <TableCell>
              <RestoreButton
                label={`Restaurar a ${subscriber.email}`}
                onClick={() => {
                  restoreSubscriber.mutate(subscriber.id);
                }}
              />
            </TableCell>
          </TableRow>
        ))}
        {subscriptions.map((subscription) => (
          <TableRow key={`subscription-${subscription.id}`}>
            <TableCell>Suscripción</TableCell>
            <TableCell>{subscription.subscriberEmail}</TableCell>
            <TableCell className="text-text-secondary">
              {[
                subscription.platform && platformLabels[subscription.platform],
                subscription.amount &&
                  `${subscription.amount} ${subscription.currency ?? ""}`,
                statusLabels[subscription.status],
              ]
                .filter(Boolean)
                .join(" · ")}
            </TableCell>
            <TableCell>{formatDate(subscription.deletedAt)}</TableCell>
            <TableCell>
              <RestoreButton
                label={`Restaurar suscripción de ${subscription.subscriberEmail}`}
                onClick={() => {
                  restoreSubscription.mutate(subscription.id);
                }}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
