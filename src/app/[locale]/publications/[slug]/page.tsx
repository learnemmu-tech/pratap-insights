import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/public/article-body";
import { ArchiveCard } from "@/components/public/archive-card";
import { ArticleShareTools } from "@/components/public/article-share";
import { ReadingTracker } from "@/components/public/reading-tracker";
import { Link } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";
import { sanitizeContent, nodeText, type TipTapNode } from "@/lib/content/sanitize";
import { getAdjacentArticles, getArticleAlternates, getArticleBySlug, getRelatedArticles, listArticleReferences } from "@/lib/content/queries";
import { appUrl, formatDate } from "@/lib/utils";

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

function listItems(content: unknown) {
  const found: string[] = [];
  const walk = (node: TipTapNode) => {
    if (node.type === "bulletList") node.content?.forEach((item) => found.push(nodeText(item).trim()));
    else node.content?.forEach(walk);
  };
  const doc = sanitizeContent(content);
  walk(doc);
  const bullets = found.filter(Boolean);
  if (bullets.length) return bullets.slice(0, 4);
  const paragraphs = (doc.content ?? []).filter((node) => node.type === "paragraph").map((node) => nodeText(node).trim()).filter((text) => text.length > 40);
  return paragraphs.slice(0, 3);
}

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticleBySlug(locale as Locale, slug);
  if (!article) return { title: "Publication" };
  const alternates = await getArticleAlternates(article.id);
  const languages: Record<string, string> = {};
  for (const item of alternates) languages[item.locale] = appUrl(`/${item.locale}/publications/${item.slug}`);
  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
    alternates: { canonical: appUrl(`/${locale}/publications/${slug}`), languages },
    openGraph: {
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.excerpt,
      images: article.imageUrl ? [article.imageUrl] : undefined,
      type: "article",
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const article = await getArticleBySlug(locale as Locale, slug);
  if (!article) notFound();
  const [alternates, adjacent, related, references] = await Promise.all([
    getArticleAlternates(article.id),
    getAdjacentArticles(locale as Locale, article.publishedAt),
    getRelatedArticles(locale as Locale, article),
    listArticleReferences(article.id),
  ]);
  const available = new Map(alternates.map((item) => [item.locale, item.slug]));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    inLanguage: locale,
    author: { "@type": "Person", name: article.authorName },
    description: article.excerpt,
  };
  const points = listItems(article.content);
  return (
    <article className="article-detail bg-white text-[#171717]">
      <ReadingTracker articleId={article.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-[1080px] px-5 pt-6 pb-16 sm:px-8">
        <p className="text-[14px] text-[#5F6764]">
          <Link href="/publications" className="font-semibold text-[#0B6E66] hover:text-[#085E58]">← Back to Publications</Link>
          <span aria-hidden="true"> / </span>
          <Link href="/" className="hover:text-[#0B6E66]">Home</Link>
          {article.categoryName && article.categorySlug ? <> <span aria-hidden="true">/</span> <Link href={`/categories/${article.categorySlug}`} className="hover:text-[#0B6E66]">{article.categoryName}</Link></> : null}
        </p>
        {article.categoryName ? <p className="mt-6 text-[13px] font-semibold text-[#0B6E66]">{article.categoryName}</p> : <div className="mt-6" />}
        <h1 className="mt-1 max-w-[22ch] text-[1.75rem] leading-[1.2] font-bold tracking-[-0.03em] text-[#111] sm:max-w-none sm:text-[2rem]">{article.title}</h1>
        {article.excerpt ? <p className="mt-3 max-w-[68ch] text-[17px] leading-relaxed text-[#3A3A3A]">{article.excerpt}</p> : null}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[14px] text-[#5F6764]">{article.authorName} · {formatDate(article.publishedAt, locale)} · {article.readingMinutes} min read</p>
          <ArticleShareTools title={article.title} />
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          {locales.map((item) => available.has(item) ? (
            <Link key={item} href={`/publications/${available.get(item)}`} locale={item} className={item === locale ? "font-semibold text-[#111]" : "text-[#0B6E66] underline"}>{item === "en" ? "English" : item === "te" ? "తెలుగు" : "हिन्दी"}</Link>
          ) : null)}
        </div>
        {article.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <span className="relative mt-5 block aspect-[16/9] w-full overflow-hidden rounded-lg">
            <Image src={article.imageUrl} alt={article.imageAlt || ""} fill priority sizes="(min-width: 1080px) 1080px, 100vw" className="object-cover" />
          </span>
        ) : null}
        {article.youtubeId ? (
          <div className="mt-4 aspect-video overflow-hidden rounded-lg bg-black">
            <iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${article.youtubeId}`} title={article.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </div>
        ) : null}
        {points.length ? (
          <section className="mt-6 rounded-lg bg-[#F7F7F7] px-4 py-4">
            <h2 className="text-[1.05rem] font-semibold text-[#111]">Key points</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-[#242424]">{points.map((point) => <li key={point}>{point}</li>)}</ul>
          </section>
        ) : null}
        <div className="mt-6"><ArticleBody content={article.content} /></div>
        {references.length ? (
          <section className="mt-8 border-t border-[#E7E7E7] pt-5">
            <h2 className="text-[1.25rem] font-semibold text-[#111]">References</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-[14px] leading-relaxed text-[#3A3A3A]">
              {references.map((item) => (
                <li key={item.id} className="break-words">{[item.author, item.title, item.publishedOn].filter(Boolean).join(". ")}{item.sourceUrl ? <> <a href={item.sourceUrl} className="break-all text-[#0B6E66] underline hover:text-[#085E58]">{linkLabel(item.sourceUrl)}</a></> : null}</li>
              ))}
            </ol>
          </section>
        ) : null}
        <nav className="mt-8 grid gap-4 border-t border-[#E7E7E7] pt-5 sm:grid-cols-2">
          {adjacent.previous ? <Link href={`/publications/${adjacent.previous.slug}`}><span className="text-[13px] text-[#5F6764]">Previous</span><span className="mt-1 block text-[15px] font-semibold text-[#111]">{adjacent.previous.title}</span></Link> : <span />}
          {adjacent.next ? <Link href={`/publications/${adjacent.next.slug}`} className="sm:text-right"><span className="text-[13px] text-[#5F6764]">Next</span><span className="mt-1 block text-[15px] font-semibold text-[#111]">{adjacent.next.title}</span></Link> : null}
        </nav>
        {related.length ? (
          <section className="mt-10">
            <h2 className="text-[1.35rem] font-semibold text-[#111]">{t("article.related")}</h2>
            <div className="mt-4 grid items-stretch gap-5 sm:grid-cols-2">
              {related.map((item) => (
                <ArchiveCard key={item.id} article={item} date={formatDate(item.publishedAt, locale)} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </article>
  );
}
