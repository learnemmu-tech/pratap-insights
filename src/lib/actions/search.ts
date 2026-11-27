"use server";

import type { Locale } from "@/i18n/routing";
import { getDb } from "@/db";
import { searchArticles } from "@/lib/content/queries";

export async function searchPublished(locale: Locale, query: string) {
  const term = query.trim();
  if (!term) return { items: [], error: null as string | null };
  if (!getDb()) return { items: [], error: "unavailable" as string | null };
  const items = await searchArticles(locale, term);
  return {
    items: items.map((item) => ({
      slug: item.slug,
      title: item.title,
      excerpt: item.excerpt,
      categoryName: item.categoryName,
    })),
    error: null as string | null,
  };
}
