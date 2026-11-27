import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArticleCard } from "@/components/public/article-card";
import type { Locale } from "@/i18n/routing";
import { searchArticles } from "@/lib/content/queries";

export const dynamic = "force-dynamic";

export default async function SearchPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string }> }) {
  const { locale } = await params;
  const { q } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations();
  const items = q ? await searchArticles(locale as Locale, q) : [];
  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <h1 className="font-display text-5xl text-navy">{t("search.title")}</h1>
      <form action={`/${locale}/search`} className="mt-8 flex gap-3">
        <label className="sr-only" htmlFor="q">{t("search.prompt")}</label>
        <input id="q" name="q" defaultValue={q} className="w-full border border-line bg-white px-3 py-3" />
        <button className="bg-navy px-4 py-3 text-white">{t("search.submit")}</button>
      </form>
      {q && items.length === 0 ? <p className="mt-8 text-muted">{t("search.empty")}</p> : null}
      <div className="mt-10 grid gap-10">
        {items.map((article) => <ArticleCard key={article.id} article={article} locale={locale} />)}
      </div>
    </div>
  );
}
