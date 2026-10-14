# AGENTS.md

Website for the MetalProgPop podcast. pnpm monorepo: `client/` (React + Vite SPA), `server/` (Express API), `shared/` (Zod schemas and types used by both).

## Commands

From the repo root, on the host:

- Typecheck: `pnpm --filter client exec tsc --noEmit` and `pnpm --filter server exec tsc --noEmit`
- Lint: `pnpm run lint` (autofix: `pnpm run lint:fix`)
- Tests: `pnpm --filter client test` and `pnpm --filter server test`
- Dev stack: `pnpm run dev` (docker compose). Client on `http://localhost:9001` (it proxies `/api` to the server), server on `http://localhost:13001`, Postgres on `localhost:5432`. `DEV_HOST=0.0.0.0` (in `.env` or the shell) also publishes the client on the LAN
- E2E: `npx playwright test` (the dev stack must be up)
- Production image: `docker build -t metalprogpop .` (root `Dockerfile`; its header lists the env vars and how to migrate). Express serves the built client and injects per-episode link-preview tags

Inside the server container, because they need env that only compose injects:

- Migrations: `docker compose exec server pnpm db:generate`, then `docker compose exec server pnpm db:migrate`
- Grant or revoke admin access (creates the user if needed): `docker compose exec server pnpm set-role <email> <staff|fan>`. There is deliberately no UI for this.

Don't use the root `pnpm run db:*` aliases: they run drizzle-kit on the host, where `DATABASE_URL` isn't set. See the `monorepo-command-execution` skill.

## Gotchas

- **Env**: one `.env` at the repo root, read only by docker compose. Apps read `process.env` and never import `dotenv`. A new var goes in `.env.example`, `.env`, and the service's `environment:` block in `docker-compose.yml`. See the `single-root-env-convention` skill.
- **Import extensions differ per package**: server uses `.js` (NodeNext, even though files are `.ts`), shared uses `.ts`, client uses none.
- **Separate origins**: server redirects to the client use `CLIENT_URL`, never relative paths or hardcoded URLs.
- **Async Express handlers**: wrap every one in `asyncHandler` (`server/src/lib/asyncHandler.ts`). Never silence `no-misused-promises`.
- **Single-row Drizzle queries**: use `.at(0)`, not `const [row] =`. `no-unnecessary-condition` rejects the undefined check after destructuring.
- **`curly` is enforced**: braces on every `if`/`else`/`for`/`while`, including one-liners.
- **Untrusted data** (request bodies, JWT payloads, third-party responses): parse with Zod, never `as`-cast.

## Code style

- Named exports only.
- React components under 150 lines; extract logic into hooks.
- Server state in React Query. Validation in Zod, with types shared through `shared`.
- API routes live under `/api/v1/<resource>`.
- Pin exact dependency versions (no `^` or `~`), except `workspace:*` for workspace packages.
- User-facing copy is Spanish and sentence case, never Title Case. Proper nouns and feed content (episode titles) are exempt. Page UI follows the `metalprogpop-design-system` skill.

## Testing

- Client integration tests: Vitest + React Testing Library in `client/src/__tests__/`.
- E2E: Playwright in `e2e/`. Check page structure and flows, not visual appearance.
- New features ship with tests; behavior changes update them.

## Commits and PRs

- Run typecheck, lint, and the affected tests before every commit. Nothing enforces this locally; CI only catches it after the push.
- One concern per commit, in an order that keeps history coherent: infrastructure before tests, tests before features.
- Subject in imperative mood, at most 72 chars; the body explains why.
- Branches: `feat/<short-slug>`, `fix/<short-slug>`.
- PR title under 70 chars; description has a Summary (bullets) and a Test plan.

## Agent workflow

- Review code with a subagent, so the reviewer isn't the author. Check spec compliance first, then quality. Mechanical changes (schemas, deps, config) can skip review.
- Give subagents full files and the gotchas above, not just diffs.
