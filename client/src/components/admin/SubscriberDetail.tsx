import type { SubscriberRow } from "shared";
import { useUpdateSubscriber } from "@/hooks/useAdminMutations";
import { EditableTextCell } from "./EditableTextCell";
import { SubscriptionHistory } from "./SubscriptionHistory";

type SubscriberDetailProps = {
  subscriber: SubscriberRow;
};

// Expanded row: editable notes plus the subscription history.
export function SubscriberDetail({ subscriber }: SubscriberDetailProps) {
  const update = useUpdateSubscriber();
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4">
        <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-brand">
          Notas
        </h3>
        <EditableTextCell
          label={`Notas de ${subscriber.email}`}
          value={subscriber.notes}
          placeholder="Sin notas"
          onCommit={(next) => {
            update.mutate({ id: subscriber.id, data: { notes: next } });
          }}
        />
      </div>
      <SubscriptionHistory subscriber={subscriber} />
    </div>
  );
}
