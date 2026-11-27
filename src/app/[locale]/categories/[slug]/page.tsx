import { Search } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArchiveCard } from "@/components/public/archive-card";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { listCategories, listPublicArticles } from "@/lib/content/queries";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const categories = await listCategories(locale as Locale);
  const category = categories.find((item) => item.slug === slug);
  return { title: category?.seoTitle || category?.name || "Category", description: category?.seoDescription || category?.description };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { locale, slug } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations();
  const categories = await listCategories(locale as Locale);
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();
  const page = Math.max(1, Number(query.page ?? "1") || 1);
  const result = await listPublicArticles(locale as Locale, { categorySlug: slug, query: query.q, page, pageSize: 9 });
  const pages = Math.max(1, Math.ceil(result.total / 9));
  const href = (nextPage: number) => {
    const params = new URLSearchParams();
    if (query.q) params.set("q", query.q);
    if (nextPage > 1) params.set("page", String(nextPage));
    const value = params.toString();
    return value ? `/categories/${slug}?${value}` : `/categories/${slug}`;
  };
  return (
    <div className="mx-auto max-w-[1200px] px-5 py-12 sm:px-7">
      <p className="text-sm text-[#64716D]"><Link href="/" className="hover:text-[#0B6E66]">Home</Link> <span aria-hidden="true">/</span> <Link href="/categories" className="hover:text-[#0B6E66]">Categories</Link> <span aria-hidden="true">/</span> {category.name}</p>
      <h1 className="mt-4 font-display text-4xl font-semibold text-[#123A35]">{category.name}</h1>
      {category.description ? <p className="mt-3 max-w-2xl text-[#64716D]">{category.description}</p> : null}
      <form className="mt-8 flex flex-col gap-3 sm:flex-row" action={`/${locale}/categories/${slug}`}>
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#64716D]" aria-hidden />
          <input name="q" defaultValue={query.q ?? ""} placeholder="Search this topic" className="h-11 w-full rounded-md border border-[#E4E8E5] bg-white pr-3 pl-9 text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0B6E66]" />
        </label>
        <button className="h-11 rounded-md bg-[#0B6E66] px-4 text-sm font-semibold text-white">Search</button>
      </form>
      {result.items.length === 0 ? <p className="mt-12 text-[#64716D]">{t("archive.empty")}</p> : (
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((article) => <ArchiveCard key={article.id} article={article} date={formatDate(article.publishedAt, locale)} />)}
        </div>
      )}
      {pages > 1 ? (
        <nav className="mt-12 flex gap-2" aria-label="Pagination">
          {page > 1 ? <Link href={href(page - 1)} className="h-9 rounded-md border border-[#E4E8E5] px-3 text-sm leading-9">Previous</Link> : <span className="h-9 px-3 text-sm leading-9 text-[#87918D]">Previous</span>}
          <span className="h-9 px-2 text-sm leading-9 text-[#64716D]">{page} / {pages}</span>
          {page < pages ? <Link href={href(page + 1)} className="h-9 rounded-md border border-[#E4E8E5] px-3 text-sm leading-9">Next</Link> : <span className="h-9 px-3 text-sm leading-9 text-[#87918D]">Next</span>}
        </nav>
      ) : null}
    </div>
  );
}
