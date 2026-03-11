---
name: express-typescript-api
description: >-
  Use this skill when building or modifying Express.js API routes with
  TypeScript. Covers async handler wrapping, NodeNext import extensions,
  runtime payload validation, security patterns for authentication
  endpoints, and cross-origin redirect handling.
license: MIT
---

This skill codifies the patterns and guardrails for Express + TypeScript API development in a monorepo where the server and client run on separate origins.

## NodeNext Import Extensions

TypeScript's `module: "NodeNext"` resolution requires explicit `.js` extensions on local imports even though the source files are `.ts`. The compiler resolves `.js` back to `.ts` at compile time.

**Server code** (`server/src/`): always use `.js` extensions for local imports.

```typescript
// Correct
import { db } from "../db/index.js";
import { verifyToken } from "./auth/verify.js";

// Wrong — will fail at runtime under NodeNext
import { db } from "../db/index";
import { verifyToken } from "./auth/verify";
```

**Shared package** (`shared/src/`): uses `.ts` extensions in re-exports because `allowImportingTsExtensions: true` and `noEmit: true` are both set in its tsconfig. This is valid only when the package is never compiled to disk.

```typescript
// shared/src/index.ts — .ts extensions are fine here
export { MagicLinkPayloadSchema } from "./schemas/auth.ts";
```

**Client code** (`client/src/`): no extensions needed. Vite handles module resolution transparently.

**Rule of thumb**: check the workspace's `tsconfig.json` for `module` and `allowImportingTsExtensions` to know which convention applies.

## asyncHandler Wrapper

Express route handlers that return a `Promise` trigger `@typescript-eslint/no-misused-promises` because Express signatures expect `void`, not `Promise<void>`. The correct fix is a thin wrapper that catches rejected promises and forwards them to Express error middleware.

**Never suppress this with `eslint-disable`.** The lint rule exists to prevent unhandled rejections that silently hang requests.

```typescript
import { Request, Response, NextFunction } from "express";

const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
```

Usage:

```typescript
router.post(
  "/api/v1/auth/magic-link",
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    await sendMagicLink(email);
    res.json({ ok: true });
  }),
);
```

Every async route handler must be wrapped. If you see a bare `async (req, res) =>` passed directly to `router.get/post/...`, wrap it.

## Runtime Payload Validation

Data crossing a trust boundary (JWT payloads, request bodies, third-party API responses) must be validated at runtime. TypeScript's `as` casts provide zero runtime safety and hide real bugs.

**Never do this:**

```typescript
// Wrong — no runtime check, masks malformed tokens
const payload = jwt.verify(token, secret) as { userId: string };
```

**Use Zod schemas instead:**

```typescript
import { z } from "zod";

const TokenPayloadSchema = z.object({
  userId: z.string().uuid(),
  iat: z.number(),
});

const decoded = jwt.verify(token, secret);
const payload = TokenPayloadSchema.parse(decoded);
// payload is now typed AND validated
```

For simpler cases, manual type guards work too:

```typescript
if (typeof decoded !== "object" || decoded === null || !("userId" in decoded)) {
  throw new Error("Malformed token payload");
}
```

Share validation schemas via the `shared` workspace package so client and server stay in sync.

## Security Patterns

### Generic Auth Responses

Authentication endpoints must return the same response shape regardless of whether the user exists. This prevents user-enumeration attacks.

```typescript
// Correct — same response for all outcomes
router.post(
  "/api/v1/auth/magic-link",
  asyncHandler(async (req, res) => {
    const { email } = MagicLinkRequestSchema.parse(req.body);
    const user = await findUserByEmail(email);
    if (user) {
      await sendMagicLink(user);
    }
    // Always return the same message
    res.json({ message: "If an account exists, a login link has been sent." });
  }),
);
```

### parseInt with NaN Guard

Environment variables are strings. Parsing them to numbers can silently produce `NaN`, which propagates as a bug. Always guard with `Number.isNaN`:

```typescript
const port = parseInt(process.env.PORT ?? "3000", 10);
if (Number.isNaN(port)) {
  throw new Error("Invalid PORT environment variable");
}
```

### Env Var Validation at Startup

Validate all required environment variables at process start. Fail fast with a clear message rather than crashing mid-request.

```typescript
const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET", "CLIENT_URL"] as const;

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}
```

## Separate-Origin Redirects

In this stack, the server and client run on different origins (e.g., server on `:13001`, client on `:9001` in docker-compose). Server-side redirects to client pages must use the `CLIENT_URL` environment variable, never relative paths or hardcoded URLs.

```typescript
// Correct — uses env var for the client origin
res.redirect(`${process.env.CLIENT_URL}/verify?status=success`);

// Wrong — relative path only works if server and client share an origin
res.redirect("/verify?status=success");

// Wrong — hardcoded URL breaks across environments
res.redirect("http://localhost:9001/verify?status=success");
```

This applies to any response where the server needs to send the browser to a client-side route: auth callbacks, OAuth redirects, email verification links, etc.
