import { getSite } from "@/lib/content/queries";

export async function LegalBody({ title, fallback, field, locale }: { title: string; fallback: string; field: string; locale: string }) {
  const site = await getSite();
  const legal = (site?.legal ?? {}) as Record<string, Record<string, string>>;
  const text = legal[locale]?.[field] || fallback;
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-display text-5xl text-navy">{title}</h1>
      <div className="locale-copy mt-8 whitespace-pre-wrap leading-8">{text}</div>
    </div>
  );
}
