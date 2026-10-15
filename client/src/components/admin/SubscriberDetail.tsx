import type { SubscriberRow } from "shared";
import { useUpdateSubscriber } from "@/hooks/useAdminMutations";
import { EditableTextCell } from "./EditableTextCell";
import { SubscriptionHistory } from "./SubscriptionHistory";

type SubscriberDetailProps = {
  subscriber: SubscriberRow;
};

// Expanded row: editable notes, the Hall of Fans opt-out and the
// subscription history.
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
      <label className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 text-sm text-text-primary">
        <input
          type="checkbox"
          checked={!subscriber.hiddenFromHallOfFans}
          onChange={(e) => {
            update.mutate({
              id: subscriber.id,
              data: { hiddenFromHallOfFans: !e.target.checked },
            });
          }}
          className="size-4 accent-brand"
        />
        <span>
          Mostrar en el Hall of Fans
          <span className="block text-text-muted">
            Destildá si la persona pidió no aparecer en la lista pública.
          </span>
        </span>
      </label>
      <SubscriptionHistory subscriber={subscriber} />
    </div>
  );
}
