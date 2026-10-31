// Loads the Poné Rec™ content staff approved (main topic, thumbnail, topics
// and tags) and joins it with the episodes' audio in the media bucket. The
// export holds exclusive content, so it never goes into the repo: mount it
// read-only when running this inside the server container:
//   docker compose run --rm -v <file>:/tmp/pone-rec.json:ro server \
//     pnpm import-pone-rec /tmp/pone-rec.json
import { readFile } from "node:fs/promises";
import { poneRecImportSchema } from "../poneRec/files.js";
import { importPoneRecs } from "../poneRec/catalog.js";

const path = process.argv[2];

try {
  if (!path) {
    throw new Error("Usage: pnpm import-pone-rec <approved.json>");
  }
  const entries = poneRecImportSchema.parse(
    JSON.parse(await readFile(path, "utf8")),
  );
  const result = await importPoneRecs(entries);
  console.log(`Poné Rec: ${String(result.imported)} episodios cargados.`);
  if (result.missingAudio.length > 0) {
    console.log(
      `Sin audio en el bucket (no se cargaron): ${result.missingAudio.join(", ")}`,
    );
  }
  process.exit(0);
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
