import { execFileSync } from "node:child_process";

// A registered user who is not a test user, so the magic-link flow runs for
// real instead of the instant test-user login. set-role creates the user when
// missing and is idempotent.
export const E2E_MAGIC_LINK_EMAIL = "e2e@example.com";

export default function globalSetup(): void {
  execFileSync(
    "docker",
    [
      "compose",
      "exec",
      "-T",
      "server",
      "pnpm",
      "set-role",
      E2E_MAGIC_LINK_EMAIL,
      "fan",
    ],
    { stdio: "inherit" },
  );
}
