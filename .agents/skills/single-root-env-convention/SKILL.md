---
name: single-root-env-convention
description: >-
  Use this skill when touching environment variable loading or configuration
  in this repo: adding a new env var, debugging "X is undefined" errors,
  reviewing changes that import dotenv, or evaluating whether a config file
  should read a `.env` file. Codifies the single-root `.env` design and the
  rule that apps never read env files directly.
license: MIT
---

This repo follows a strict env convention. Every change to env handling must respect it.

## The Convention

- **One `.env` lives at the repo root.** Plus `.env.example` checked in. There are no per-package `.env` files (no `server/.env`, no `client/.env.local`).
- **Only `docker-compose.yml` reads `.env`.** Compose auto-loads `.env` from the directory containing the compose file and uses it for `${VAR}` interpolation in the compose file itself.
- **Apps read `process.env` directly.** No app imports `dotenv`. No config file imports `dotenv/config`. The `dotenv` package is not — and should not be — a dependency.
- **Env reaches apps via injection, not file reads.** In dev: docker-compose's `environment:` block injects values into the container. In prod: the orchestrator (Kubernetes, Fly, Railway, etc.) injects real env vars. The app's view is identical in both worlds.

## Why

- **One source of truth.** Adding a var means editing one `.env` and one `environment:` block — not hunting through per-package files.
- **No file/runtime divergence.** Prod containers don't ship `.env` files. If apps relied on `dotenv`, dev and prod would behave differently and silently. With injected env vars, they don't.
- **Tooling stays simple.** No "which `.env` wins" questions, no `dotenv-cli` wrappers, no precedence rules to remember.

## Adding a New Env Var

Three edits, in order:

1. Add the key to `.env.example` (with a placeholder or comment) so other devs know it exists.
2. Add the key with a real value to `.env` (gitignored).
3. Add the key to the relevant service's `environment:` block in `docker-compose.yml`. Use `${VAR}` to forward from `.env`, with a default if appropriate:
   ```yaml
   environment:
     - SOME_KEY=${SOME_KEY} # required, no default
     - OPTIONAL_KEY=${OPTIONAL_KEY:-} # optional, empty string fallback
     - WITH_DEFAULT=${WITH_DEFAULT:-fallback} # optional, named default
   ```

That's it. Do **not** add `dotenv` to the package, do **not** create a per-package `.env`, do **not** add `import "dotenv/config"` anywhere.

## Anti-Patterns

These all break the convention. If you find yourself reaching for one, stop and rethink.

| Anti-pattern                                            | What to do instead                                                                        |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `import "dotenv/config"` in any source file             | Run the command in a context where the env is already injected (the container)            |
| Adding `dotenv` to a `package.json`                     | Same as above — it's a sign the command is being run in the wrong place                   |
| Creating `server/.env` or `client/.env.local`           | Add the var to root `.env` + `docker-compose.yml` instead                                 |
| Hardcoding fallback secrets in code (`?? "dev-secret"`) | Required vars should throw at startup if missing; only optional vars get safe defaults    |
| Using `dotenv-cli` to wrap a script                     | Run the script via `docker compose exec <svc>` instead — see `monorepo-command-execution` |

## Tools That Don't Auto-Load `.env`

For reference, these are the ones that bite people in this repo because they read `process.env` raw:

- `drizzle-kit` (migrate, generate, studio)
- `tsx` and `node --watch` (when invoked outside Compose)
- `vitest` (host-side test runs)
- Any `pnpm` script that doesn't go through Compose

For all of them, the answer is the same: run inside the container, where `docker-compose.yml` has already injected the env. See the companion `monorepo-command-execution` skill for the exact invocations.

## Validation Pattern

Required vars should fail loudly at first use, not silently default:

```typescript
const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
};
```

Numeric vars need `Number.isNaN` guards with a fallback (already a known convention in this repo):

```typescript
const getMinutes = (): number => {
  const raw = process.env.SOME_MINUTES;
  if (!raw) return 10;
  const parsed = parseInt(raw, 10);
  return Number.isNaN(parsed) ? 10 : parsed;
};
```

Don't use `process.env.X!` (non-null assertion) on something that could realistically be unset — it lies to the type system and produces confusing runtime errors.

## TL;DR

One `.env` at the root. Only Compose reads it. Apps read `process.env`. If a tool doesn't see your env var, you're running it in the wrong place — fix where it runs, don't teach it to read files.
