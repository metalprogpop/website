import { describe, expect, it } from "vitest";
import { hasFanClubAccess } from "./access.js";

describe("hasFanClubAccess", () => {
  it("lets staff in without a subscription", () => {
    expect(hasFanClubAccess({ role: "staff", latestStatus: null })).toBe(true);
  });

  it("lets fans in while their latest subscription is active", () => {
    expect(hasFanClubAccess({ role: "fan", latestStatus: "active" })).toBe(
      true,
    );
  });

  it("keeps out fans whose latest subscription is paused or cancelled", () => {
    expect(hasFanClubAccess({ role: "fan", latestStatus: "paused" })).toBe(
      false,
    );
    expect(hasFanClubAccess({ role: "fan", latestStatus: "cancelled" })).toBe(
      false,
    );
  });

  it("keeps out fans who never subscribed", () => {
    expect(hasFanClubAccess({ role: "fan", latestStatus: null })).toBe(false);
  });
});
