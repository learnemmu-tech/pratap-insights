import { and, desc, eq, gte, isNull, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  articleReferences,
  articleReactions,
  articleTranslations,
  articleViewEvents,
  articles,
  auditLogs,
  categories,
  categoryTranslations,
  comments,
  doctorProfileTranslations,
  doctorProfiles,
  mediaAssets,
  newsletterCampaigns,
  newsletterSubscribers,
  siteSettings,
  tags,
  articleTags,
  user,
} from "@/db/schema";

export async function adminOverview() {
  const db = getDb();
  if (!db) return null;
  try {
  const published = await db.select({ count: sql<number>`count(*)::int` }).from(articleTranslations).where(eq(articleTranslations.status, "published"));
  const drafts = await db.select({ count: sql<number>`count(*)::int` }).from(articleTranslations).where(eq(articleTranslations.status, "draft"));
  const views = await db.select({ count: sql<number>`count(*)::int` }).from(articleViewEvents);
  const readers = await db.select({ count: sql<number>`count(distinct ${articleViewEvents.visitorHash})::int` }).from(articleViewEvents);
  const claps = await db.select({ count: sql<number>`count(*)::int` }).from(articleReactions).where(eq(articleReactions.type, "clap"));
  const likes = await db.select({ count: sql<number>`count(*)::int` }).from(articleReactions).where(eq(articleReactions.type, "like"));
  const pending = await db.select({ count: sql<number>`count(*)::int` }).from(comments).where(and(eq(comments.status, "pending"), isNull(comments.deletedAt)));
  const subscribers = await db.select({ count: sql<number>`count(*)::int` }).from(newsletterSubscribers).where(eq(newsletterSubscribers.status, "confirmed"));
  const publicationCount = await db.select({ count: sql<number>`count(*)::int` }).from(articles).where(isNull(articles.deletedAt));
  const readerAccounts = await db.select({ count: sql<number>`count(*)::int` }).from(user);
  const recentPublications = await db
    .select({ title: articleTranslations.title, updatedAt: articles.updatedAt, id: articles.id })
    .from(articles)
    .innerJoin(articleTranslations, eq(articleTranslations.articleId, articles.id))
    .where(and(isNull(articles.deletedAt), eq(articleTranslations.locale, "en")))
    .orderBy(desc(articles.updatedAt))
    .limit(5);
  const pendingComments = await db
    .select({ id: comments.id, body: comments.body, createdAt: comments.createdAt })
    .from(comments)
    .where(and(eq(comments.status, "pending"), isNull(comments.deletedAt)))
    .orderBy(desc(comments.createdAt))
    .limit(5);
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const series = await db
    .select({
      day: articleViewEvents.viewDay,
      views: sql<number>`count(*)::int`,
      engaged: sql<number>`count(*) filter (where ${articleViewEvents.engaged})::int`,
    })
    .from(articleViewEvents)
    .where(gte(articleViewEvents.createdAt, since))
    .groupBy(articleViewEvents.viewDay)
    .orderBy(articleViewEvents.viewDay);
  return {
    published: published[0]?.count ?? 0,
    drafts: drafts[0]?.count ?? 0,
    views: views[0]?.count ?? 0,
    readers: readers[0]?.count ?? 0,
    claps: claps[0]?.count ?? 0,
    likes: likes[0]?.count ?? 0,
    pending: pending[0]?.count ?? 0,
    subscribers: subscribers[0]?.count ?? 0,
    publications: publicationCount[0]?.count ?? 0,
    readerAccounts: readerAccounts[0]?.count ?? 0,
    recentPublications,
    pendingComments,
    series,
  };
  } catch {
    return null;
  }
}

export async function listAdminArticles() {
  const db = getDb();
  if (!db) return null;
  try {
    const rows = await db
      .select({ article: articles, translation: articleTranslations, category: categoryTranslations.name })
      .from(articles)
      .leftJoin(articleTranslations, eq(articleTranslations.articleId, articles.id))
      .leftJoin(categoryTranslations, and(eq(categoryTranslations.categoryId, articles.categoryId), eq(categoryTranslations.locale, "en")))
      .orderBy(desc(articles.updatedAt));
    const grouped = new Map<string, { article: typeof articles.$inferSelect; category: string | null; translations: (typeof articleTranslations.$inferSelect)[] }>();
    for (const row of rows) {
      const current = grouped.get(row.article.id) ?? { article: row.article, category: row.category, translations: [] };
      if (row.translation) current.translations.push(row.translation);
      grouped.set(row.article.id, current);
    }
    return [...grouped.values()];
  } catch {
    return null;
  }
}

export async function getEditorArticle(id: string) {
  const db = getDb();
  if (!db) return null;
  const articleRows = await db.select().from(articles).where(eq(articles.id, id));
  if (!articleRows[0]) return null;
  const translations = await db.select().from(articleTranslations).where(eq(articleTranslations.articleId, id));
  const tagRows = await db
    .select({ name: tags.name, locale: tags.locale })
    .from(articleTags)
    .innerJoin(tags, eq(tags.id, articleTags.tagId))
    .where(eq(articleTags.articleId, id));
  const categoryRows = await db
    .select({ id: categories.id, name: categoryTranslations.name })
    .from(categories)
    .innerJoin(categoryTranslations, and(eq(categoryTranslations.categoryId, categories.id), eq(categoryTranslations.locale, "en")));
  const media = await db.select().from(mediaAssets).where(isNull(mediaAssets.deletedAt));
  const references = await db.select().from(articleReferences).where(eq(articleReferences.articleId, id)).orderBy(articleReferences.sortOrder);
  return { article: articleRows[0], translations, tags: tagRows, categories: categoryRows, media, references };
}

export async function listAdminCategories() {
  const db = getDb();
  if (!db) return [];
  const rows = await db.select().from(categories).orderBy(categories.sortOrder);
  const translations = await db.select().from(categoryTranslations);
  return rows.map((category) => ({ ...category, translations: translations.filter((item) => item.categoryId === category.id) }));
}

export async function listComments(status?: string) {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select({ comment: comments, author: user.name, email: user.email })
    .from(comments)
    .innerJoin(user, eq(user.id, comments.userId))
    .where(isNull(comments.deletedAt))
    .orderBy(desc(comments.createdAt));
  return status ? rows.filter((row) => row.comment.status === status) : rows;
}

export async function listReaders() {
  const db = getDb();
  if (!db) return [];
  return db.select({ id: user.id, name: user.name, email: user.email, role: user.role, banned: user.banned, createdAt: user.createdAt, emailVerified: user.emailVerified }).from(user).orderBy(desc(user.createdAt));
}

export async function listSubscribers() {
  const db = getDb();
  if (!db) return [];
  return db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.createdAt));
}

export async function listCampaigns() {
  const db = getDb();
  if (!db) return [];
  return db.select().from(newsletterCampaigns).orderBy(desc(newsletterCampaigns.createdAt));
}

export async function analyticsDetail() {
  const db = getDb();
  if (!db) return null;
  const overview = await adminOverview();
  const top = await db
    .select({ articleId: articleViewEvents.articleId, views: sql<number>`count(*)::int`, engaged: sql<number>`count(*) filter (where ${articleViewEvents.engaged})::int` })
    .from(articleViewEvents)
    .groupBy(articleViewEvents.articleId)
    .orderBy(desc(sql`count(*)`))
    .limit(8);
  const titles = await db.select({ articleId: articleTranslations.articleId, title: articleTranslations.title, locale: articleTranslations.locale }).from(articleTranslations);
  const referrers = await db
    .select({ referrer: articleViewEvents.referrer, views: sql<number>`count(*)::int` })
    .from(articleViewEvents)
    .groupBy(articleViewEvents.referrer)
    .orderBy(desc(sql`count(*)`))
    .limit(8);
  return { overview, top, titles, referrers };
}

export async function getProfileAdmin() {
  const db = getDb();
  if (!db) return null;
  const profiles = await db.select().from(doctorProfiles).limit(1);
  const translations = profiles[0]
    ? await db.select().from(doctorProfileTranslations).where(eq(doctorProfileTranslations.profileId, profiles[0].id))
    : [];
  const media = await db.select().from(mediaAssets).where(isNull(mediaAssets.deletedAt));
  return { profile: profiles[0] ?? null, translations, media };
}

export async function getSettings() {
  const db = getDb();
  if (!db) return null;
  const rows = await db.select().from(siteSettings).limit(1);
  const articles = (await listAdminArticles()) ?? [];
  return { settings: rows[0] ?? null, articles };
}

export async function listAudit() {
  const db = getDb();
  if (!db) return [];
  return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100);
}

const realEnglish = and(
  eq(articleTranslations.articleId, articles.id),
  eq(articleTranslations.locale, "en"),
  sql`not (coalesce(${articleTranslations.title}, '') = '' and ${articleTranslations.slug} like 'draft-%')`,
);

export type PublishingRow = {
  id: string;
  title: string;
  category: string | null;
  status: "Draft" | "Published" | "Archived";
  updated: string;
};

export type PublishingDashboard = {
  total: number;
  published: number;
  drafts: number;
  archived: number;
  categories: number;
  featured: number;
  views: number;
  recent: PublishingRow[];
  updated: PublishingRow[];
  monthly: { label: string; count: number }[];
  growth: { label: string; total: number }[];
  mostViewed: { title: string; views: number } | null;
  topCategory: { name: string; published: number } | null;
  latestPublished: { title: string; published: string; category: string | null } | null;
};

export async function publishingDashboard(): Promise<PublishingDashboard | null> {
  const db = getDb();
  if (!db) return null;
  try {
    const rows = await db
      .select({
        id: articles.id,
        title: articleTranslations.title,
        status: articleTranslations.status,
        publishedAt: articleTranslations.publishedAt,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
        deletedAt: articles.deletedAt,
        featured: articles.featured,
        category: categoryTranslations.name,
      })
      .from(articles)
      .innerJoin(articleTranslations, realEnglish)
      .leftJoin(categoryTranslations, and(eq(categoryTranslations.categoryId, articles.categoryId), eq(categoryTranslations.locale, "en")));
    const active = rows.filter((row) => !row.deletedAt);
    const published = active.filter((row) => row.status === "published");
    const drafts = active.filter((row) => row.status === "draft");
    const featured = published.filter((row) => row.featured);
    const archived = rows.filter((row) => row.deletedAt);
    const categoryCount = await db.select({ count: sql<number>`count(*)::int` }).from(categories).where(eq(categories.active, true));
    const viewCount = await db.select({ count: sql<number>`count(*)::int` }).from(articleViewEvents);
    const viewed = await db
      .select({ title: articleTranslations.title, views: sql<number>`count(*)::int` })
      .from(articleViewEvents)
      .innerJoin(articles, and(eq(articles.id, articleViewEvents.articleId), isNull(articles.deletedAt)))
      .innerJoin(articleTranslations, and(realEnglish, eq(articleTranslations.status, "published")))
      .groupBy(articles.id, articleTranslations.title)
      .orderBy(desc(sql`count(*)`))
      .limit(1);
    const categoryRanks = new Map<string, number>();
    for (const row of published) {
      if (!row.category) continue;
      categoryRanks.set(row.category, (categoryRanks.get(row.category) ?? 0) + 1);
    }
    const topCategory = [...categoryRanks.entries()].sort((a, b) => b[1] - a[1])[0];
    const latest = [...published].sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0))[0];
    const months = lastMonths(12);
    const monthly = months.map((month) => ({
      label: monthLabel(month),
      count: published.filter((row) => sameMonth(row.publishedAt, month)).length,
    }));
    const growth = months.map((month) => ({
      label: monthLabel(month),
      total: active.filter((row) => row.createdAt && row.createdAt < nextMonth(month)).length,
    }));
    const toRow = (row: (typeof rows)[number]): PublishingRow => ({
      id: row.id,
      title: row.title,
      category: row.category,
      status: row.deletedAt ? "Archived" : row.status === "published" ? "Published" : "Draft",
      updated: row.updatedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    });
    return {
      total: active.length,
      published: published.length,
      drafts: drafts.length,
      archived: archived.length,
      categories: categoryCount[0]?.count ?? 0,
      featured: featured.length,
      views: viewCount[0]?.count ?? 0,
      recent: [...active].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5).map(toRow),
      updated: [...active].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 5).map(toRow),
      monthly: monthly.some((item) => item.count > 0) ? monthly : [],
      growth: active.length ? growth : [],
      mostViewed: viewed[0]?.title ? { title: viewed[0].title, views: viewed[0].views } : null,
      topCategory: topCategory ? { name: topCategory[0], published: topCategory[1] } : null,
      latestPublished: latest ? {
        title: latest.title,
        published: (latest.publishedAt ?? latest.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        category: latest.category,
      } : null,
    };
  } catch {
    return null;
  }
}

function lastMonths(count: number) {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => new Date(now.getFullYear(), now.getMonth() - (count - 1 - index), 1));
}

function nextMonth(month: Date) {
  return new Date(month.getFullYear(), month.getMonth() + 1, 1);
}

function sameMonth(value: Date | null, month: Date) {
  return Boolean(value && value.getFullYear() === month.getFullYear() && value.getMonth() === month.getMonth());
}

function monthLabel(month: Date) {
  return month.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

export async function listMedia() {
  const db = getDb();
  if (!db) return [];
  return db.select().from(mediaAssets).where(isNull(mediaAssets.deletedAt)).orderBy(desc(mediaAssets.createdAt));
}
