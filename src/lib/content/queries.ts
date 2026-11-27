import { and, asc, desc, eq, ilike, inArray, isNull, lte, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  articleReferences,
  articleReactions,
  articleTranslations,
  articleViewEvents,
  articles,
  bookmarks,
  categories,
  categoryTranslations,
  comments,
  doctorProfileTranslations,
  doctorProfiles,
  mediaAssets,
  siteSettings,
  user,
} from "@/db/schema";
import { isPubliclyVisible } from "@/lib/articles/visibility";
import { readingTimeMinutes } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";

export type PublicArticle = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  content: unknown;
  seoTitle: string;
  seoDescription: string;
  publishedAt: Date | null;
  updatedAt: Date;
  featured: boolean;
  categoryName: string | null;
  categorySlug: string | null;
  imageUrl: string | null;
  imageAlt: string;
  authorName: string;
  youtubeId: string | null;
  readingMinutes: number;
  views: number;
  locale: string;
};

function mapArticle(row: {
  article: typeof articles.$inferSelect;
  translation: typeof articleTranslations.$inferSelect;
  categoryName: string | null;
  categorySlug: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  authorName: string | null;
  views: number;
}): PublicArticle | null {
  if (
    !isPubliclyVisible({
      status: row.translation.status as "published",
      publishedAt: row.translation.publishedAt,
    })
  ) {
    return null;
  }
  return {
    id: row.article.id,
    slug: row.translation.slug,
    title: row.translation.title,
    subtitle: row.translation.subtitle,
    excerpt: row.translation.excerpt,
    content: row.translation.content,
    seoTitle: row.translation.seoTitle,
    seoDescription: row.translation.seoDescription,
    publishedAt: row.translation.publishedAt,
    updatedAt: row.translation.updatedAt,
    featured: row.article.featured,
    categoryName: row.categoryName,
    categorySlug: row.categorySlug,
    imageUrl: row.imageUrl,
    imageAlt: row.imageAlt ?? "",
    authorName: row.article.displayAuthor || row.authorName || "Dr. Pratap",
    youtubeId: row.article.youtubeId,
    readingMinutes: readingTimeMinutes(row.translation.content),
    views: row.views,
    locale: row.translation.locale,
  };
}

const articleSelect = {
  article: articles,
  translation: articleTranslations,
  categoryName: categoryTranslations.name,
  categorySlug: categoryTranslations.slug,
  imageUrl: mediaAssets.url,
  imageAlt: mediaAssets.alt,
  authorName: user.name,
  views: sql<number>`(
    select count(*)::int from ${articleViewEvents}
    where ${articleViewEvents.articleId} = ${articles.id}
  )`,
};

function publicArticleWhere(locale: string, options?: { categorySlug?: string; query?: string; articleIds?: string[] }) {
  const filters = [
    isNull(articles.deletedAt),
    eq(articleTranslations.locale, locale),
    inArray(articleTranslations.status, ["published", "scheduled"]),
    lte(articleTranslations.publishedAt, new Date()),
  ];
  if (options?.categorySlug) filters.push(eq(categoryTranslations.slug, options.categorySlug));
  if (options?.articleIds) filters.push(inArray(articles.id, options.articleIds.length ? options.articleIds : ["00000000-0000-0000-0000-000000000000"]));
  const term = options?.query?.trim();
  if (term) {
    const pattern = `%${term.replace(/[%_]/g, "")}%`;
    const match = or(
      ilike(articleTranslations.title, pattern),
      ilike(articleTranslations.excerpt, pattern),
      ilike(articleTranslations.subtitle, pattern),
      ilike(categoryTranslations.name, pattern),
    );
    if (match) filters.push(match);
  }
  return and(...filters);
}

export async function listPublicArticles(
  locale: Locale,
  options?: {
    categorySlug?: string;
    query?: string;
    articleIds?: string[];
    sort?: "latest" | "oldest" | "views";
    page?: number;
    pageSize?: number;
  },
) {
  const db = getDb();
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 9;
  if (!db) return { items: [] as PublicArticle[], total: 0, page, pageSize };
  const where = publicArticleWhere(locale, options);
  const order = options?.sort === "oldest" ? asc(articleTranslations.publishedAt) : desc(articleTranslations.publishedAt);
  try {
    const [rows, totals] = await Promise.all([
      db
        .select(articleSelect)
        .from(articles)
        .innerJoin(articleTranslations, and(eq(articleTranslations.articleId, articles.id), eq(articleTranslations.locale, locale)))
        .leftJoin(categoryTranslations, and(eq(categoryTranslations.categoryId, articles.categoryId), eq(categoryTranslations.locale, locale)))
        .leftJoin(mediaAssets, eq(mediaAssets.id, articles.featuredImageId))
        .leftJoin(user, eq(user.id, articles.authorId))
        .where(where)
        .orderBy(order)
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(articles)
        .innerJoin(articleTranslations, and(eq(articleTranslations.articleId, articles.id), eq(articleTranslations.locale, locale)))
        .leftJoin(categoryTranslations, and(eq(categoryTranslations.categoryId, articles.categoryId), eq(categoryTranslations.locale, locale)))
        .where(where),
    ]);
    const items = rows.map(mapArticle).filter((item): item is PublicArticle => Boolean(item));
    return { items, total: totals[0]?.count ?? items.length, page, pageSize };
  } catch {
    return { items: [] as PublicArticle[], total: 0, page, pageSize };
  }
}

export async function getArticleBySlug(locale: Locale, slug: string) {
  const db = getDb();
  if (!db) return null;
  try {
    const rows = await db
      .select(articleSelect)
      .from(articles)
      .innerJoin(articleTranslations, and(eq(articleTranslations.articleId, articles.id), eq(articleTranslations.locale, locale)))
      .leftJoin(categoryTranslations, and(eq(categoryTranslations.categoryId, articles.categoryId), eq(categoryTranslations.locale, locale)))
      .leftJoin(mediaAssets, eq(mediaAssets.id, articles.featuredImageId))
      .leftJoin(user, eq(user.id, articles.authorId))
      .where(and(publicArticleWhere(locale), eq(articleTranslations.slug, slug)))
      .limit(1);
    return rows.map(mapArticle).find((item): item is PublicArticle => Boolean(item)) ?? null;
  } catch {
    return null;
  }
}

export async function getArticleAlternates(articleId: string) {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select({ locale: articleTranslations.locale, slug: articleTranslations.slug, status: articleTranslations.status, publishedAt: articleTranslations.publishedAt })
    .from(articleTranslations)
    .where(eq(articleTranslations.articleId, articleId));
  return rows.filter((row) =>
    isPubliclyVisible({ status: row.status as "published", publishedAt: row.publishedAt }),
  );
}

export async function getAdjacentArticles(locale: Locale, publishedAt: Date | null) {
  if (!publishedAt) return { previous: null, next: null };
  const db = getDb();
  if (!db) return { previous: null, next: null };
  const base = () =>
    db
      .select(articleSelect)
      .from(articles)
      .innerJoin(articleTranslations, and(eq(articleTranslations.articleId, articles.id), eq(articleTranslations.locale, locale)))
      .leftJoin(categoryTranslations, and(eq(categoryTranslations.categoryId, articles.categoryId), eq(categoryTranslations.locale, locale)))
      .leftJoin(mediaAssets, eq(mediaAssets.id, articles.featuredImageId))
      .leftJoin(user, eq(user.id, articles.authorId));
  try {
    const [previousRows, nextRows] = await Promise.all([
      base().where(and(publicArticleWhere(locale), sql`${articleTranslations.publishedAt} > ${publishedAt}`)).orderBy(asc(articleTranslations.publishedAt)).limit(1),
      base().where(and(publicArticleWhere(locale), sql`${articleTranslations.publishedAt} < ${publishedAt}`)).orderBy(desc(articleTranslations.publishedAt)).limit(1),
    ]);
    return {
      previous: previousRows.map(mapArticle).find((item): item is PublicArticle => Boolean(item)) ?? null,
      next: nextRows.map(mapArticle).find((item): item is PublicArticle => Boolean(item)) ?? null,
    };
  } catch {
    return { previous: null, next: null };
  }
}

export async function getRelatedArticles(locale: Locale, article: PublicArticle) {
  const { items } = await listPublicArticles(locale, { categorySlug: article.categorySlug ?? undefined, pageSize: 4 });
  return items.filter((item) => item.id !== article.id).slice(0, 3);
}

export async function listCategories(locale: Locale) {
  const db = getDb();
  if (!db) return [];
  let rows: { id: string; slug: string; name: string; description: string; seoTitle: string; seoDescription: string; sortOrder: number }[] = [];
  try {
    rows = await db
    .select({
      id: categories.id,
      slug: categoryTranslations.slug,
      name: categoryTranslations.name,
      description: categoryTranslations.description,
      seoTitle: categoryTranslations.seoTitle,
      seoDescription: categoryTranslations.seoDescription,
      sortOrder: categories.sortOrder,
    })
    .from(categories)
    .innerJoin(categoryTranslations, eq(categoryTranslations.categoryId, categories.id))
    .where(and(eq(categories.active, true), eq(categoryTranslations.locale, locale)))
    .orderBy(asc(categories.sortOrder));
  } catch {
    return [];
  }
  return rows.map((row) => ({ ...row, count: 0 }));
}

export async function getSite() {
  const db = getDb();
  if (!db) return null;
  try {
    const rows = await db.select().from(siteSettings).limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function getDoctor(locale: Locale) {
  const db = getDb();
  if (!db) return null;
  try {
    const rows = await db
      .select({
        profile: doctorProfiles,
        translation: doctorProfileTranslations,
        portrait: mediaAssets.url,
        portraitAlt: mediaAssets.alt,
      })
      .from(doctorProfiles)
      .leftJoin(doctorProfileTranslations, and(eq(doctorProfileTranslations.profileId, doctorProfiles.id), eq(doctorProfileTranslations.locale, locale)))
      .leftJoin(mediaAssets, eq(mediaAssets.id, doctorProfiles.portraitId))
      .limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function getPublicComments(articleId: string) {
  const db = getDb();
  if (!db) return [];
  return db
    .select({
      id: comments.id,
      body: comments.body,
      parentId: comments.parentId,
      createdAt: comments.createdAt,
      author: user.name,
    })
    .from(comments)
    .innerJoin(user, eq(user.id, comments.userId))
    .where(and(eq(comments.articleId, articleId), eq(comments.status, "approved"), isNull(comments.deletedAt)))
    .orderBy(asc(comments.createdAt));
}

export async function getReactionState(articleId: string, userId?: string) {
  const db = getDb();
  if (!db) return { claps: 0, likes: 0, clapped: false, liked: false, bookmarked: false };
  const rows = await db.select().from(articleReactions).where(eq(articleReactions.articleId, articleId));
  const bookmark = userId
    ? await db
        .select()
        .from(bookmarks)
        .where(and(eq(bookmarks.articleId, articleId), eq(bookmarks.userId, userId)))
    : [];
  return {
    claps: rows.filter((row) => row.type === "clap").length,
    likes: rows.filter((row) => row.type === "like").length,
    clapped: Boolean(userId && rows.some((row) => row.type === "clap" && row.userId === userId)),
    liked: Boolean(userId && rows.some((row) => row.type === "like" && row.userId === userId)),
    bookmarked: bookmark.length > 0,
  };
}

export async function popularArticles(locale: Locale) {
  const { items } = await listPublicArticles(locale, { sort: "views", pageSize: 4 });
  return items.filter((item) => item.views > 0);
}

export async function searchArticles(locale: Locale, query: string) {
  if (!query.trim()) return [];
  const { items } = await listPublicArticles(locale, { query, pageSize: 24 });
  return items;
}

export async function readerBookmarks(userId: string, locale: Locale) {
  const db = getDb();
  if (!db) return [];
  const rows = await db.select().from(bookmarks).where(eq(bookmarks.userId, userId));
  const ids = rows.map((row) => row.articleId);
  if (!ids.length) return [];
  const { items } = await listPublicArticles(locale, { articleIds: ids, pageSize: ids.length });
  return items;
}

export async function listArticleReferences(articleId: string) {
  const db = getDb();
  if (!db) return [];
  return db.select().from(articleReferences).where(eq(articleReferences.articleId, articleId)).orderBy(asc(articleReferences.sortOrder));
}

export async function categoryArticleCount(categoryId: string) {
  const db = getDb();
  if (!db) return 0;
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(articles)
    .where(and(eq(articles.categoryId, categoryId), isNull(articles.deletedAt)));
  return rows[0]?.count ?? 0;
}

export async function publishedArticleIds(ids: string[]) {
  if (!ids.length) return [];
  const db = getDb();
  if (!db) return [];
  return db
    .select({ id: articles.id })
    .from(articles)
    .where(inArray(articles.id, ids));
}

export { desc };
