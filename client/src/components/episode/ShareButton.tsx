import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/brand/Button";

type ShareButtonProps = {
  title: string;
  url: string;
};

// Opens the phone's share sheet where there is one; elsewhere, copies the link.
export function ShareButton({ title, url }: ShareButtonProps) {
  const share = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
      } catch {
        // Dismissing the share sheet rejects too; nothing to report.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado");
    } catch {
      toast.error("No se pudo copiar el link");
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => {
        void share();
      }}
    >
      <Share2 className="h-4 w-4" aria-hidden="true" />
      Compartir
    </Button>
  );
}
