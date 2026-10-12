import type { Subscription, SubscriptionUpdate } from "shared";
import { useUpdateSubscription } from "@/hooks/useAdminMutations";
import { EditableSelectCell } from "./EditableSelectCell";
import { EditableTextCell } from "./EditableTextCell";
import { isPlatform, isStatus, platformOptions, statusOptions } from "./labels";

export const subscriptionFields = [
  { key: "status", header: "Estado" },
  { key: "platform", header: "Plataforma" },
  { key: "amount", header: "Monto" },
  { key: "currency", header: "Moneda" },
  { key: "startedOn", header: "Alta" },
  { key: "endedOn", header: "Baja" },
] as const;

export type SubscriptionField =
  | (typeof subscriptionFields)[number]["key"]
  | "notes";

const emptyToNull = (value: string): string | null =>
  value.trim() === "" ? null : value.trim();

type SubscriptionFieldCellProps = {
  subscription: Subscription;
  field: SubscriptionField;
  // Who the subscription belongs to, for accessible cell labels.
  owner: string;
};

export function SubscriptionFieldCell({
  subscription,
  field,
  owner,
}: SubscriptionFieldCellProps) {
  const update = useUpdateSubscription();
  const save = (data: SubscriptionUpdate) => {
    update.mutate({ id: subscription.id, data });
  };

  switch (field) {
    case "status":
      return (
        <EditableSelectCell
          label={`Estado de ${owner}`}
          value={subscription.status}
          options={statusOptions}
          onCommit={(next) => {
            if (next !== null && isStatus(next)) {
              save({ status: next });
            }
          }}
        />
      );
    case "platform":
      return (
        <EditableSelectCell
          label={`Plataforma de ${owner}`}
          value={subscription.platform}
          options={platformOptions}
          nullable
          onCommit={(next) => {
            save({ platform: next !== null && isPlatform(next) ? next : null });
          }}
        />
      );
    case "amount":
      return (
        <EditableTextCell
          label={`Monto de ${owner}`}
          value={subscription.amount}
          inputMode="decimal"
          className="text-right"
          onCommit={(next) => {
            save({ amount: emptyToNull(next.replace(",", ".")) });
          }}
        />
      );
    case "currency":
      return (
        <EditableTextCell
          label={`Moneda de ${owner}`}
          value={subscription.currency}
          className="w-20 min-w-20 uppercase"
          onCommit={(next) => {
            save({ currency: emptyToNull(next) });
          }}
        />
      );
    case "startedOn":
    case "endedOn":
      return (
        <EditableTextCell
          type="date"
          label={`${field === "startedOn" ? "Alta" : "Baja"} de ${owner}`}
          value={subscription[field]}
          onCommit={(next) => {
            save({ [field]: emptyToNull(next) });
          }}
        />
      );
    case "notes":
      return (
        <EditableTextCell
          label={`Notas de la suscripción de ${owner}`}
          value={subscription.notes}
          className="min-w-48"
          onCommit={(next) => {
            save({ notes: next });
          }}
        />
      );
  }
}
