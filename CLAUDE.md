# CLAUDE.md

See [architecture.md](./architecture.md) for full stack, structure, and setup details.

## Code Guidelines

When writing or modifying code in this project:

- Use `zod` for validation; share types via the `shared` workspace package
- API routes follow the pattern `/api/v1/[resource]`
- Use React Query for server state management
- Keep React components under 150 lines; extract logic into hooks
- Use named exports (not default exports)
- Wrap async route handlers with error middleware
- Always pin dependencies to exact versions (no `^` or `~` prefixes)
