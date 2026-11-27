import { Activity, BookOpen, Cpu, GraduationCap, MessageSquare, Microscope, ShieldPlus, Stethoscope } from "lucide-react";
import { Source_Serif_4 } from "next/font/google";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { listCategories, listPublicArticles } from "@/lib/content/queries";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const serif = Source_Serif_4({ subsets: ["latin"], weight: ["600", "700"] });

const icons: Record<string, typeof Activity> = {
  anesthesiology: Activity,
  "clinical-practice": Stethoscope,
  "medical-education": GraduationCap,
  "research-evidence": Microscope,
  "patient-safety": ShieldPlus,
  "healthcare-perspectives": MessageSquare,
  "professional-development": BookOpen,
  "technology-ai": Cpu,
};

export default async function CategoriesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations();
  const [categories, recent] = await Promise.all([
    listCategories(locale as Locale),
    listPublicArticles(locale as Locale, { pageSize: 8 }),
  ]);
  const q = query.q?.trim().toLowerCase() ?? "";
  const visible = categories.filter((category) => !q || `${category.name} ${category.description}`.toLowerCase().includes(q));
  return (
    <div>
      <div className="mx-auto max-w-[1120px] px-5 py-10 sm:px-7">
        <p className="text-sm text-[#64716D]">
          <Link href="/" className="hover:text-[#0B6E66]">Home</Link>
          <span aria-hidden="true"> / </span>
          Medical Topics
        </p>
        <p className="mt-8 text-xs font-semibold tracking-[0.14em] text-[#0B6E66] uppercase">Explore</p>
        <h1 className="mt-3 text-4xl font-semibold text-[#123A35] sm:text-5xl" style={{ fontFamily: serif.style.fontFamily }}>Medical topics</h1>
        <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-[#64716D]">Browse Pratap Insights by area of interest, from the operating theatre to the classroom.</p>
        <form action={`/${locale}/categories`} className="mt-6 flex max-w-xl gap-3">
          <label className="sr-only" htmlFor="topic-filter">Filter topics</label>
          <input id="topic-filter" name="q" defaultValue={query.q ?? ""} placeholder="Filter topics" className="h-11 min-w-0 flex-1 rounded-md border border-[#E4E8E5] bg-white px-3 text-[15px] text-[#26332F] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0B6E66]" />
          <button className="h-11 shrink-0 rounded-md bg-[#0B6E66] px-5 text-[15px] font-semibold text-white hover:bg-[#085E58]">Filter</button>
        </form>
      </div>
      <div className="border-t border-[#E4E8E5]">
        <div className="mx-auto max-w-[1120px] px-5 py-10 sm:px-7">
          {visible.length === 0 ? <p className="text-[16px] text-[#64716D]">{t("categories.empty")}</p> : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {visible.map((category) => {
                const Icon = icons[category.slug] ?? Activity;
                return (
                  <li key={category.id} className="flex flex-col border border-[#E4E8E5] border-t-[3px] border-t-[#123A35] bg-white p-5">
                    <span className="grid h-10 w-10 place-items-center rounded-md bg-[#F2F5F2] text-[#0B6E66]">
                      <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
                    </span>
                    <h2 className="mt-4 text-[18px] font-semibold text-[#123A35]" style={{ fontFamily: serif.style.fontFamily }}>{category.name}</h2>
                    {category.description ? <p className="mt-2 flex-1 text-[15px] leading-snug text-[#64716D]">{category.description}</p> : null}
                    <Link href={`/categories/${category.slug}`} className="mt-4 inline-block text-[15px] font-medium text-[#0B6E66] underline underline-offset-4">View articles</Link>
                  </li>
                );
              })}
            </ul>
          )}
          <section className="mt-16">
            <p className="text-xs font-semibold tracking-[0.14em] text-[#64716D] uppercase">Archive</p>
            <h2 className="mt-3 border-b border-[#E4E8E5] pb-4 text-[32px] font-semibold text-[#123A35]" style={{ fontFamily: serif.style.fontFamily }}>Recently published across topics</h2>
            {recent.items.length === 0 ? <p className="mt-6 text-[#64716D]">{t("latest.empty")}</p> : (
              <ul>
                {recent.items.map((article) => (
                  <li key={article.id} className="border-b border-[#E4E8E5] py-5">
                    <Link href={`/publications/${article.slug}`} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-8">
                      <span>
                        {article.categoryName ? <span className="block text-xs font-semibold tracking-[0.12em] text-[#0B6E66] uppercase">{article.categoryName}</span> : null}
                        <span className="mt-1 block text-[20px] leading-snug font-semibold text-[#123A35]" style={{ fontFamily: serif.style.fontFamily }}>{article.title}</span>
                      </span>
                      <span className="text-right text-[14px] leading-5 text-[#64716D]">
                        <span className="block">{formatDate(article.publishedAt, locale)}</span>
                        <span className="block">{article.readingMinutes} min read</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
