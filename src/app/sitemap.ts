import type { MetadataRoute } from "next";
import { locales } from "@/i18n/routing";
import { listPublicArticles } from "@/lib/content/queries";
import { appUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["", "/about", "/publications", "/categories", "/newsletter", "/contact", "/privacy", "/terms", "/disclaimer"];
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const path of staticPaths) {
      entries.push({ url: appUrl(`/${locale}${path}`), changeFrequency: "weekly" });
    }
    const { items } = await listPublicArticles(locale, { pageSize: 500 });
    for (const article of items) {
      entries.push({
        url: appUrl(`/${locale}/publications/${article.slug}`),
        lastModified: article.updatedAt,
        changeFrequency: "weekly",
      });
    }
  }
  return entries;
}
