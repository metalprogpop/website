---
name: monorepo-command-execution
description: >-
  Use this skill when running pnpm scripts, drizzle-kit, migrations, or any
  server-side tooling against this docker-compose monorepo. Covers when to
  exec into a container vs run on the host, when `pnpm --filter <pkg>` is
  needed and when it's redundant, and the standard invocations for db
  migrations, generators, and ad-hoc package scripts.
license: MIT
---

This skill exists to prevent two recurring mistakes:

1. Running env-dependent commands on the host where `process.env` is empty (because this repo's `.env` is consumed by docker-compose only — see `single-root-env-convention`).
2. Using `pnpm --filter <pkg>` redundantly when already inside a container whose `WORKDIR` is `/app/<pkg>`.

## Decision Tree

**Does the command need an env var (`DATABASE_URL`, `JWT_SECRET`, `RESEND_API_KEY`, etc.)?**

- Yes → run **inside the container**. The env is injected by `docker-compose.yml`'s `environment:` block.
- No (lint, typecheck, format, generate code from local files only) → host is fine and faster.

**If running inside the container, is the stack already up?**

- Yes (`pnpm run dev` is running) → `docker compose exec <svc> <cmd>`.
- No, or you want a clean one-off → `docker compose run --rm <svc> <cmd>`.

**Do you need `pnpm --filter <pkg>`?**

- Running from the **repo root** (host) → yes, pnpm needs to know which package's script to run.
- Running **inside a service container** → **no**. The Dockerfile sets `WORKDIR /app/<pkg>`, so pnpm picks up that package's `package.json` directly. `pnpm --filter <pkg>` is redundant and noisy.

## Canonical Commands

### Database (drizzle-kit)

`drizzle-kit` reads `DATABASE_URL` from `process.env` and does **not** auto-load `.env`. Always run it inside the server container:

```bash
# stack up (pnpm run dev is running):
docker compose exec server pnpm db:migrate
docker compose exec server pnpm db:generate
docker compose exec server pnpm db:studio

# stack down (one-off):
docker compose run --rm server pnpm db:migrate
```

Inside the container, `DATABASE_URL` resolves to `postgresql://dev:dev@db:5432/app` (note the `db` hostname — Compose's internal DNS, not `localhost`).

The root `package.json` aliases (`pnpm run db:migrate` from the host) are **misleading** — they invoke drizzle-kit on the host with no env loaded. Don't use them; go through `docker compose exec server` instead.

### Direct DB access

```bash
# psql shell:
docker compose exec db psql -U dev -d app

# one-shot SQL:
docker compose exec db psql -U dev -d app -c "select * from users;"

# pipe a file or heredoc:
docker compose exec -T db psql -U dev -d app < some.sql
docker compose exec db psql -U dev -d app <<'SQL'
truncate magic_tokens;
insert into ... ;
SQL
```

`-T` disables TTY allocation — required when piping stdin from a host file.

### Ad-hoc package scripts

```bash
# from host (workspace root) — needs filter:
pnpm --filter server <script>
pnpm --filter client <script>

# from inside server container — no filter:
docker compose exec server pnpm <script>
```

### Lint / typecheck (host is fine)

These don't need env vars and run fastest on the host:

```bash
pnpm run lint
pnpm --filter client exec tsc --noEmit
```

## Why this matters

Two real failure modes this skill prevents:

1. **`relation "users" does not exist`** after a fresh DB volume — caused by suggesting `pnpm --filter server db:migrate` from the host. With no `DATABASE_URL` exported, drizzle-kit either fails or silently targets nothing. Running inside the container makes it work without any host setup.

2. **Suggesting `import "dotenv/config"` in `drizzle.config.ts`** as a workaround. This is wrong for this repo's design — see `single-root-env-convention`. The fix is always "run it where the env already exists," never "teach the tool to read files."

## Quick Reference

| Goal                                  | Command                                        |
| ------------------------------------- | ---------------------------------------------- |
| Run migration                         | `docker compose exec server pnpm db:migrate`   |
| Generate migration from schema change | `docker compose exec server pnpm db:generate`  |
| Open Drizzle Studio                   | `docker compose exec server pnpm db:studio`    |
| psql shell                            | `docker compose exec db psql -U dev -d app`    |
| Tail server logs                      | `docker compose logs server --tail=50 -f`      |
| Restart server with new env           | `docker compose up -d --force-recreate server` |
| Lint (host)                           | `pnpm run lint`                                |
| Typecheck client (host)               | `pnpm --filter client exec tsc --noEmit`       |
