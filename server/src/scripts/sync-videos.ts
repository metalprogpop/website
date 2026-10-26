// Syncs the Fan Club video catalog with the media bucket. Run it inside the
// server container, where compose injects the env:
//   docker compose exec server pnpm sync-videos          newest programs
//   docker compose exec server pnpm sync-videos --full   the whole bucket
import { syncVideos } from "../videos/catalog.js";

const full = process.argv.includes("--full");

try {
  const result = await syncVideos(full ? "full" : "recent");
  console.log(
    `Videos: ${String(result.total)} publicados, ${String(result.added)} nuevos, ${String(result.updated)} revisados, ${String(result.hidden)} ocultos, ${String(result.ignored)} archivos ignorados.`,
  );
  process.exit(0);
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
