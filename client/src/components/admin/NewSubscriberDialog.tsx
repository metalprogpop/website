import { useState, type FormEvent } from "react";
import { PlusIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateSubscriber } from "@/hooks/useAdminMutations";
import { Button } from "../ui/brand/Button";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-4 py-2 text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

const fields = [
  { name: "email", label: "Email", type: "email", required: true },
  { name: "firstName", label: "Nombre", type: "text", required: false },
  { name: "lastName", label: "Apellido", type: "text", required: false },
  { name: "fanName", label: "Fan name", type: "text", required: false },
] as const;

const readField = (form: FormData, name: string): string => {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
};

// Only the identity is asked here; everything else, including the first
// subscription, is edited in the grid afterwards.
export function NewSubscriberDialog() {
  const [open, setOpen] = useState(false);
  const create = useCreateSubscriber();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    create.mutate(
      {
        email: readField(form, "email"),
        firstName: readField(form, "firstName"),
        lastName: readField(form, "lastName"),
        fanName: readField(form, "fanName"),
      },
      {
        onSuccess: () => {
          setOpen(false);
        },
      },
    );
  };

  return (
    <>
      <Button
        size="sm"
        onClick={() => {
          setOpen(true);
        }}
      >
        <PlusIcon className="size-4" />
        Nuevo suscriptor
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo suscriptor</DialogTitle>
            <DialogDescription>
              Después podés agregarle suscripciones desde la grilla.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {fields.map((field) => (
              <label key={field.name} className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-text-secondary">
                  {field.label}
                </span>
                <input
                  name={field.name}
                  type={field.type}
                  required={field.required}
                  className={inputClass}
                />
              </label>
            ))}
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={create.isPending}>
                Crear
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
