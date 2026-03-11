---
name: drizzle-pnpm-monorepo
description: >-
  Use this skill when working with Drizzle ORM in a pnpm workspace
  monorepo. Covers query patterns for strict TypeScript lint compliance,
  schema conventions, migration workflows, cross-package import
  extensions, and workspace dependency management.
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

export const db = drizzle(pool, { schema });
```

New tables added to `schema.ts` are automatically available through `db.query.*` without modifying the client file.

## Migration Workflow

1. **Generate** after any schema change:
   ```bash
   pnpm --filter server run db:generate
   ```
2. **Check** the generated SQL in the migration files — review for correctness.
3. **Apply** the migration:
   ```bash
   pnpm --filter server run db:migrate
   ```

Never hand-edit generated migration files. If a migration is wrong, fix the schema and regenerate.

## Cross-Package Import Extensions

Each package's `tsconfig.json` determines the correct import extension. The rules differ across the monorepo:

| Package    | `module` / `moduleResolution`         | Extension Rule   | Example                                      |
| ---------- | ------------------------------------- | ---------------- | -------------------------------------------- |
| **Server** | `NodeNext`                            | `.js` extensions | `import { db } from "../db/index.js"`        |
| **Shared** | `allowImportingTsExtensions + noEmit` | `.ts` extensions | `export * from "./auth.ts"`                  |
| **Client** | Vite (bundler)                        | No extensions    | `import { useAuth } from "../hooks/useAuth"` |

When unsure, check the package's `tsconfig.json` for `module` and `moduleResolution` settings. Using the wrong extension style will cause build or type-check failures.

## Workspace Dependencies

Use `workspace:*` for references to other packages within the pnpm workspace:

```json
{
  "dependencies": {
    "@metalprogpop/shared": "workspace:*"
  }
}
```

This is the one exception to the "pin exact versions" rule. pnpm resolves `workspace:*` to the local package at install time, so version drift is not a concern.
