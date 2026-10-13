import type { SubscriberRow } from "shared";
import { useUpdateSubscriber } from "@/hooks/useAdminMutations";
import { EditableTextCell } from "./EditableTextCell";

export type SubscriberTextField = "firstName" | "lastName" | "fanName";

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
      label={`${label} de ${subscriber.email}`}
      value={subscriber[field]}
      onCommit={(next) => {
        update.mutate({ id: subscriber.id, data: { [field]: next } });
      }}
    />
  );
}
