import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";
import type { SubscriptionStatus, UserRole } from "shared";
import { signToken } from "../lib/jwt.js";

// The database answers with this user (or none) and this subscription.
let user: { email: string; role: UserRole } | undefined;
let latestStatus: SubscriptionStatus | null = null;

vi.mock("../db/index.js", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve(user ? [user] : []),
        }),
      }),
    }),
  },
}));

vi.mock("../fanClub/queries.js", () => ({
  latestStatusForEmail: () => Promise.resolve(latestStatus),
}));

const { requireFanClubAccess } = await import("./requireFanClubAccess.js");

type Outcome = { status?: number; next: boolean };

const run = (cookies: unknown): Promise<Outcome> =>
  new Promise((resolve) => {
    const outcome: Outcome = { next: false };
    const res = {
      status(code: number) {
        outcome.status = code;
        return this;
      },
      json() {
        resolve(outcome);
        return this;
      },
    } as unknown as Response;
    const next: NextFunction = (err?: unknown) => {
      outcome.next = err === undefined;
      resolve(outcome);
    };
    requireFanClubAccess({ cookies } as Request, res, next);
  });

const session = () => ({
  auth_token: signToken({ id: 1, email: "fan@example.com" }),
});

beforeEach(() => {
  vi.stubEnv("JWT_SECRET", "test-secret");
  user = { email: "fan@example.com", role: "fan" };
  latestStatus = "active";
});

describe("requireFanClubAccess", () => {
  it("answers 401 without a session or with a bad token", async () => {
    expect(await run({})).toEqual({ status: 401, next: false });
    expect(await run({ auth_token: "nope" })).toEqual({
      status: 401,
      next: false,
    });
  });

  it("answers 401 when the session's user no longer exists", async () => {
    user = undefined;
    expect(await run(session())).toEqual({ status: 401, next: false });
  });

  it.each<SubscriptionStatus | null>(["paused", "cancelled", null])(
    "answers 403 to a fan whose latest subscription is %s",
    async (status) => {
      latestStatus = status;
      expect(await run(session())).toEqual({ status: 403, next: false });
    },
  );

  it("lets active fans and staff through", async () => {
    expect(await run(session())).toEqual({ next: true });
    user = { email: "fan@example.com", role: "staff" };
    latestStatus = null;
    expect(await run(session())).toEqual({ next: true });
  });
});
