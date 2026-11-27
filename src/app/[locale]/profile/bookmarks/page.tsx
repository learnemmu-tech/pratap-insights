import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArticleCard } from "@/components/public/article-card";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { readerBookmarks } from "@/lib/content/queries";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function BookmarksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await getSession();
  if (!session?.user) {
    redirect({ href: "/login", locale });
    return null;
  }
  const reader = session.user;
  const t = await getTranslations();
  const items = await readerBookmarks(reader.id, locale as Locale);
  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <h1 className="font-display text-5xl text-navy">{t("profile.bookmarks")}</h1>
      {items.length === 0 ? <p className="mt-8 text-muted">{t("profile.emptyBookmarks")}</p> : (
        <div className="mt-10 grid gap-10">{items.map((article) => <ArticleCard key={article.id} article={article} locale={locale} />)}</div>
      )}
    </div>
  );
}
