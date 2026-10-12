import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NONE = "none";

type Option = { value: string; label: string };

type EditableSelectCellProps = {
  value: string | null;
  label: string;
  options: readonly Option[];
  onCommit: (next: string | null) => void;
  // When set, the cell can be cleared with an extra "—" option.
  nullable?: boolean;
};

export function EditableSelectCell({
  value,
  label,
  options,
  onCommit,
  nullable = false,
}: EditableSelectCellProps) {
  return (
    <Select
      value={value ?? NONE}
      onValueChange={(next) => {
        onCommit(next === NONE ? null : next);
      }}
    >
      <SelectTrigger size="sm" aria-label={label} className="min-w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {nullable || value === null ? (
            <SelectItem value={NONE}>—</SelectItem>
          ) : null}
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
