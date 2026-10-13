import {
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";

type EditableTextCellProps = {
  value: string | null;
  label: string;
  onCommit: (next: string) => void;
  type?: "text" | "email" | "date";
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  placeholder?: string;
  className?: string;
};

// Spreadsheet-style cell: always an input. The change is saved when the
// cell loses focus or on Enter; Escape discards it.
export function EditableTextCell({
  value,
  label,
  onCommit,
  type = "text",
  inputMode,
  placeholder,
  className,
}: EditableTextCellProps) {
  const current = value ?? "";
  const [draft, setDraft] = useState(current);
  const [editing, setEditing] = useState(false);
  const cancelled = useRef(false);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    }
    if (event.key === "Escape") {
      cancelled.current = true;
      event.currentTarget.blur();
    }
  };

  return (
    <input
      type={type}
      inputMode={inputMode}
      aria-label={label}
      placeholder={placeholder}
      value={editing ? draft : current}
      onFocus={() => {
        cancelled.current = false;
        setDraft(current);
        setEditing(true);
      }}
      onChange={(event) => {
        setDraft(event.target.value);
      }}
      onBlur={(event) => {
        // A half-typed date reads as "": never let that erase a stored date.
        const incomplete = event.currentTarget.validity.badInput;
        if (!cancelled.current && !incomplete && draft !== current) {
          onCommit(draft);
        }
        setEditing(false);
      }}
      onKeyDown={handleKeyDown}
      className={cn(
        "w-full min-w-24 rounded-md border border-transparent bg-transparent px-2 py-1 text-sm text-text-primary placeholder:text-text-muted hover:border-border focus:border-brand focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand/20",
        className,
      )}
    />
  );
}
