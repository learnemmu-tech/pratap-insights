const MARKS = new Set(["bold", "italic", "underline", "link"]);
const BLOCKS = new Set([
  "doc",
  "paragraph",
  "heading",
  "bulletList",
  "orderedList",
  "listItem",
  "blockquote",
  "image",
  "table",
  "tableRow",
  "tableCell",
  "tableHeader",
  "callout",
  "reference",
  "horizontalRule",
]);

export type TipTapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
};

const emptyDoc = (): TipTapNode => ({ type: "doc", content: [{ type: "paragraph" }] });

export function sanitizeContent(input: unknown): TipTapNode {
  if (!input || typeof input !== "object") return emptyDoc();
  const node = input as TipTapNode;
  const cleaned = sanitizeNode(node);
  if (!cleaned || cleaned.type !== "doc") return emptyDoc();
  return cleaned;
}

function sanitizeNode(node: TipTapNode): TipTapNode | null {
  if (!node || typeof node.type !== "string") return null;
  if (node.type === "text") {
    const marks = node.marks
      ?.filter((mark) => MARKS.has(mark.type))
      .map((mark) => ({
        type: mark.type,
        attrs: mark.type === "link" ? { href: safeHref(mark.attrs?.href) } : undefined,
      }))
      .filter((mark) => mark.type !== "link" || Boolean(mark.attrs?.href));
    return { type: "text", text: typeof node.text === "string" ? node.text.slice(0, 20000) : "", marks };
  }
  if (!BLOCKS.has(node.type)) return null;
  const next: TipTapNode = { type: node.type };
  if (typeof node.text === "string") next.text = node.text.slice(0, 20000);
  if (node.attrs) next.attrs = sanitizeAttrs(node.type, node.attrs);
  if (node.marks) {
    next.marks = node.marks
      .filter((mark) => MARKS.has(mark.type))
      .map((mark) => ({
        type: mark.type,
        attrs: mark.type === "link" ? { href: safeHref(mark.attrs?.href) } : undefined,
      }))
      .filter((mark) => mark.type !== "link" || Boolean(mark.attrs?.href));
  }
  if (Array.isArray(node.content)) {
    next.content = node.content
      .map((child) => sanitizeNode(child))
      .filter((child): child is TipTapNode => Boolean(child))
      .slice(0, 500);
  }
  return next;
}

function sanitizeAttrs(type: string, attrs: Record<string, unknown>) {
  if (type === "heading") {
    const level = Number(attrs.level);
    return { level: level === 1 || level === 2 || level === 3 ? level : 2 };
  }
  if (type === "image") {
    return {
      src: safeHref(attrs.src),
      alt: stringAttr(attrs.alt, 300),
      caption: stringAttr(attrs.caption, 400),
    };
  }
  if (type === "callout") return { tone: attrs.tone === "caution" ? "caution" : "note" };
  if (type === "reference") return { label: stringAttr(attrs.label, 40) };
  if (type === "tableCell" || type === "tableHeader") {
    return { colspan: clampInt(attrs.colspan, 1, 6), rowspan: clampInt(attrs.rowspan, 1, 6) };
  }
  return {};
}

function stringAttr(value: unknown, max: number) {
  return typeof value === "string" ? value.slice(0, max) : "";
}

function clampInt(value: unknown, min: number, max: number) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(max, Math.max(min, Math.floor(number)));
}

export function safeHref(value: unknown) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed.slice(0, 2000);
  try {
    const url = new URL(trimmed);
    if (url.protocol === "https:" || url.protocol === "http:") return url.toString();
  } catch {
    return "";
  }
  return "";
}

export function headingsFromContent(content: TipTapNode) {
  const headings: { id: string; level: number; text: string }[] = [];
  const walk = (node: TipTapNode) => {
    if (node.type === "heading") {
      const text = nodeText(node).trim();
      if (text) {
        headings.push({
          id: `section-${headings.length + 1}`,
          level: Number(node.attrs?.level ?? 2),
          text,
        });
      }
    }
    node.content?.forEach(walk);
  };
  walk(content);
  return headings;
}

export function nodeText(node: TipTapNode): string {
  if (node.text) return node.text;
  return (node.content ?? []).map(nodeText).join("");
}
