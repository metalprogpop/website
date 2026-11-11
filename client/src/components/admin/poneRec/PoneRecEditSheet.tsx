import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import type { AdminPoneRec, AdminPoneRecUpdate } from "shared";
import { MainTopicField } from "./MainTopicField";
import { TagsField } from "./TagsField";
import { ThumbnailField } from "./ThumbnailField";

const heading =
  "mb-2 font-display text-sm font-semibold uppercase tracking-widest text-brand";

// Side panel (full screen on phones) to edit one episode. Every change is
// saved as it's made.
export function PoneRecEditSheet({
  rec,
  tags,
  onSave,
  onClose,
}: {
  rec: AdminPoneRec | undefined;
  tags: string[];
  onSave: (program: number, data: AdminPoneRecUpdate) => void;
  onClose: () => void;
}) {
  return (
    <Dialog.Root
      open={rec !== undefined}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content
          aria-describedby={undefined}
          onEscapeKeyDown={(e) => {
            const active = document.activeElement;
            if (
              active instanceof HTMLElement &&
              active.dataset.dirty === "true"
            ) {
              e.preventDefault();
            }
          }}
          className="fixed inset-y-0 right-0 z-50 w-full max-w-xl space-y-8 overflow-y-auto bg-background p-6 shadow-2xl focus:outline-none sm:p-8"
        >
          {rec && (
            <>
              <div className="flex items-center justify-between gap-4">
                <Dialog.Title className="font-display text-2xl font-bold text-text-primary">
                  Poné Rec™ · programa {rec.program}
                </Dialog.Title>
                <Dialog.Close
                  aria-label="Cerrar"
                  className="rounded-full p-1 text-text-muted hover:text-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </Dialog.Close>
              </div>
              <section>
                <h3 className={heading}>Tema principal</h3>
                <MainTopicField
                  key={`${String(rec.program)}:${rec.mainTopic}`}
                  value={rec.mainTopic}
                  onSave={(mainTopic) => {
                    onSave(rec.program, { mainTopic });
                  }}
                />
              </section>
              <section>
                <h3 className={heading}>Etiquetas</h3>
                <TagsField
                  tags={rec.tags}
                  suggestions={tags}
                  onSave={(next) => {
                    onSave(rec.program, { tags: next });
                  }}
                />
              </section>
              <section>
                <h3 className={heading}>Portada</h3>
                <ThumbnailField
                  rec={rec}
                  onSave={(thumbnailId) => {
                    onSave(rec.program, { thumbnailId });
                  }}
                />
              </section>
              <p className="text-xs text-text-muted">
                Los cambios se guardan solos y los miembros los ven al instante.
              </p>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
