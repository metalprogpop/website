---
name: docker-pnpm-monorepo
description: >-
  Use this skill when writing, editing, or reviewing Dockerfiles and
  docker-compose configuration for services in a pnpm workspace monorepo.
  Covers per-service build encapsulation, partial-workspace installs,
  build context and compose wiring, .dockerignore, volume mounts for
  dev hot reload, and why per-package Dockerfiles cannot just COPY a
  single package.json when a workspace dep exists.
license: MIT
---

This skill codifies how to containerize individual services in a pnpm workspace monorepo **without breaking per-service encapsulation**. The central tension: a service's `package.json` may declare a `workspace:*` dep on a sibling package (e.g. `shared`), which means the Dockerfile cannot resolve deps from the service directory alone — but the Dockerfile also must not reach for _sibling services_ (e.g. a server's Dockerfile copying the client's code).

## The Encapsulation Rule

A service's Dockerfile may reference:

- **Workspace infrastructure**: `pnpm-workspace.yaml`, `pnpm-lock.yaml`, root `package.json`
- **Its own source**: `<self>/package.json`, `<self>/src`, `<self>/...`
- **Declared workspace deps**: e.g. `shared/` if `<self>/package.json` lists `"shared": "workspace:*"`

A service's Dockerfile must **never** reference sibling services (e.g. `server/Dockerfile` must not `COPY client/package.json`). If a Dockerfile needs to know about siblings to build, the design is wrong — rework it to only reach for declared deps.

Workspace files (`pnpm-workspace.yaml` and `pnpm-lock.yaml`) can nominally list sibling names, but that's infrastructure, not a sibling reference — treat it as opaque.

## Dockerfile Template

Build context = **repo root**, dockerfile path = `./<pkg>/Dockerfile`. Each service's Dockerfile follows this shape:

```dockerfile
FROM node:24-alpine
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Workspace infra (NOT sibling services)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Declared workspace deps (only the ones this package actually depends on)
COPY shared/ ./shared/

# Self
COPY <pkg>/package.json ./<pkg>/

# Partial-workspace install: pnpm handles missing sibling dirs gracefully
RUN pnpm install --filter <pkg>... --frozen-lockfile

# Self sources
COPY <pkg>/ ./<pkg>/
WORKDIR /app/<pkg>
```

Key mechanics:

- `pnpm install --filter <pkg>...` (note the trailing `...`) installs only `<pkg>` **and its workspace dependencies**. pnpm reports `Scope: N of M workspace projects` and skips siblings whose directories aren't present in the build context. Do **not** pass `--filter <pkg>` without the `...` — that would leave workspace deps uninstalled.
- `--frozen-lockfile` fails fast if `pnpm-lock.yaml` is out of sync. If you add or change a workspace dep, run `pnpm install` on the host first to regenerate the lockfile before rebuilding the image.
- Final `WORKDIR /app/<pkg>` so `pnpm dev` (or whatever the package's default script is) runs in the service directory without needing `--filter` at runtime. pnpm's symlinked `node_modules` inside the package works correctly under this workdir.

## docker-compose Wiring

```yaml
services:
  <pkg>:
    build:
      context: .
      dockerfile: ./<pkg>/Dockerfile
    volumes:
      - ./<pkg>/src:/app/<pkg>/src
      - ./shared/src:/app/shared/src # only if <pkg> depends on shared
      - pnpm-store:/root/.local/share/pnpm/store
    command: pnpm dev # WORKDIR is /app/<pkg>, so this runs the package's own dev
```

Mount the declared dep's source directory (`./shared/src` → `/app/shared/src`) too, otherwise edits to the shared contract won't hot-reload into the container. Do **not** mount `package.json` files at runtime — it's brittle and masks dep changes that should trigger a rebuild.

## .dockerignore at Repo Root

With build context = repo root, a root-level `.dockerignore` is required to keep context size sane:

```
**/node_modules
**/dist
**/.git
**/.gitignore
**/*.md
**/.env*
**/.DS_Store
**/*.log
e2e
test-results
playwright-report
.vscode
.github
# plus any agent/tooling dirs (.claude, .codex, .cursor, etc.)
```

Per-service `.dockerignore` files become redundant (the service dir is no longer the context) and can be removed.

## Standalone Builds

With this layout each service still builds standalone from the repo root:

```bash
docker build -f server/Dockerfile -t server .
docker build -f client/Dockerfile -t client .
```

Either builds independently — no other service dir needs to exist in the context beyond what the Dockerfile copies.

## Latent-Bug Guardrail

Before shipping per-service Docker builds, audit **every import from a workspace sibling** across the codebase and confirm each is declared in the consuming package's `package.json`. pnpm workspaces hoist packages into the root `node_modules`, so imports can "work" at dev time without being declared, then fail when that package is built in isolation. Example pattern that bites:

```ts
// client/src/hooks/useAuth.ts
import type { AuthUser } from "shared"; // ← must be declared
```

```json
// client/package.json
{
  "dependencies": {
    "shared": "workspace:*" // ← if missing, isolated builds break
  }
}
```

Quick audit: `grep -r 'from "<sibling-pkg-name>"' <pkg>/src` and confirm the dep is in `<pkg>/package.json`.

## Rule of Thumb

If you find yourself wanting to `COPY` a sibling service's files into a Dockerfile, stop. Either:

1. The importing package is missing a workspace dep declaration (fix the manifest).
2. You're conflating infrastructure with sibling code (copy workspace files instead).
3. The service genuinely shouldn't be containerized per-package — e.g. it's a compile-time-only package. Rethink the split.
