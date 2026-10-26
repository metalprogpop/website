import { describe, expect, it } from "vitest";
import { nextPlayable, programMatches } from "../lib/fanClubVideos";
import { videoProgram } from "./videoFixtures";

describe("nextPlayable", () => {
  it("skips a lost part", () => {
    const { parts } = videoProgram(5, [2]);
    expect(nextPlayable(parts, parts[0])?.part).toBe(3);
  });

  it("has nothing after the last playable part", () => {
    const { parts } = videoProgram(5, [3]);
    expect(nextPlayable(parts, parts[1])).toBeUndefined();
  });
});

describe("programMatches", () => {
  it("matches a number only as a whole number in a title", () => {
    // Program 4 holds discs 10, 11 and 12.
    expect(programMatches(videoProgram(4), "12")).toBe(true);
    expect(programMatches(videoProgram(4), "2")).toBe(false);
    expect(programMatches(videoProgram(4), "4")).toBe(true);
  });
});
