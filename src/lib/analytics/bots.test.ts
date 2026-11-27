import { describe, expect, it } from "vitest";
import { isEngagedRead, isLikelyBot } from "./bots";

describe("analytics filters", () => {
  it("flags common crawlers", () => {
    expect(isLikelyBot("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(true);
    expect(isLikelyBot("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0")).toBe(false);
  });

  it("counts an engaged read from time or depth", () => {
    expect(isEngagedRead({ durationSeconds: 31, scrollDepth: 10 })).toBe(true);
    expect(isEngagedRead({ durationSeconds: 5, scrollDepth: 50 })).toBe(true);
    expect(isEngagedRead({ durationSeconds: 5, scrollDepth: 20 })).toBe(false);
  });
});
