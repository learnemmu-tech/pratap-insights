import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { PublicArticle } from "@/lib/content/queries";
import { formatDate } from "@/lib/utils";

export async function ArticleCard({ article, locale, prominent = false }: { article: PublicArticle; locale: string; prominent?: boolean }) {
  const t = await getTranslations();
  return (
    <article className={`group grid gap-4 ${prominent ? "md:grid-cols-12 md:gap-10" : ""}`}>
      <Link href={`/publications/${article.slug}`} className={prominent ? "md:col-span-7" : "block"}>
        <div className={`overflow-hidden bg-[#F2F5F2] ${prominent ? "aspect-[16/10]" : "aspect-[3/2]"}`}>
          {article.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={article.imageUrl} alt={article.imageAlt || ""} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
          ) : (
            <div className="flex h-full items-end p-4 font-display text-2xl text-navy/70">{article.categoryName}</div>
          )}
        </div>
      </Link>
      <div className={prominent ? "md:col-span-5 md:py-2" : ""}>
        <p className="text-xs uppercase tracking-[0.18em] text-[#0B6E66]">{article.categoryName}</p>
        <h3 className={`mt-2 font-display text-navy ${prominent ? "text-4xl leading-tight" : "text-2xl"}`}>
          <Link href={`/publications/${article.slug}`}>{article.title}</Link>
        </h3>
        {article.excerpt ? <p className="locale-copy mt-3 text-muted">{article.excerpt}</p> : null}
        <p className="mt-4 text-sm text-muted">
          {formatDate(article.publishedAt, locale)} · {t("article.reading", { minutes: article.readingMinutes })}
          {article.views > 0 ? ` · ${t("article.views", { count: article.views })}` : ""}
        </p>
      </div>
    </article>
  );
}
