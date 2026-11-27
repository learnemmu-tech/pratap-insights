import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { PublicArticle } from "@/lib/content/queries";

export function ArchiveCard({ article, date }: { article: PublicArticle; date: string }) {
  return (
    <article className="flex h-full flex-col">
      <Link href={`/publications/${article.slug}`} className="flex h-full flex-col rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B6E66]">
        <span className="relative block aspect-[16/10] overflow-hidden rounded-lg bg-[#F3F3F3]">
          {article.imageUrl ? (
            <Image src={article.imageUrl} alt={article.imageAlt || ""} fill sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
          ) : null}
        </span>
        <span className="flex flex-1 flex-col pt-3">
          {article.categoryName ? <span className="text-[13px] font-semibold text-[#0B6E66]">{article.categoryName}</span> : null}
          <span className="mt-1 line-clamp-3 text-[1.05rem] leading-snug font-semibold text-[#111]">{article.title}</span>
          <span className="mt-2 text-[13px] text-[#6B7280]">{date}</span>
        </span>
      </Link>
    </article>
  );
}
