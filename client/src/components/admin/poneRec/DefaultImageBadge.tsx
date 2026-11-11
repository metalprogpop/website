import type { AdminPoneRec } from "shared";
import { Badge } from "../../ui/badge";

// Every episode is live; this only flags one still on the default image,
// and how many candidates are waiting to be picked.
export function DefaultImageBadge({ rec }: { rec: AdminPoneRec }) {
  if (rec.thumbnailId !== null) {
    return null;
  }
  const count = rec.thumbnails.length;
  return (
    <Badge variant="outline" className="bg-surface text-text-primary">
      Portada default
      {count > 0 ? ` · ${String(count)} para elegir` : ""}
    </Badge>
  );
}
