// Loads Poné Rec™ episodes into the database.
//
// A new episode, straight from the pipeline's proposal in the bucket
// ("Poné REC/propuestas/098/"): it is published right away with the default
// image, and its candidate images become options in /admin. Run it again
// after uploading more candidates to offer them too:
//   pnpm import-pone-rec --propuesta 98
//
// Every episode at once, from an export of the approved content (to fill an
// empty database). It holds exclusive content, so it never goes into the
// repo: copy it into the container, run, and delete it.
//   pnpm import-pone-rec /tmp/pone-rec.json
import { readFile } from "node:fs/promises";
import { z } from "zod";
import { poneRecImportSchema } from "../poneRec/files.js";
import { importPoneRecs } from "../poneRec/catalog.js";
import { publishProposal } from "../poneRec/proposals.js";

const USAGE =
  "Usage: pnpm import-pone-rec --propuesta <program> | pnpm import-pone-rec <approved.json>";

const importFile = async (path: string) => {
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
};

const importProposal = async (arg: string | undefined) => {
  const program = z.coerce.number().int().positive().parse(arg);
  const result = await publishProposal(program);
  console.log(
    result.created
      ? `Poné Rec ${String(program)} publicado, con ${String(result.candidatesAdded)} portadas para elegir.`
      : `Poné Rec ${String(program)} ya estaba publicado: ${String(result.candidatesAdded)} portadas nuevas para elegir.`,
  );
};

try {
  const [first, second] = process.argv.slice(2);
  if (!first) {
    throw new Error(USAGE);
  }
  await (first === "--propuesta" ? importProposal(second) : importFile(first));
  process.exit(0);
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
