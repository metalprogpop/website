# AGENTS.md

Project-specific conventions and commands for any agent or contributor working on this repo.

## Overview

pnpm monorepo with three workspace packages:

| Package  | Role                         | Path      |
| -------- | ---------------------------- | --------- |
| `client` | React + Vite SPA             | `client/` |
| `server` | Express + TypeScript API     | `server/` |
| `shared` | Zod schemas and shared types | `shared/` |

## Commands

### Typecheck and Lint

- Typecheck (client): `pnpm --filter client exec tsc --noEmit`
- Lint: `pnpm run lint`
- Lint with autofix: `pnpm run lint:fix`

### Tests

- Integration tests: `pnpm --filter client test`
- E2E smoke tests: `npx playwright test` (requires dev stack running)

### Dev

- Client only: `pnpm --filter client dev`
- Full stack (docker-compose): `pnpm run dev`

### Database

- Generate migration: `pnpm run db:generate`
- Apply migration: `pnpm run db:migrate`
- Open Drizzle Studio: `pnpm run db:studio`

## Code Conventions

### ESLint Rules

The linter enforces these strictly — code that violates them will not pass:

- **`curly`**: braces required on all `if`/`else`/`for`/`while` — no one-liner shorthand
- **`@typescript-eslint/no-unnecessary-condition`**: can't check `undefined` on destructured array results — use `.at(0)` (see `drizzle-pnpm-monorepo` skill)
- **`@typescript-eslint/no-misused-promises`**: async Express handlers trigger this — use `asyncHandler` wrapper (see `express-typescript-api` skill)
- **`@typescript-eslint/no-unsafe-assignment`**: no `as` casts on untrusted data
- **Quote style**: double quotes (auto-fixed)

### Code Style

- Named exports only (no default exports)
- React components under 150 lines; extract logic into hooks
- Use React Query for server state management
- Use Zod for validation; share types via the `shared` package
- API routes follow `/api/v1/[resource]`
- Wrap async route handlers with error middleware (`asyncHandler`)

### Dependencies

- Pin exact versions (no `^` or `~` prefixes)
- Exception: `workspace:*` for workspace package references

## Architecture

### Docker-Compose Ports

| Service | Internal | External | URL                                       |
| ------- | -------- | -------- | ----------------------------------------- |
| client  | 5173     | 9001     | `http://localhost:9001`                   |
| server  | 3001     | 13001    | `http://localhost:13001`                  |
| db      | 5432     | 5432     | `postgresql://dev:dev@localhost:5432/app` |

### Environment Variables

Server:

| Variable                              | Purpose                        |
| ------------------------------------- | ------------------------------ |
| `DATABASE_URL`                        | PostgreSQL connection string   |
| `JWT_SECRET`                          | JWT signing secret             |
| `JWT_EXPIRATION_DAYS`                 | Token lifetime                 |
| `RESEND_API_KEY`                      | Email delivery (Resend)        |
| `MAGIC_LINK_BASE_URL`                 | Base URL for magic link emails |
| `MAGIC_LINK_TOKEN_EXPIRATION_MINUTES` | Token TTL                      |
| `CLIENT_URL`                          | Client origin for redirects    |

Client:

| Variable       | Purpose             |
| -------------- | ------------------- |
| `VITE_API_URL` | Server API base URL |

### Cross-Origin Redirects

Server and client run on different origins. Server redirects MUST use the `CLIENT_URL` env var, never relative paths or hardcoded URLs. See `express-typescript-api` skill for the pattern.

## Testing

- **Integration tests**: Vitest + React Testing Library in `client/src/__tests__/`
- **E2E smoke tests**: Playwright in `e2e/` — verify page structure, not visual appearance
- Write tests for new features; update tests when modifying behavior
- See `vitest-react-testing` skill for mocking patterns and test setup

## Commit Conventions

- Each commit is a single, small value increment (one concern only)
- Commit history must be temporally coherent: infrastructure before tests, tests before features
- Commit messages: imperative mood, max 72 chars subject, body explains _why_
- Never bundle unrelated changes in one commit
- Run typecheck and lint before every commit
- Run relevant tests before committing code that affects them

## Branching and PRs

- Feature branches: `feat/<short-slug>`
- Fix branches: `fix/<short-slug>`
- PR title: under 70 chars
- PR description: Summary (bullet points) + Test Plan sections

## Agentic Workflow

- Use `subagent-driven-development` skill for executing task lists with review
- Use `verification-before-completion` skill before claiming work is done
- Use `test-driven-development` skill when implementing features or fixes
- Use `finishing-a-development-branch` skill to create PRs
- Use `dispatching-parallel-agents` skill for independent subtasks
- Use subagents for code review (fresh context avoids author bias)

### Learnings

- **Convention-aware plans**: Code in plans must account for linter rules (curly braces, double quotes, import extensions). Include convention notes in prompts to subagents.
- **Typecheck early**: Run typecheck on affected packages before starting implementation. Fix infrastructure issues as the first task.
- **Two-stage review**: Spec compliance first (does it match requirements?), then code quality (is it well-built?). No point reviewing quality if spec isn't met.
- **Full file context**: Provide full file contents to subagents, not just diffs. They work better with complete context.
- **Review scaling**: Mechanical tasks (schemas, deps, config) can skip full review cycles. Complex tasks (routes, pages, components) benefit from both review stages.

## Skills Reference

Custom skills in `.agents/skills/` provide reusable patterns. Symlinked into each agent harness's skills directory.

| Skill                         | When to Use                                                 |
| ----------------------------- | ----------------------------------------------------------- |
| `express-typescript-api`      | Building or modifying Express.js API routes with TypeScript |
| `drizzle-pnpm-monorepo`       | Working with Drizzle ORM in this pnpm workspace monorepo    |
| `vitest-react-testing`        | Writing integration tests with Vitest + RTL                 |
| `frontend-design`             | Building web components, pages, or UI                       |
| `vercel-react-best-practices` | React/Next.js performance optimization                      |
| `docker-pnpm-monorepo`        | Writing Dockerfiles / compose for pnpm workspace services   |
