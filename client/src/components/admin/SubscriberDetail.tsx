import type { SubscriberRow } from "shared";
import { SubscriptionHistory } from "./SubscriptionHistory";

type SubscriberDetailProps = {
  subscriber: SubscriberRow;
};

// Expanded row: what does not fit in the grid (notes) plus the full
// subscription history.
export function SubscriberDetail({ subscriber }: SubscriberDetailProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4">
        <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-brand">
          Notas
        </h3>
        <p className="whitespace-pre-wrap text-sm text-text-secondary">
          {subscriber.notes ?? "Sin notas."}
        </p>
      </div>
      <SubscriptionHistory subscriber={subscriber} />
    </div>
  );
}
