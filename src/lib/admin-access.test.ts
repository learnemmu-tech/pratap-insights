import { describe, expect, it } from "vitest";
import { isDesignatedAdmin } from "./admin-access";

describe("isDesignatedAdmin", () => {
  it("accepts only the verified owner address", () => {
    expect(isDesignatedAdmin("  Learnemmu@gmail.com ", true)).toBe(true);
    expect(isDesignatedAdmin("learnemmu@gmail.com", false)).toBe(false);
    expect(isDesignatedAdmin("reader@example.com", true)).toBe(false);
    expect(isDesignatedAdmin(null, true)).toBe(false);
  });
});
