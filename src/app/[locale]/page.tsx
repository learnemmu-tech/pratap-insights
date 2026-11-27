import { Activity, ArrowRight, BookOpen, GraduationCap, MessageSquare, Search, ShieldPlus, Stethoscope, TrendingUp } from "lucide-react";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArchiveCard } from "@/components/public/archive-card";
import { TopicCard } from "@/components/public/topic-card";
import { NewsletterForm } from "@/components/public/newsletter-form";
import type { Locale } from "@/i18n/routing";
import { getDoctor, listCategories, listPublicArticles } from "@/lib/content/queries";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;

const icons = [Activity, Stethoscope, GraduationCap, Search, ShieldPlus, MessageSquare, BookOpen];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const language = locale as Locale;
  const [{ items }, categories, doctor] = await Promise.all([
    listPublicArticles(language, { pageSize: 12 }),
    listCategories(language),
    getDoctor(language),
  ]);
  const featured = items.find((item) => item.featured) ?? items[0];
  const side = items.filter((item) => item.id !== featured?.id).slice(0, 4);
  const used = new Set([featured?.id, ...side.map((item) => item.id)].filter(Boolean));
  const latest = items.filter((item) => !used.has(item.id)).slice(0, 6);
  const perspectives = items.filter((item) => !used.has(item.id)).slice(0, 3);
  const profile = doctor?.translation;

  return (
    <div className="text-[#26332F]">
      <section className="border-b border-[#E4E8E5]">
        <div className="mx-auto grid max-w-[1200px] items-center gap-8 px-5 py-8 sm:gap-10 sm:px-7 sm:py-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-[72px]">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.12em] text-[#0B6E66] uppercase">Medical Knowledge & Professional Insights</p>
            <h1 className="mt-4 max-w-none font-display text-[1.85rem] leading-[1.15] font-semibold tracking-[-0.02em] text-[#123A35] sm:max-w-[16ch] sm:text-[2.6rem] lg:text-[2.85rem]">Advancing how healthcare understands itself.</h1>
            <p className="mt-4 max-w-[520px] text-[16px] leading-relaxed text-[#64716D] sm:mt-5 sm:text-[19px]">Pratap Insights publishes clear, evidence-informed articles and professional perspectives for clinicians, medical students and curious readers.</p>
            <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
              <Link href="/publications" className="inline-flex h-10 items-center rounded-md bg-[#0B6E66] px-4 text-sm font-semibold text-white hover:bg-[#085E58]">Explore Publications</Link>
              <Link href="/about" className="inline-flex h-10 items-center rounded-md border border-[#123A35] px-4 text-sm font-semibold text-[#123A35] hover:bg-[#123A35] hover:text-white">About</Link>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-[#E4E8E5] pt-5 sm:mt-12 sm:flex sm:flex-wrap sm:gap-8 sm:pt-7">
              <div className="min-w-0"><strong className="block font-display text-xl font-semibold text-[#123A35] sm:text-2xl">{categories.length}</strong><span className="text-[12px] text-[#64716D] sm:text-[13px]">Editorial topics</span></div>
              <div className="min-w-0"><strong className="block font-display text-xl font-semibold text-[#123A35] sm:text-2xl">Evidence-first</strong><span className="text-[12px] text-[#64716D] sm:text-[13px]">Editorial approach</span></div>
              <div className="min-w-0"><strong className="block font-display text-xl font-semibold text-[#123A35] sm:text-2xl">Weekly</strong><span className="text-[12px] text-[#64716D] sm:text-[13px]">Publishing rhythm</span></div>
            </div>
          </div>
          <HeroArt />
        </div>
      </section>

      <section className="mx-auto max-w-[1120px] px-5 py-10 sm:px-7">
        {featured ? (
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)] lg:gap-10">
            <article>
              <Link href={`/publications/${featured.slug}`} className="relative block aspect-[16/11] overflow-hidden rounded-2xl bg-[#F3F3F3]">
                {featured.imageUrl ? (
                  <Image src={featured.imageUrl} alt={featured.imageAlt || ""} fill sizes="(min-width: 1024px) 640px, 100vw" className="object-cover" />
                ) : null}
              </Link>
              {featured.categoryName ? <p className="mt-4 text-[15px] text-[#1F8A84]">{featured.categoryName}</p> : null}
              <h2 className="mt-1 text-[1.85rem] leading-[1.15] font-bold tracking-[-0.03em] sm:text-[2.15rem]">
                <Link href={`/publications/${featured.slug}`} className="text-[#111] transition-colors duration-150 hover:text-[#0B6E66]">{featured.title}</Link>
              </h2>
              {featured.excerpt ? <p className="mt-2 line-clamp-2 max-w-[48ch] text-[16px] leading-snug text-[#5C6562]">{featured.excerpt}</p> : null}
            </article>
            <div>
              <p className="mb-4 flex items-center gap-2 text-[20px] font-bold text-[#111]">
                <TrendingUp className="h-5 w-5 text-[#1F8A84]" strokeWidth={2.4} aria-hidden />
                Trending
              </p>
              <div className="flex flex-col gap-5">
                {side.map((article) => (
                  <Link key={article.id} href={`/publications/${article.slug}`} className="group flex items-center gap-4">
                    <span className="relative block h-[84px] w-[118px] shrink-0 overflow-hidden rounded-xl bg-[#F3F3F3] sm:h-[92px] sm:w-[132px]">
                      {article.imageUrl ? (
                        <Image src={article.imageUrl} alt="" fill sizes="132px" className="object-cover" />
                      ) : null}
                    </span>
                    <span className="min-w-0">
                      {article.categoryName ? <span className="block text-[14px] text-[#1F8A84]">{article.categoryName}</span> : null}
                      <span className="mt-1 line-clamp-3 block text-[17px] leading-snug font-bold text-[#111] transition-colors duration-150 group-hover:text-[#0B6E66] sm:text-[18px]">{article.title}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : <p className="text-[#5F6764]">{t("featured.empty")}</p>}
      </section>

      <section className="border-y border-[#E4E8E5]">
        <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-7 lg:py-14">
          <SectionHead eyebrow="Publications" title="Latest publications" text="Articles, reviews and explainers written to be read carefully and applied thoughtfully." action={{ href: "/publications", label: "View All Publications →" }} />
          {latest.length === 0 ? <p className="text-[#64716D]">{t("latest.empty")}</p> : (
            <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((article) => (
                <ArchiveCard key={article.id} article={article} date={formatDate(article.publishedAt, locale)} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-7 lg:py-14">
        <div className="mb-10 flex items-end justify-between gap-4 border-b border-[#E4E8E5] pb-5">
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-[#0B6E66] uppercase">Explore</p>
            <h2 className="mt-2 font-display text-[32px] font-semibold text-[#123A35] sm:text-4xl">Medical topics</h2>
          </div>
          <Link href="/categories" className="text-[15px] font-semibold whitespace-nowrap text-[#0B6E66] hover:text-[#085E58]">View All Topics →</Link>
        </div>
        {categories.length === 0 ? <p className="text-[17px] text-[#64716D]">{t("categories.empty")}</p> : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {categories.slice(0, 6).map((category, index) => (
              <TopicCard key={category.id} href={`/categories/${category.slug}`} name={category.name} icon={icons[index % icons.length]} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-[1120px] px-5 py-10 sm:px-7">
        <div className="grid items-stretch gap-4 lg:grid-cols-[1.35fr_0.72fr]">
          <div className="flex flex-col overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#D9EEF2_0%,#F3F7F4_62%)]">
            <div className="px-6 pt-10 text-center sm:px-12">
              <h2 className="text-[2rem] leading-tight font-bold tracking-[-0.03em] text-[#1A1A1A] sm:text-[2.35rem]">Professional insights</h2>
              <p className="mx-auto mt-3 max-w-[42ch] text-[16px] leading-relaxed text-[#3D4744]">Reflections on clinical thinking, education and evidence-informed practice.</p>
              <Link href="/publications" className="mt-6 inline-flex h-11 items-center rounded-full bg-[#0C7A72] px-5 text-[15px] font-semibold text-white transition-colors hover:bg-[#09645E]">Explore publications</Link>
            </div>
            {featured?.imageUrl ? (
              <span className="relative mt-8 block h-52 w-full sm:h-60">
                <Image src={featured.imageUrl} alt={featured.imageAlt || ""} fill sizes="(min-width: 1024px) 640px, 100vw" className="object-cover object-center" />
              </span>
            ) : <div className="mt-8 h-40" />}
          </div>
          <div className="flex flex-col gap-4">
            {(perspectives.length ? perspectives : side.slice(0, 3)).map((article) => (
              <Link key={article.id} href={`/publications/${article.slug}`} className="group flex flex-1 items-center justify-between gap-4 rounded-[22px] bg-[#E5F3F1] px-5 py-5">
                <span className="min-w-0">
                  {article.categoryName ? <span className="block text-[14px] font-semibold text-[#0C7A72]">{article.categoryName}</span> : null}
                  <span className="mt-1 line-clamp-2 block text-[18px] leading-snug font-bold text-[#1A1A1A] transition-colors group-hover:text-[#0C7A72]">{article.title}</span>
                </span>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#0C7A72]" aria-hidden>
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-16 sm:px-7 lg:grid-cols-[1fr_1.1fr] lg:py-14">
        {profile && doctor?.portrait ? (
          // eslint-disable-next-line @next/next/no-img-element
          <span className="relative block aspect-square w-full overflow-hidden rounded-md">
            <Image src={doctor.portrait} alt={profile.name || "Dr. Pratap"} fill sizes="(min-width: 1024px) 520px, 100vw" className="object-cover" />
          </span>
        ) : <PortraitPanel />}
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-[#0B6E66] uppercase">About Pratap Insights</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-[#123A35] sm:text-4xl">A quiet, careful place for medical ideas.</h2>
          <p className="mt-5 text-[17px] text-[#64716D]">{profile?.introduction || "Pratap Insights exists to share medical knowledge and professional perspectives in a form that is clear, honest and useful. We believe understanding grows through continuous learning and evidence-informed thinking."}</p>
          <p className="mt-4 text-[17px] text-[#64716D]">Every article aims to contribute something to medical understanding, whether it explains a concept, examines the evidence or invites reflection.</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {[["Medical knowledge", "Clear, accurate explanations."], ["Professional perspectives", "Thoughtful, practice-minded views."], ["Continuous learning", "Writing that supports growth."], ["Evidence-informed", "Claims grounded in sources."]].map(([title, text]) => (
              <div key={title} className="border-t border-[#E7E7E7] pt-3"><b className="block text-base font-semibold text-[#111]">{title}</b><span className="text-[13px] text-[#5F6764]">{text}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-7">
        <div className="mx-auto grid max-w-[1200px] items-center gap-6 rounded-lg border border-[#E7E7E7] bg-[#FAFAFA] px-6 py-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="text-[1.6rem] font-semibold text-[#111]">New insights, delivered with care.</h2>
            <p className="mt-2 text-[15px] text-[#5F6764]">A short digest of new articles. No noise, just reading worth your time.</p>
          </div>
          <NewsletterForm locale={locale} appearance="default" />
        </div>
      </section>
    </div>
  );
}

function SectionHead({ eyebrow, title, text, action }: { eyebrow: string; title: string; text: string; action?: { href: "/publications"; label: string } }) {
  return (
    <div className="mb-8 flex flex-col gap-3 border-b border-[#E4E8E5] pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold tracking-[0.12em] text-[#0B6E66] uppercase">{eyebrow}</p>
        <h2 className="mt-1 text-[1.6rem] font-semibold text-[#111]">{title}</h2>
      </div>
      <div className="flex flex-col items-start gap-2 sm:items-end">
        <p className="max-w-md text-[16px] leading-relaxed text-[#64716D]">{text}</p>
        {action ? <Link href={action.href} className="text-[15px] font-semibold whitespace-nowrap text-[#0B6E66] hover:text-[#085E58]">{action.label}</Link> : null}
      </div>
    </div>
  );
}

function HeroArt() {
  return (
    <div className="relative">
      <div className="relative aspect-[16/11] overflow-hidden rounded-md bg-[#123A35] lg:aspect-[4/4.6]">
        <Image src="/dr-pratap-hero.jpg" alt="Dr. Pratap" fill priority sizes="(min-width: 1024px) 540px, 100vw" className="object-cover object-[center_22%]" />
      </div>
      <div className="relative mt-4 max-w-[260px] border border-[#E4E8E5] border-l-[3px] border-l-[#0B6E66] bg-white px-5 py-4 text-[13px] text-[#64716D] lg:absolute lg:bottom-8 lg:-left-7 lg:mt-0">
        <b className="mb-0.5 block font-display text-[15px] font-semibold text-[#123A35]">Perspective, grounded in evidence</b>
        Original articles on clinical practice, research and education.
      </div>
    </div>
  );
}

function PortraitPanel() {
  return (
    <div className="relative aspect-square overflow-hidden rounded-md bg-[#123A35]" role="img" aria-label="Author portrait placeholder">
      <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden="true">
        <rect width="400" height="400" fill="#123A35" />
        <circle cx="200" cy="150" r="64" fill="#fff" fillOpacity=".12" />
        <path d="M70 400c0-84 58-136 130-136s130 52 130 136z" fill="#fff" fillOpacity=".12" />
        <circle cx="200" cy="200" r="170" fill="none" stroke="#0B6E66" strokeOpacity=".6" />
        <text x="200" y="372" textAnchor="middle" fill="#0B6E66" fontSize="12" letterSpacing="3">AUTHOR PORTRAIT PLACEHOLDER</text>
      </svg>
    </div>
  );
}
