import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isTestUser } from "./testUsers.js";

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("TEST_USERS_ENABLED", "true");
  vi.stubEnv("TEST_USER_EMAILS", "admin@example.com, other@example.com");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isTestUser", () => {
  it("accepts a listed email in development, ignoring case", () => {
    expect(isTestUser("Admin@Example.com")).toBe(true);
    expect(isTestUser("other@example.com")).toBe(true);
  });

  it("rejects emails that aren't listed", () => {
    expect(isTestUser("fan@example.com")).toBe(false);
  });

  it("rejects everyone when the flag is off", () => {
    vi.stubEnv("TEST_USERS_ENABLED", "false");
    expect(isTestUser("admin@example.com")).toBe(false);
  });

  it.each(["production", "test", ""])(
    "rejects everyone when NODE_ENV is %j",
    (env) => {
      vi.stubEnv("NODE_ENV", env);
      expect(isTestUser("admin@example.com")).toBe(false);
    },
  );
});
