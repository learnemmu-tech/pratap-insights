import Link from "next/link";
import { ContentWorkspace } from "@/components/admin/content-workspace";
import { DatabaseUnavailable } from "@/components/admin/database-unavailable";
import { listAdminArticles, listAdminCategories, listMedia } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PublicationsAdmin() {
  if (!(await requireAdmin())) redirect("/admin");
  let articles: Awaited<ReturnType<typeof listAdminArticles>> = null;
  let categoryRows: Awaited<ReturnType<typeof listAdminCategories>> = [];
  let media: Awaited<ReturnType<typeof listMedia>> = [];
  try {
    [articles, categoryRows, media] = await Promise.all([listAdminArticles(), listAdminCategories(), listMedia()]);
  } catch {
    articles = null;
  }
  if (!articles) {
    return (
      <div>
        <p className="text-xs font-semibold tracking-[0.14em] text-[#c8912a]">ADMIN</p>
        <h1 className="mt-1 font-display text-3xl text-[#1c2b3a]">Content Management</h1>
        <div className="mt-6"><DatabaseUnavailable /></div>
        <Link href="/admin/publications" className="mt-4 inline-flex h-10 items-center rounded-[6px] border border-[#e2d9cc] bg-white px-4 text-sm font-semibold text-[#1c2b3a]">Retry</Link>
      </div>
    );
  }
  return (
    <ContentWorkspace
      articles={articles.flatMap((item) => {
        const english = item.translations.find((translation) => translation.locale === "en");
        if (item.article.deletedAt) return [];
        if (!english?.title.trim() && english?.slug.startsWith("draft-")) return [];
        const status = item.article.deletedAt ? "Archived" : english?.status === "published" ? "Published" : "Draft";
        return [{
          id: item.article.id,
          title: english?.title.trim() || "Untitled",
          category: item.category,
          languages: status,
          status,
          updated: item.article.updatedAt?.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) ?? "—",
          deleted: Boolean(item.article.deletedAt),
          coverUrl: media.find((asset) => asset.id === item.article.featuredImageId)?.url ?? null,
          previews: english?.slug && english.status === "published" ? [{ locale: "en", slug: english.slug }] : [],
        }];
      })}
      categories={categoryRows.flatMap((category) => {
        const name = category.translations.find((item) => item.locale === "en")?.name;
        return name ? [{ id: category.id, name }] : [];
      })}
      categoryRows={categoryRows.map((category) => {
        const english = category.translations.find((item) => item.locale === "en");
        return {
          id: category.id,
          sortOrder: category.sortOrder,
          active: category.active,
          name: english?.name ?? "",
          description: english?.description ?? "",
          articleCount: (articles ?? []).filter((item) => item.article.categoryId === category.id && !item.article.deletedAt).length,
        };
      }).filter((category) => category.name)}
      media={media.map((item) => ({ id: item.id, url: item.url, alt: item.alt, caption: item.caption ?? "" }))}
    />
  );
}
