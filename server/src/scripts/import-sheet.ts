// One-off import of the legacy subscriber spreadsheet into an EMPTY database.
// The xlsx holds personal data and must never be committed; mount it read-only:
//   docker compose run --rm -v /path/to/crm-export.xlsx:/tmp/crm.xlsx:ro \
//     server pnpm import-sheet /tmp/crm.xlsx
import { readSheet } from "read-excel-file/node";
import { sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { subscribers, subscriptions } from "../db/schema.js";
import { buildImport } from "../import/sheet-rules.js";

const main = async (): Promise<void> => {
  const path = process.argv[2];
  if (!path) {
    console.error("Usage: pnpm import-sheet <path-to-xlsx>");
    process.exit(1);
  }

  const existing = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(subscribers);
  if ((existing.at(0)?.count ?? 0) > 0) {
    console.error("subscribers is not empty; refusing to import twice.");
    process.exit(1);
  }

  const rows: unknown[][] = await readSheet(path);
  const { subscribers: people, warnings } = buildImport(rows);

  await db.transaction(async (tx) => {
    for (const { subscriptions: history, ...person } of people) {
      const inserted = await tx
        .insert(subscribers)
        .values(person)
        .returning({ id: subscribers.id });
      const subscriberId = inserted.at(0)?.id;
      if (subscriberId === undefined) {
        throw new Error(`Failed to insert ${person.email}`);
      }
      await tx
        .insert(subscriptions)
        .values(history.map((entry) => ({ ...entry, subscriberId })));
    }
  });

  const subscriptionCount = people.reduce(
    (total, person) => total + person.subscriptions.length,
    0,
  );
  process.stdout.write(
    `Imported ${people.length} subscribers and ${subscriptionCount} subscriptions.\n`,
  );
  for (const warning of warnings) {
    process.stdout.write(`WARNING ${warning}\n`);
  }
  process.exit(0);
};

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
