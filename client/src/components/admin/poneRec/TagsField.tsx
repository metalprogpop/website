import { useId, useState } from "react";
import { X } from "lucide-react";

// The episode's tags, for search: remove one with its X, add one by typing
// (the tags already in use are suggested) and pressing Enter.
export function TagsField({
  tags,
  suggestions,
  onAdd,
  onRemove,
}: {
  tags: string[];
  suggestions: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}) {
  const listId = useId();
  const [draft, setDraft] = useState("");
  const add = () => {
    const tag = draft.trim();
    const known = tags.some(
      (t) => t.toLocaleLowerCase("es") === tag.toLocaleLowerCase("es"),
    );
    if (tag && !known) {
      onAdd(tag);
    }
    setDraft("");
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 rounded-full bg-text-primary py-1 pl-3 pr-1.5 text-sm text-white"
        >
          {tag}
          <button
            type="button"
            aria-label={`Sacar ${tag}`}
            onClick={() => {
              onRemove(tag);
            }}
            className="rounded-full p-0.5 hover:bg-white/20"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        list={listId}
        placeholder="Agregar etiqueta"
        aria-label="Agregar etiqueta"
        // A half-typed tag: Escape clears it instead of closing the panel.
        data-dirty={draft !== ""}
        onChange={(e) => {
          setDraft(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
          if (e.key === "Escape") {
            setDraft("");
          }
        }}
        className="w-44 rounded-full border border-border bg-surface px-3 py-1 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
      />
      <datalist id={listId}>
        {suggestions
          .filter((s) => !tags.includes(s))
          .map((s) => (
            <option key={s} value={s} />
          ))}
      </datalist>
    </div>
  );
}
