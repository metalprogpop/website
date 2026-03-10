# Fan Clú — Design Spec

A gated section of the website for podcast subscribers. Users authenticate via magic link email. Once authenticated, users see a placeholder welcome message; exclusive content is out of scope for this spec and will be designed separately.

## Authentication Flow

1. User visits `/fan-clu` → sees teaser page with email input
2. User submits email → `POST /api/v1/auth/magic-link`
   - Server checks email exists in `users` table
   - If not found: returns same 200 response (prevents email enumeration)
   - If found: generates token, stores in DB, sends magic link via Resend
3. User clicks link → `GET /api/v1/auth/verify?token=xxx`
   - Server validates token (exists, not expired)
   - Deletes token row (single-use)
   - Signs JWT (`userId`, `email`) and sets HTTP-only cookie
   - Redirects to `/fan-clu`
4. Browser sends cookie on subsequent requests → page renders authenticated content

## Auth Mechanism

- **JWT in HTTP-only cookie** (Secure, SameSite=Strict)
- Stateless — no server-side session store
- No client-side token management needed

### Magic Link Tokens

- 64-char hex string via `crypto.randomBytes(32)`
- Stored in `magic_tokens` table
- Deleted after successful verification
- Expired tokens for a user are cleaned up on new magic link request (cleanup-on-write)
- Broader expiration cleanup is handled separately by the team

## Data Model

### Existing table: `users`

| Column    | Type      | Notes            |
| --------- | --------- | ---------------- |
| id        | serial    | Primary key      |
| email     | text      | Unique, required |
| name      | text      | Optional         |
| createdAt | timestamp | Default `now()`  |

### New table: `magic_tokens`

| Column    | Type      | Notes                            |
| --------- | --------- | -------------------------------- |
| id        | serial    | Primary key                      |
| userId    | integer   | FK to `users.id`                 |
| token     | text      | 64-char hex, unique              |
| expiresAt | timestamp | Computed app-side at insert time |
| createdAt | timestamp | Default `now()`                  |

## API Routes

| Method | Route                     | Purpose                                  |
| ------ | ------------------------- | ---------------------------------------- |
| POST   | `/api/v1/auth/magic-link` | Accept email, send magic link            |
| GET    | `/api/v1/auth/verify`     | Validate token, set JWT cookie, redirect |
| GET    | `/api/v1/auth/me`         | Return current user from JWT (or 401)    |
| POST   | `/api/v1/auth/logout`     | Clear the JWT cookie                     |

## Environment Variables

| Variable                              | Purpose                  | Default |
| ------------------------------------- | ------------------------ | ------- |
| `JWT_SECRET`                          | Signing key for JWTs     | —       |
| `JWT_EXPIRATION_DAYS`                 | Session duration in days | 90      |
| `RESEND_API_KEY`                      | Resend API key           | —       |
| `MAGIC_LINK_BASE_URL`                 | Base URL for magic link  | —       |
| `MAGIC_LINK_TOKEN_EXPIRATION_MINUTES` | Token TTL in minutes     | 10      |

## Client Architecture

### Page: `/fan-clu`

Split layout:

- **Left side:** teaser copy describing Fan clú + benefit tags (e.g., bonus content, behind the scenes, notes)
- **Right side:** email input form with "Send magic link" button
- Uses existing design system (Outfit/Inter fonts, Pop Red accent, dark theme, Tailwind)

Conditional rendering:

- `isLoading` → spinner
- Not authenticated → teaser + login form
- Authenticated → placeholder content with welcome message

### Auth State

- `useAuth()` hook using React Query
- Calls `GET /api/v1/auth/me` on mount
- Returns `{ user, isLoading, isAuthenticated, logout }`
- JWT cookie sent automatically by browser — no client-side token handling

### Magic Link Form UX

1. User enters email, submits
2. Confirmation message: "Si tu email está registrado, te enviamos un link" (same regardless of email existence)
3. Link click → server sets cookie → redirect → React Query refetches `/me` → authenticated view

## Server Architecture

### File Organization

| File                            | Purpose                                                           |
| ------------------------------- | ----------------------------------------------------------------- |
| `server/src/routes/auth.ts`     | All 4 auth routes (handlers inline, no separate controller)       |
| `server/src/middleware/auth.ts` | `requireAuth` middleware                                          |
| `server/src/lib/email.ts`       | Resend email sending                                              |
| `server/src/lib/jwt.ts`         | JWT sign/verify helpers                                           |
| `shared/src/auth.ts`            | Zod schemas for auth types (add to `shared/src/index.ts` exports) |

### Server Dependencies

- `cookie-parser` — required for reading/setting HTTP-only cookies in Express
- `jsonwebtoken` — JWT signing and verification
- `resend` — email delivery
- `cors` — CORS middleware for cross-origin cookie support

### CORS Configuration

The client and server run on different origins in development (client `:9001`, server `:13001`). Cookie-based auth requires explicit CORS config:

- `credentials: true`
- `origin` set to the client URL (not `*`)
- The client must set `credentials: 'include'` on auth-related fetches only (in `useAuth` hook and magic link mutation), not globally, to avoid sending credentials to third-party endpoints like the CORS proxy used by `useEpisodes`

### Auth Middleware

Reads JWT from cookie (via `cookie-parser`), verifies signature and expiry, attaches `req.user` to request. Returns 401 if invalid or missing.

### Magic Link Endpoint

1. Validate email with Zod
2. Look up user in `users` table
3. If not found → return 200 with generic message
4. Delete expired tokens for this user (cleanup-on-write)
5. Generate token via `crypto.randomBytes(32).toString('hex')`
6. Insert into `magic_tokens`
7. Send email via Resend
8. Return 200 with generic message

### Verify Endpoint

1. Look up token in `magic_tokens` (join with `users`)
2. If not found or expired → redirect to `/fan-clu?error=invalid`
3. Delete the token row
4. Sign JWT, set HTTP-only cookie
5. Redirect to `/fan-clu`

## Testing

### Integration Tests (`client/src/__tests__/`)

- `useAuth` hook: mock `/me` responses — authenticated, unauthenticated, loading
- `FanClu` page: renders teaser+form when unauthenticated, placeholder when authenticated
- Magic link form: submits email, shows confirmation message

### E2E Tests (`e2e/`)

- `/fan-clu` loads and shows teaser page with email form
- Submitting the form shows confirmation message
- Visiting `/fan-clu?error=invalid` shows an error message on the teaser page
