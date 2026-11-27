import { describe, expect, it } from "vitest";
import { sanitizeContent } from "./sanitize";

describe("sanitizeContent", () => {
  it("drops script-like nodes and unsafe links", () => {
    const cleaned = sanitizeContent({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Read",
              marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
            },
          ],
        },
        { type: "script", content: [{ type: "text", text: "alert(1)" }] },
      ],
    });
    expect(JSON.stringify(cleaned)).not.toContain("javascript:");
    expect(JSON.stringify(cleaned)).not.toContain("script");
    expect(cleaned.content?.[0]?.content?.[0]?.marks ?? []).toHaveLength(0);
  });

  it("keeps safe headings, images and citations", () => {
    const cleaned = sanitizeContent({
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Airway" }] },
        { type: "image", attrs: { src: "https://cdn.example.com/a.jpg", alt: "Figure", caption: "Fig 1" } },
        { type: "reference", attrs: { label: "1" }, content: [{ type: "text", text: "Journal. 2024." }] },
      ],
    });
    expect(cleaned.content?.map((node) => node.type)).toEqual(["heading", "image", "reference"]);
  });
});
