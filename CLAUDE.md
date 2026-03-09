# CLAUDE.md

## Code Guidelines

- Use `zod` for validation; share types via the `shared` workspace package
- API routes follow the pattern `/api/v1/[resource]`
- Use React Query for server state management
- Keep React components under 150 lines; extract logic into hooks
- Use named exports (not default exports)
- Wrap async route handlers with error middleware
- Always pin dependencies to exact versions (no `^` or `~` prefixes)

## Commands

- Typecheck: `pnpm --filter client exec tsc --noEmit`
- Lint: `pnpm run lint`
- Integration tests: `pnpm --filter client test`
- E2E tests: `npx playwright test`
- Dev server (client only): `pnpm --filter client dev`
- Full dev stack: `pnpm run dev` (docker-compose)

## Commit Conventions

- Each commit is a single, small value increment (one concern only)
- Commit history must be temporally coherent: infrastructure before tests, tests before features
- Commit messages: imperative mood, max 72 chars subject, body explains _why_
- Never bundle unrelated changes in one commit
- Run typecheck and lint before every commit
- Run relevant tests before committing code that affects them

## Testing

- Integration tests: Vitest + React Testing Library in `client/src/__tests__/`
- E2E smoke tests: Playwright in `e2e/` — verify page structure, not visual appearance
- Write tests for new features; update tests when modifying behavior

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
- Hooks enforce formatting, testing, and file protection deterministically
- Run `/clear` between unrelated tasks
