import { Checkbox } from "@/components/ui/checkbox";

type EditableCheckboxCellProps = {
  checked: boolean;
  label: string;
  onCommit: (next: boolean) => void;
};

export function EditableCheckboxCell({
  checked,
  label,
  onCommit,
}: EditableCheckboxCellProps) {
  return (
    <div className="flex justify-center">
      <Checkbox
        checked={checked}
        aria-label={label}
        onCheckedChange={(next) => {
          onCommit(next === true);
        }}
      />
    </div>
  );
}
