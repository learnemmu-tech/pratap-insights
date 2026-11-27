import { describe, expect, it } from "vitest";
import { isCommentPublic, isPubliclyVisible } from "./visibility";

describe("publication visibility", () => {
  const now = new Date("2026-01-01T00:00:00Z");

  it("shows published and due scheduled translations only", () => {
    expect(isPubliclyVisible({ status: "published", publishedAt: new Date("2025-12-01"), now })).toBe(true);
    expect(isPubliclyVisible({ status: "scheduled", publishedAt: new Date("2025-12-01"), now })).toBe(true);
    expect(isPubliclyVisible({ status: "scheduled", publishedAt: new Date("2026-02-01"), now })).toBe(false);
    expect(isPubliclyVisible({ status: "draft", publishedAt: new Date("2025-12-01"), now })).toBe(false);
  });

  it("keeps unapproved comments private", () => {
    expect(isCommentPublic("pending")).toBe(false);
    expect(isCommentPublic("approved")).toBe(true);
  });
});
