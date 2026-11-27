import type { ReactNode } from "react";
import { headingsFromContent, nodeText, type TipTapNode, sanitizeContent } from "@/lib/content/sanitize";

function linkLabel(url: string) {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname === "/" ? "" : parsed.pathname;
    const label = `${parsed.hostname.replace(/^www\./, "")}${path}`;
    return label.length > 48 ? `${label.slice(0, 45)}…` : label;
  } catch {
    return url;
  }
}

export function ArticleBody({ content }: { content: unknown }) {
  const doc = sanitizeContent(content);
  const headings = headingsFromContent(doc);
  let headingIndex = 0;
  const render = (node: TipTapNode, key: string): ReactNode => {
    const children = node.content?.map((child, index) => render(child, `${key}-${index}`));
    if (node.type === "text") {
      let element: ReactNode = node.text;
      for (const mark of node.marks ?? []) {
        if (mark.type === "bold") element = <strong key={`${key}-b`}>{element}</strong>;
        if (mark.type === "italic") element = <em key={`${key}-i`}>{element}</em>;
        if (mark.type === "link" && mark.attrs?.href) {
          const href = String(mark.attrs.href);
          const raw = typeof node.text === "string" ? node.text : href;
          const label = raw.startsWith("http") && raw.length > 42 ? linkLabel(raw) : raw;
          element = (
            <a key={`${key}-a`} href={href} rel="noopener noreferrer">
              {label}
            </a>
          );
        }
      }
      return <span key={key}>{element}</span>;
    }
    if (node.type === "heading") {
      headingIndex += 1;
      const id = `section-${headingIndex}`;
      const level = Number(node.attrs?.level ?? 2);
      const Tag = level === 1 ? "h1" : level === 3 ? "h3" : "h2";
      return (
        <Tag id={id} key={key}>
          {children}
        </Tag>
      );
    }
    if (node.type === "paragraph") return <p key={key}>{children}</p>;
    if (node.type === "bulletList") return <ul key={key} className="list-disc">{children}</ul>;
    if (node.type === "orderedList") return <ol key={key} className="list-decimal">{children}</ol>;
    if (node.type === "listItem") return <li key={key}>{children}</li>;
    if (node.type === "blockquote") return <blockquote key={key}>{children}</blockquote>;
    if (node.type === "horizontalRule") return <hr key={key} className="my-8 border-line" />;
    if (node.type === "image" && node.attrs?.src) {
      return (
        <figure key={key} className="my-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={String(node.attrs.src)} alt={String(node.attrs.alt ?? "")} className="w-full" />
          {node.attrs.caption ? <figcaption className="mt-2 font-sans text-sm text-muted">{String(node.attrs.caption)}</figcaption> : null}
        </figure>
      );
    }
    if (node.type === "callout") {
      return (
        <aside key={key} className={`my-6 border px-4 py-3 font-sans text-base ${node.attrs?.tone === "caution" ? "border-[#0B6E66] bg-[#F2F5F2]" : "border-[#E4E8E5] bg-white"}`}>
          {children}
        </aside>
      );
    }
    if (node.type === "reference") {
      return (
        <p key={key} className="font-sans text-sm text-muted">
          <sup>{String(node.attrs?.label ?? "")}</sup> {nodeText(node)}
        </p>
      );
    }
    if (node.type === "table") {
      return (
        <div key={key} className="overflow-x-auto">
          <table>{children}</table>
        </div>
      );
    }
    if (node.type === "tableRow") return <tr key={key}>{children}</tr>;
    if (node.type === "tableHeader") return <th key={key}>{children}</th>;
    if (node.type === "tableCell") return <td key={key}>{children}</td>;
    if (node.type === "doc") return <div key={key}>{children}</div>;
    return null;
  };
  return (
    <div className="article-body text-ink">
      {render(doc, "doc")}
      <span className="hidden">{headings.length}</span>
    </div>
  );
}

export function TableOfContents({ content }: { content: unknown }) {
  const headings = headingsFromContent(sanitizeContent(content)).filter((item) => item.level > 1);
  if (headings.length < 2) return null;
  return (
    <nav aria-label="Contents" className="border-t border-line pt-4">
      <ol className="space-y-2 text-sm">
        {headings.map((heading) => (
          <li key={heading.id} className={heading.level === 3 ? "pl-3" : ""}>
            <a href={`#${heading.id}`} className="text-steel hover:text-navy">
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
