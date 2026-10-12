import type { SubscriberRow } from "shared";
import { useUpdateSubscriber } from "@/hooks/useAdminMutations";
import { EditableCheckboxCell } from "./EditableCheckboxCell";
import { EditableTextCell } from "./EditableTextCell";

export type SubscriberTextField =
  | "email"
  | "firstName"
  | "lastName"
  | "fanName"
  | "notes";

export type SubscriberFlagField =
  | "inHallOfFame"
  | "fanSpotlight"
  | "contacted"
  | "replied";

type TextCellProps = {
  subscriber: SubscriberRow;
  field: SubscriberTextField;
  label: string;
};

export function SubscriberTextCell({
  subscriber,
  field,
  label,
}: TextCellProps) {
  const update = useUpdateSubscriber();
  return (
    <EditableTextCell
      type={field === "email" ? "email" : "text"}
      label={`${label} de ${subscriber.email}`}
      value={subscriber[field]}
      className={
        field === "email" || field === "notes" ? "min-w-56" : undefined
      }
      onCommit={(next) => {
        update.mutate({ id: subscriber.id, data: { [field]: next } });
      }}
    />
  );
}

type FlagCellProps = {
  subscriber: SubscriberRow;
  field: SubscriberFlagField;
  label: string;
};

export function SubscriberFlagCell({
  subscriber,
  field,
  label,
}: FlagCellProps) {
  const update = useUpdateSubscriber();
  return (
    <EditableCheckboxCell
      label={`${label}: ${subscriber.email}`}
      checked={subscriber[field]}
      onCommit={(next) => {
        update.mutate({ id: subscriber.id, data: { [field]: next } });
      }}
    />
  );
}
