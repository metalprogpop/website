import { describe, expect, it } from "vitest";
import { hallOfFansName } from "./hallOfFans.js";

describe("hallOfFansName", () => {
  it("prefers the fan name", () => {
    expect(
      hallOfFansName({
        fanName: "Vitooor",
        firstName: "Víctor",
        lastName: "Córdoba",
      }),
    ).toBe("Vitooor");
  });

  it("falls back to the full name", () => {
    expect(
      hallOfFansName({ fanName: null, firstName: "Ana", lastName: "Pérez" }),
    ).toBe("Ana Pérez");
  });

  it("uses whichever name part exists", () => {
    expect(
      hallOfFansName({ fanName: null, firstName: "Shannon", lastName: null }),
    ).toBe("Shannon");
    expect(
      hallOfFansName({ fanName: null, firstName: null, lastName: "Laje" }),
    ).toBe("Laje");
  });

  it("ignores blank names", () => {
    expect(
      hallOfFansName({ fanName: "  ", firstName: " Ana ", lastName: "" }),
    ).toBe("Ana");
  });

  it("returns null when there is no name to show", () => {
    expect(
      hallOfFansName({ fanName: null, firstName: null, lastName: null }),
    ).toBeNull();
  });
});
