---
name: vitest-react-testing
description: >-
  Use this skill when writing integration tests with Vitest and React
  Testing Library. Covers Vite env var mocking, fetch mocking patterns,
  QueryClient test wrappers, cleanup without globals mode, async
  assertions for state-dependent UI, and React hook testing.
license: MIT
---

# Vitest + React Testing Library Patterns

## Env Var Mocking

Vite exposes environment variables via `import.meta.env.VITE_*`. Use `vi.stubEnv` to mock them in tests — it handles the Vite-specific mechanism correctly.

```typescript
beforeEach(() => {
  vi.stubEnv("VITE_API_URL", "http://localhost:3001");
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});
```

Always call `vi.unstubAllEnvs()` in `afterEach` to prevent env state from leaking between tests.

## Fetch Mocking

Mock `globalThis.fetch` (not `window.fetch`) for JSDOM compatibility.

### Single response

```typescript
vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
  new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  }),
);
```

### Sequential responses

Chain `mockResolvedValueOnce` to set up ordered responses for multiple fetch calls (e.g., `/me` then `/magic-link`).

```typescript
vi.spyOn(globalThis, "fetch")
  .mockResolvedValueOnce(
    new Response(JSON.stringify({ user: null }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  )
  .mockResolvedValueOnce(
    new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
```

Use `mockResolvedValueOnce` (not `mockResolvedValue`) to ensure each call gets its expected response and to catch unexpected extra fetches.

### Never-resolving (loading state)

```typescript
vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise(() => {}));
```

A never-resolving promise keeps components in their loading state, allowing assertions on loading UI without races.

## QueryClient Test Wrappers

Create a fresh `QueryClient` per test with test-friendly defaults:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});
```

- **`retry: false`** — Prevents automatic retries on error, which cause flaky failures and slow tests.
- **`refetchOnWindowFocus: false`** — Prevents unexpected refetches during `userEvent` interactions that trigger focus events (e.g., clicking, tabbing).

Wrap your render in the provider:

```typescript
function createWrapper() {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

## Cleanup

When Vitest is **not** configured with `globals: true`, automatic cleanup from `@testing-library/react` is not enabled. You must call `cleanup()` explicitly in `afterEach` to prevent DOM from previous tests leaking into subsequent ones.

```typescript
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
```

If you skip this, you will see stale elements from prior tests appearing in queries, leading to confusing assertion failures.

## Async vs Sync Assertions

### Sync: `getByRole` / `getByText`

Use for elements present on initial render — throws immediately if not found.

```typescript
expect(screen.getByRole("heading", { name: /welcome/i })).toBeInTheDocument();
```

### Async: `findByRole` / `findByText`

Use for elements that appear after state updates (e.g., after a fetch resolves or auth check completes). Returns a Promise and internally uses `waitFor` with a timeout.

```typescript
const heading = await screen.findByRole("heading", { name: /dashboard/i });
expect(heading).toBeInTheDocument();
```

Do **not** wrap `findBy*` in an additional `waitFor` — it already polls internally.

### Rule of thumb

If the element depends on an async operation (fetch, state transition, route change), use `findBy*`. If it is rendered synchronously on mount, use `getBy*`.

## Hook Testing

Use `renderHook` from `@testing-library/react` to test custom hooks in isolation. Wrap hooks that depend on context providers (React Query, routers, etc.).

```typescript
import { renderHook, waitFor } from "@testing-library/react";

const { result } = renderHook(() => useAuth(), {
  wrapper: createWrapper(),
});

await waitFor(() => expect(result.current.isLoading).toBe(false));
expect(result.current.user).toEqual(expectedUser);
```

- Always provide a `wrapper` when the hook reads from context.
- Use `waitFor` to wait for async state transitions before asserting on `result.current`.
- Access `result.current` inside the `waitFor` callback so it reads the latest value.

## E2E Testing Brief

For Playwright-based E2E smoke tests:

- Use **role, placeholder, and text selectors** — never CSS selectors or test IDs unless no accessible alternative exists.
- Verify **page structure and interactions**, not visual appearance.
- Example:

```typescript
await expect(page.getByRole("heading", { name: /fan clú/i })).toBeVisible();
```

- Keep E2E tests focused on smoke-level checks: does the page load, are key elements present, do critical flows complete.
- For comprehensive Playwright patterns (fixtures, POM, network interception), reference the community [`webapp-testing`](https://github.com/anthropics/agent-skills/tree/main/skills/webapp-testing) skill.
