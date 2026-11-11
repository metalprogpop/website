import { useState } from "react";

const FIELD =
  "col-start-1 row-start-1 rounded-lg border border-border px-3 py-2 font-display text-lg font-semibold leading-snug";

// The card's only text. It grows with its content, so a long topic is
// never cut off (an invisible copy of the text sets the height). Saves on
// blur or Enter; Escape puts back what was saved.
export function MainTopicField({
  value,
  onSave,
}: {
  value: string;
  onSave: (next: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const commit = () => {
    const next = draft.trim();
    if (next && next !== value) {
      onSave(next);
    } else {
      setDraft(value);
    }
  };
  return (
    <div className="grid w-full">
      <span
        aria-hidden="true"
        className={`${FIELD} invisible whitespace-pre-wrap break-words`}
      >
        {draft}{" "}
      </span>
      <textarea
        rows={1}
        value={draft}
        aria-label="Tema principal"
        // While there's an unsaved change, Escape undoes it instead of
        // closing the panel (see PoneRecEditSheet).
        data-dirty={draft !== value}
        onChange={(e) => {
          setDraft(e.target.value.replace(/\n/g, " "));
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
          if (e.key === "Escape") {
            setDraft(value);
          }
        }}
        className={`${FIELD} block w-full resize-none overflow-hidden bg-surface text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20`}
      />
    </div>
  );
}
