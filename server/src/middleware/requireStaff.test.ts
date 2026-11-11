import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "shared";
import { signToken } from "../lib/jwt.js";

// The database answers with this user's role (or no user).
let role: UserRole | undefined;

vi.mock("../db/index.js", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve(role ? [{ role }] : []),
        }),
      }),
    }),
  },
}));

const { requireStaff } = await import("./requireStaff.js");
const { adminPoneRecRouter } = await import("../routes/adminPoneRec.js");

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
    requireStaff({ cookies } as Request, res, next);
  });

const session = () => ({
  auth_token: signToken({ id: 1, email: "staff@example.com" }),
});

beforeEach(() => {
  vi.stubEnv("JWT_SECRET", "test-secret");
  role = "staff";
});

describe("requireStaff", () => {
  it("answers 404 to anonymous visitors, bad tokens and fans", async () => {
    expect(await run({})).toEqual({ status: 404, next: false });
    expect(await run({ auth_token: "nope" })).toEqual({
      status: 404,
      next: false,
    });
    role = "fan";
    expect(await run(session())).toEqual({ status: 404, next: false });
    role = undefined;
    expect(await run(session())).toEqual({ status: 404, next: false });
  });

  it("lets staff through", async () => {
    expect(await run(session())).toEqual({ next: true });
  });

  it("guards every Poné Rec admin route", () => {
    // router.use(requireStaff) is the first layer, ahead of every route.
    const stack = (
      adminPoneRecRouter as unknown as { stack: { handle: unknown }[] }
    ).stack;
    expect(stack.at(0)?.handle).toBe(requireStaff);
  });
});
