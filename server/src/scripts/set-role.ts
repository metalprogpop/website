// Grants or revokes staff access. Run inside the server container:
//   docker compose exec server pnpm set-role <email> <fan|staff>
// Creates the user if it does not exist yet, so a new staff member can log in.
import { z } from "zod";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

const argsSchema = z.tuple([
  z.string().trim().toLowerCase().email(),
  z.enum(["fan", "staff"]),
]);

const main = async (): Promise<void> => {
  const parsed = argsSchema.safeParse(process.argv.slice(2));
  if (!parsed.success) {
    console.error("Usage: pnpm set-role <email> <fan|staff>");
    process.exit(1);
  }
  const [email, role] = parsed.data;

  const rows = await db
    .insert(users)
    .values({ email, role })
    .onConflictDoUpdate({ target: users.email, set: { role } })
    .returning({ id: users.id, email: users.email, role: users.role });

  const user = rows.at(0);
  if (!user) {
    throw new Error("Failed to set role");
  }
  process.stdout.write(`${user.email} (id ${user.id}) is now ${user.role}\n`);
  process.exit(0);
};

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
