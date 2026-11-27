import { Search } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArchiveCard } from "@/components/public/archive-card";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { listCategories, listPublicArticles } from "@/lib/content/queries";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PublicationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations();
  const page = Math.max(1, Number(query.page ?? "1") || 1);
  const pageSize = 9;
  const [result, categories] = await Promise.all([
    listPublicArticles(locale as Locale, {
      query: query.q,
      categorySlug: query.category,
      sort: "latest",
      page,
      pageSize,
    }),
    listCategories(locale as Locale),
  ]);
  const pages = Math.max(1, Math.ceil(result.total / pageSize));
  const href = (nextPage: number) => {
    const params = new URLSearchParams();
    if (query.q) params.set("q", query.q);
    if (query.category) params.set("category", query.category);
    if (nextPage > 1) params.set("page", String(nextPage));
    const value = params.toString();
    return value ? `/publications?${value}` : "/publications";
  };
  const numbers = Array.from({ length: pages }, (_, index) => index + 1).filter((item) => item === 1 || item === pages || Math.abs(item - page) <= 1);
  return (
    <div className="mx-auto max-w-[1200px] px-5 py-12 sm:px-7">
      <p className="text-sm text-[#64716D]"><Link href="/" className="hover:text-[#0B6E66]">Home</Link> <span aria-hidden="true">/</span> Publications</p>
      <h1 className="mt-4 font-display text-4xl font-semibold text-[#123A35] sm:text-5xl">Publications</h1>
      <p className="mt-3 max-w-2xl text-[#64716D]">Articles, reviews and explainers written to be read carefully. Sample entries are marked in the article text and are not clinical advice.</p>
      <form action={`/${locale}/publications`} className="mt-8 flex flex-col gap-3 sm:flex-row">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#64716D]" aria-hidden />
          <input name="q" defaultValue={query.q ?? ""} placeholder={t("archive.search")} className="h-11 w-full rounded-md border border-[#E4E8E5] bg-white pr-3 pl-9 text-sm text-[#26332F] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0B6E66]" />
        </label>
        <select name="category" defaultValue={query.category ?? ""} className="h-11 rounded-md border border-[#E4E8E5] bg-white px-3 text-sm text-[#26332F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0B6E66]">
          <option value="">{t("archive.allCategories")}</option>
          {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
        </select>
        <button className="h-11 rounded-md bg-[#0B6E66] px-4 text-sm font-semibold text-white hover:bg-[#085E58]">Search</button>
        {query.q || query.category ? <Link href="/publications" className="inline-flex h-11 items-center text-sm font-medium text-[#0B6E66]">Clear</Link> : null}
      </form>
      {result.items.length === 0 ? <p className="mt-12 text-[#64716D]">{t("archive.empty")}</p> : (
        <div className="mt-8 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((article) => <ArchiveCard key={article.id} article={article} date={formatDate(article.publishedAt, locale)} />)}
        </div>
      )}
      {pages > 1 ? (
        <nav className="mt-12 flex flex-wrap items-center gap-2" aria-label="Pagination">
          {page > 1 ? <Link href={href(page - 1)} className="h-9 rounded-md border border-[#E4E8E5] px-3 text-sm leading-9 text-[#123A35]">Previous</Link> : <span className="h-9 rounded-md border border-[#E4E8E5] px-3 text-sm leading-9 text-[#87918D]">Previous</span>}
          {numbers.map((item, index) => (
            <span key={item} className="flex items-center gap-2">
              {index > 0 && numbers[index - 1] !== item - 1 ? <span className="text-[#64716D]">…</span> : null}
              <Link href={href(item)} aria-current={item === page ? "page" : undefined} className={`grid h-9 w-9 place-items-center rounded-md text-sm ${item === page ? "bg-[#0B6E66] text-white" : "border border-[#E4E8E5] text-[#123A35]"}`}>{item}</Link>
            </span>
          ))}
          {page < pages ? <Link href={href(page + 1)} className="h-9 rounded-md border border-[#E4E8E5] px-3 text-sm leading-9 text-[#123A35]">Next</Link> : <span className="h-9 rounded-md border border-[#E4E8E5] px-3 text-sm leading-9 text-[#87918D]">Next</span>}
        </nav>
      ) : null}
    </div>
  );
}
