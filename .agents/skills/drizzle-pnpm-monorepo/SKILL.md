---
name: drizzle-pnpm-monorepo
description: >-
  Drizzle ORM patterns for this repo: lint-safe single-row queries,
  foreign-key and schema conventions, and the migration workflow. Use when
  writing queries, changing server/src/db/schema.ts, or generating and
  applying migrations.
license: MIT
---

## Query Patterns

Drizzle `.select()` returns an array. For single-result queries, use `.at(0)`:

```typescript
const user = (await db.select().from(users).where(eq(users.id, id))).at(0);
if (!user) {
  /* handle not found */
}
```

Do NOT use array destructuring:

```typescript
// BAD — @typescript-eslint/no-unnecessary-condition flags the `if` below
const [user] = await db.select().from(users).where(eq(users.id, id));
if (!user) {
  /* lint error: condition is always truthy */
}
```

TypeScript infers the destructured variable as always defined, so any subsequent undefined check is flagged as unnecessary. `.at(0)` returns `T | undefined`, keeping the guard valid.

## Schema Conventions

### Explicit `onDelete` on Foreign Keys

Always specify `onDelete` on FK constraints — never rely on the database default:

```typescript
userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
```

Use `cascade` for subordinate/child tables (e.g., user preferences, session tokens). Choose `set null` or `restrict` when the relationship demands it, but always be explicit.

### Auto-Pickup with `import * as schema`

In the db client file, import the entire schema namespace and pass it to the drizzle constructor:

```typescript
import * as schema from "./schema.js";

export const db = drizzle(client, { schema });
```

New tables added to `schema.ts` are automatically available through `db.query.*` without modifying the client file.

## Migration Workflow

drizzle-kit needs `DATABASE_URL`, which only exists inside the server container (see `monorepo-command-execution`):

1. **Generate** after any schema change:
   ```bash
   docker compose exec server pnpm db:generate
   ```
2. **Check** the generated SQL in the migration files for correctness.
3. **Apply** the migration:
   ```bash
   docker compose exec server pnpm db:migrate
   ```

Never hand-edit generated migration files. If a migration is wrong, fix the schema and regenerate.
