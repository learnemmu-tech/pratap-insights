"use server";

import { and, eq, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import {
  articleReferences,
  articleTags,
  articleTranslations,
  articles,
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
  user,
} from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { sanitizeContent } from "@/lib/content/sanitize";
import { writeAudit } from "@/lib/audit";
import { getEditorArticle } from "@/lib/admin/queries";
import { deliverEmail } from "@/lib/email";
import { deleteStoredImage } from "@/lib/storage";
import { slugify, appUrl } from "@/lib/utils";
import { youtubeIdFromUrl } from "@/lib/youtube";
import { categoryArticleCount } from "@/lib/content/queries";

async function adminDb() {
  const session = await requireAdmin();
  const db = getDb();
  if (!session || !db) return null;
  return { session, db };
}

const translationSchema = z.object({
  articleId: z.string().max(80),
  locale: z.enum(["en", "te", "hi"]),
  title: z.string().max(220),
  subtitle: z.string().max(300),
  excerpt: z.string().max(500),
  content: z.string().max(500000),
  seoTitle: z.string().max(180),
  seoDescription: z.string().max(300),
  slug: z.string().max(120),
  categoryId: z.string().nullable(),
  featured: z.boolean(),
  featuredImageId: z.string().nullable(),
  tags: z.array(z.string().trim().min(1).max(80)).max(12),
  status: z.enum(["draft", "in_review", "scheduled", "published", "archived"]),
  publishedAt: z.string().nullable(),
  displayAuthor: z.string().max(120).optional(),
  youtubeUrl: z.string().max(300).optional(),
  references: z.array(z.object({
    title: z.string().max(240),
    author: z.string().max(180),
    publishedOn: z.string().max(40),
    sourceUrl: z.string().max(400),
    details: z.string().max(500),
  })).max(30).optional(),
});

export async function createArticle() {
  const ctx = await adminDb();
  if (!ctx) return { error: "forbidden" as const };
  return { error: "save-required" as const };
}

export async function loadArticleEditor(id: string) {
  const ctx = await adminDb();
  if (!ctx) return { error: "forbidden" as const };
  const data = await getEditorArticle(id);
  if (!data) return { error: "missing" as const };
  return {
    article: {
      id: data.article.id,
      featured: data.article.featured,
      categoryId: data.article.categoryId,
      featuredImageId: data.article.featuredImageId,
      displayAuthor: data.article.displayAuthor,
      youtubeId: data.article.youtubeId,
    },
    translations: data.translations.map((item) => ({
      locale: item.locale,
      title: item.title,
      subtitle: item.subtitle,
      excerpt: item.excerpt,
      content: item.content,
      seoTitle: item.seoTitle,
      seoDescription: item.seoDescription,
      slug: item.slug,
      status: item.status,
      publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
    })),
    tags: data.tags,
    references: data.references.map((item) => ({
      title: item.title,
      author: item.author,
      publishedOn: item.publishedOn,
      sourceUrl: item.sourceUrl,
      details: item.details,
    })),
  };
}

export async function saveArticle(input: z.infer<typeof translationSchema>) {
  const parsed = translationSchema.safeParse(input);
  if (!parsed.success) return { error: "invalid" as const };
  const ctx = await adminDb();
  if (!ctx) return { error: "forbidden" as const };
  const data = parsed.data;
  if (!data.title.trim() || !data.excerpt.trim() || !data.categoryId) return { error: "incomplete" as const };
  const category = await ctx.db.select({ id: categories.id }).from(categories).where(and(eq(categories.id, data.categoryId), eq(categories.active, true)));
  if (!category[0]) return { error: "category" as const };
  try {
  let parsedContent: unknown;
  try {
    parsedContent = JSON.parse(data.content);
  } catch {
    return { error: "invalid" as const };
  }
  const content = sanitizeContent(parsedContent);
  const publishedAt = data.status === "published" ? (data.publishedAt ? new Date(data.publishedAt) : new Date()) : data.publishedAt ? new Date(data.publishedAt) : null;
  const youtubeId = data.youtubeUrl?.trim() ? youtubeIdFromUrl(data.youtubeUrl) : "";
  if (youtubeId === null) return { error: "youtube" as const };
  const author = await ctx.db.select({ id: user.id }).from(user).where(eq(user.id, ctx.session.user.id));
  let articleId = data.articleId;
  const existingArticle = articleId ? await ctx.db.select().from(articles).where(eq(articles.id, articleId)) : [];
  if (!existingArticle[0]) {
    articleId = crypto.randomUUID();
    await ctx.db.insert(articles).values({
      id: articleId,
      authorId: author[0]?.id ?? null,
      displayAuthor: data.displayAuthor?.trim() || "Dr. Pratap",
    });
  }
  const slug = slugify(data.slug || data.title);
  if (!slug) return { error: "incomplete" as const };
  const conflict = await ctx.db
    .select()
    .from(articleTranslations)
    .where(and(eq(articleTranslations.locale, data.locale), eq(articleTranslations.slug, slug)));
  if (conflict[0] && conflict[0].articleId !== articleId) return { error: "slug" as const };
  const existing = await ctx.db
    .select()
    .from(articleTranslations)
    .where(and(eq(articleTranslations.articleId, articleId), eq(articleTranslations.locale, data.locale)));
  if (existing[0]) {
    await ctx.db
      .update(articleTranslations)
      .set({
        title: data.title.trim(),
        subtitle: data.subtitle,
        excerpt: data.excerpt.trim(),
        content,
        seoTitle: data.seoTitle.trim() || data.title.trim(),
        seoDescription: data.seoDescription.trim() || data.excerpt.trim(),
        slug,
        status: data.status,
        publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(articleTranslations.id, existing[0].id));
  } else {
    await ctx.db.insert(articleTranslations).values({
      id: crypto.randomUUID(),
      articleId,
      locale: data.locale,
      title: data.title.trim(),
      subtitle: data.subtitle,
      excerpt: data.excerpt.trim(),
      content,
      seoTitle: data.seoTitle.trim() || data.title.trim(),
      seoDescription: data.seoDescription.trim() || data.excerpt.trim(),
      slug,
      status: data.status,
      publishedAt,
    });
  }
  await ctx.db
    .update(articles)
    .set({
      categoryId: data.categoryId,
      featured: data.featured,
      featuredImageId: data.featuredImageId,
      displayAuthor: data.displayAuthor?.trim() || "Dr. Pratap",
      youtubeId: youtubeId || null,
      updatedAt: new Date(),
    })
    .where(eq(articles.id, articleId));
  await ctx.db.delete(articleTags).where(eq(articleTags.articleId, articleId));
  for (const name of [...new Set(data.tags.map((tag) => tag.trim()).filter(Boolean))]) {
    const tagSlug = slugify(name);
    const found = await ctx.db
      .select()
      .from(tags)
      .where(and(eq(tags.locale, data.locale), eq(tags.slug, tagSlug)));
    const tagId = found[0]?.id ?? crypto.randomUUID();
    if (!found[0]) await ctx.db.insert(tags).values({ id: tagId, locale: data.locale, name, slug: tagSlug });
    await ctx.db.insert(articleTags).values({ articleId, tagId });
  }
  if (data.references) {
    await ctx.db.delete(articleReferences).where(eq(articleReferences.articleId, articleId));
    for (const [index, reference] of data.references.filter((item) => item.title.trim()).entries()) {
      await ctx.db.insert(articleReferences).values({
        id: crypto.randomUUID(),
        articleId,
        sortOrder: index,
        title: reference.title.trim(),
        author: reference.author,
        publishedOn: reference.publishedOn,
        sourceUrl: reference.sourceUrl,
        details: reference.details,
      });
    }
  }
  await writeAudit({
    actorId: author[0]?.id ?? null,
    action: "article.save",
    entity: "article",
    entityId: articleId,
    metadata: { locale: data.locale, status: data.status },
  });
  const saved = await ctx.db
    .select({ title: articleTranslations.title })
    .from(articleTranslations)
    .where(and(eq(articleTranslations.articleId, articleId), eq(articleTranslations.locale, data.locale)));
  if (!saved[0]?.title.trim()) return { error: "database" as const, message: "The article could not be saved." };
  revalidatePath("/", "layout");
  return { ok: true as const, id: articleId, slug };
  } catch (error) {
    const raw = error instanceof Error ? error.message : "Save failed.";
    const message = /postgres:|password|secret|supabase/i.test(raw) ? "The article could not be saved." : raw.slice(0, 160);
    return { error: "database" as const, message };
  }
}

export async function duplicateArticle(articleId: string) {
  const ctx = await adminDb();
  if (!ctx) return { error: "forbidden" as const };
  const original = await ctx.db.select().from(articles).where(eq(articles.id, articleId));
  if (!original[0]) return { error: "missing" as const };
  const copyId = crypto.randomUUID();
  await ctx.db.insert(articles).values({
    id: copyId,
    authorId: ctx.session.user.id,
    categoryId: original[0].categoryId,
    featuredImageId: original[0].featuredImageId,
    featured: false,
  });
  const translations = await ctx.db.select().from(articleTranslations).where(eq(articleTranslations.articleId, articleId));
  for (const translation of translations) {
    const id = crypto.randomUUID();
    await ctx.db.insert(articleTranslations).values({
      ...translation,
      id,
      articleId: copyId,
      status: "draft",
      publishedAt: null,
      slug: `draft-${id.slice(0, 8)}`,
      title: translation.title ? `${translation.title} (copy)` : "",
    });
  }
  return { id: copyId };
}

export async function softDeleteArticle(articleId: string) {
  const ctx = await adminDb();
  if (!ctx) return { error: "forbidden" as const };
  await ctx.db.update(articles).set({ deletedAt: new Date() }).where(eq(articles.id, articleId));
  await writeAudit({ actorId: ctx.session.user.id, action: "article.delete", entity: "article", entityId: articleId });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function restoreArticle(articleId: string) {
  const ctx = await adminDb();
  if (!ctx) return { error: "forbidden" as const };
  await ctx.db.update(articles).set({ deletedAt: null }).where(eq(articles.id, articleId));
  revalidatePath("/", "layout");
  return { ok: true };
}

const categorySchema = z.object({
  id: z.string().optional(),
  active: z.boolean(),
  sortOrder: z.number().int(),
  translations: z.array(
    z.object({
      locale: z.enum(["en", "te", "hi"]),
      name: z.string().min(1).max(120),
      slug: z.string().max(120),
      description: z.string().max(500),
      seoTitle: z.string().max(180),
      seoDescription: z.string().max(300),
    }),
  ),
});

export async function saveCategory(input: z.infer<typeof categorySchema>) {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { error: "invalid" as const };
  const ctx = await adminDb();
  if (!ctx) return { error: "forbidden" as const };
  const id = parsed.data.id || crypto.randomUUID();
  const english = parsed.data.translations.find((item) => item.locale === "en");
  if (english) {
    const named = await ctx.db
      .select({ categoryId: categoryTranslations.categoryId, name: categoryTranslations.name })
      .from(categoryTranslations)
      .where(eq(categoryTranslations.locale, "en"));
    const duplicate = named.find((item) => item.name.trim().toLowerCase() === english.name.trim().toLowerCase() && item.categoryId !== id);
    if (duplicate) return { error: "duplicate" as const };
  }
  if (parsed.data.id) {
    await ctx.db
      .update(categories)
      .set({ active: parsed.data.active, sortOrder: parsed.data.sortOrder, updatedAt: new Date() })
      .where(eq(categories.id, id));
  } else {
    await ctx.db.insert(categories).values({ id, active: parsed.data.active, sortOrder: parsed.data.sortOrder });
  }
  for (const translation of parsed.data.translations) {
    const slug = slugify(translation.slug || translation.name);
    const existing = await ctx.db
      .select()
      .from(categoryTranslations)
      .where(and(eq(categoryTranslations.categoryId, id), eq(categoryTranslations.locale, translation.locale)));
    if (existing[0]) {
      await ctx.db
        .update(categoryTranslations)
        .set({ ...translation, slug })
        .where(eq(categoryTranslations.id, existing[0].id));
    } else {
      await ctx.db.insert(categoryTranslations).values({ id: crypto.randomUUID(), categoryId: id, ...translation, slug });
    }
  }
  await writeAudit({ actorId: ctx.session.user.id, action: "category.save", entity: "category", entityId: id });
  revalidatePath("/", "layout");
  return { id };
}

export async function deactivateCategory(id: string) {
  const ctx = await adminDb();
  if (!ctx) return { error: "forbidden" as const };
  const count = await categoryArticleCount(id);
  if (count > 0) return { error: "in_use" as const, count };
  await ctx.db.update(categories).set({ active: false }).where(eq(categories.id, id));
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function moderateComment(id: string, status: "approved" | "rejected" | "spam" | "pending") {
  const ctx = await adminDb();
  if (!ctx) return { error: "forbidden" as const };
  await ctx.db.update(comments).set({ status }).where(eq(comments.id, id));
  await writeAudit({ actorId: ctx.session.user.id, action: `comment.${status}`, entity: "comment", entityId: id });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteComment(id: string) {
  const ctx = await adminDb();
  if (!ctx) return { error: "forbidden" as const };
  await ctx.db.update(comments).set({ deletedAt: new Date() }).where(eq(comments.id, id));
  return { ok: true };
}

export async function replyToComment(parentId: string, body: string) {
  const ctx = await adminDb();
  if (!ctx) return { error: "forbidden" as const };
  const parent = await ctx.db.select().from(comments).where(eq(comments.id, parentId));
  if (!parent[0] || body.trim().length < 2) return { error: "invalid" as const };
  await ctx.db.insert(comments).values({
    id: crypto.randomUUID(),
    articleId: parent[0].articleId,
    userId: ctx.session.user.id,
    parentId,
    body: body.trim(),
    status: "approved",
  });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function setReaderRestriction(userId: string, banned: boolean) {
  const ctx = await adminDb();
  if (!ctx) return { error: "forbidden" as const };
  const target = await ctx.db.select().from(user).where(eq(user.id, userId));
  if (!target[0] || target[0].role === "admin") return { error: "invalid" as const };
  await ctx.db.update(user).set({ banned }).where(eq(user.id, userId));
  await writeAudit({ actorId: ctx.session.user.id, action: banned ? "reader.restrict" : "reader.restore", entity: "user", entityId: userId });
  return { ok: true };
}

export async function saveDoctorProfile(input: {
  locale: "en" | "te" | "hi";
  portraitId: string | null;
  coverId: string | null;
  fields: Record<string, unknown>;
}) {
  const ctx = await adminDb();
  if (!ctx) return { error: "forbidden" as const };
  const profiles = await ctx.db.select().from(doctorProfiles).limit(1);
  const profileId = profiles[0]?.id ?? crypto.randomUUID();
  if (!profiles[0]) await ctx.db.insert(doctorProfiles).values({ id: profileId });
  await ctx.db
    .update(doctorProfiles)
    .set({ portraitId: input.portraitId, coverId: input.coverId, updatedAt: new Date() })
    .where(eq(doctorProfiles.id, profileId));
  const existing = await ctx.db
    .select()
    .from(doctorProfileTranslations)
    .where(and(eq(doctorProfileTranslations.profileId, profileId), eq(doctorProfileTranslations.locale, input.locale)));
  const values = {
    name: String(input.fields.name ?? "").slice(0, 120),
    title: String(input.fields.title ?? "").slice(0, 180),
    introduction: String(input.fields.introduction ?? "").slice(0, 800),
    biography: String(input.fields.biography ?? "").slice(0, 8000),
    education: asList(input.fields.education),
    qualifications: asList(input.fields.qualifications),
    experience: asList(input.fields.experience),
    expertise: asList(input.fields.expertise),
    achievements: asList(input.fields.achievements),
    researchInterests: asList(input.fields.researchInterests),
    memberships: asList(input.fields.memberships),
    contactEmail: String(input.fields.contactEmail ?? "").slice(0, 180),
    contactPhone: String(input.fields.contactPhone ?? "").slice(0, 40),
    socialLinks: asLinks(input.fields.socialLinks),
  };
  if (existing[0]) {
    await ctx.db.update(doctorProfileTranslations).set(values).where(eq(doctorProfileTranslations.id, existing[0].id));
  } else {
    await ctx.db.insert(doctorProfileTranslations).values({ id: crypto.randomUUID(), profileId, locale: input.locale, ...values });
  }
  await writeAudit({ actorId: ctx.session.user.id, action: "profile.save", entity: "doctor_profile", entityId: profileId });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function saveSiteSettings(input: Record<string, unknown>) {
  const ctx = await adminDb();
  if (!ctx) return { error: "forbidden" as const };
  const rows = await ctx.db.select().from(siteSettings).limit(1);
  const id = rows[0]?.id ?? "site";
  const values = {
    brandName: String(input.brandName ?? "Dr. Pratap").slice(0, 80),
    descriptor: String(input.descriptor ?? "").slice(0, 120),
    contactEmail: String(input.contactEmail ?? "").slice(0, 180),
    featuredArticleId: input.featuredArticleId ? String(input.featuredArticleId) : null,
    homepage: input.homepage ?? {},
    legal: input.legal ?? {},
    seo: input.seo ?? {},
    socialLinks: asLinks(input.socialLinks),
    updatedAt: new Date(),
  };
  if (rows[0]) await ctx.db.update(siteSettings).set(values).where(eq(siteSettings.id, id));
  else await ctx.db.insert(siteSettings).values({ id, ...values });
  await writeAudit({ actorId: ctx.session.user.id, action: "settings.save", entity: "site", entityId: id });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function saveCampaign(input: { id?: string; subject: string; body: string }) {
  const ctx = await adminDb();
  if (!ctx) return { error: "forbidden" as const };
  if (input.subject.trim().length < 2 || input.body.trim().length < 2) return { error: "invalid" as const };
  const id = input.id || crypto.randomUUID();
  if (input.id) {
    await ctx.db.update(newsletterCampaigns).set({ subject: input.subject, body: input.body }).where(eq(newsletterCampaigns.id, id));
  } else {
    await ctx.db.insert(newsletterCampaigns).values({ id, subject: input.subject, body: input.body });
  }
  return { id };
}

export async function sendCampaign(id: string) {
  const ctx = await adminDb();
  if (!ctx) return { error: "forbidden" as const };
  const campaigns = await ctx.db.select().from(newsletterCampaigns).where(eq(newsletterCampaigns.id, id));
  const campaign = campaigns[0];
  if (!campaign) return { error: "missing" as const };
  const subscribers = await ctx.db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.status, "confirmed"));
  let sent = 0;
  let queued = 0;
  for (const subscriber of subscribers) {
    const result = await deliverEmail({
      to: subscriber.email,
      subject: campaign.subject,
      text: `${campaign.body}\n\nUnsubscribe: ${appUrl(`/api/newsletter/unsubscribe?token=${subscriber.unsubscribeToken}`)}`,
    });
    if (result.delivered) sent += 1;
    else queued += 1;
  }
  await ctx.db.update(newsletterCampaigns).set({ status: sent > 0 ? "sent" : "queued", sentAt: new Date() }).where(eq(newsletterCampaigns.id, id));
  await writeAudit({
    actorId: ctx.session.user.id,
    action: "newsletter.send",
    entity: "campaign",
    entityId: id,
    metadata: { sent, queued },
  });
  return { sent, queued, configured: Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM) };
}

export async function updateMediaMeta(id: string, alt: string, caption: string) {
  const ctx = await adminDb();
  if (!ctx) return { error: "forbidden" as const };
  await ctx.db.update(mediaAssets).set({ alt: alt.slice(0, 300), caption: caption.slice(0, 400) }).where(eq(mediaAssets.id, id));
  return { ok: true };
}

export async function deleteMedia(id: string) {
  const ctx = await adminDb();
  if (!ctx) return { error: "forbidden" as const };
  const used = await ctx.db.select({ count: sql<number>`count(*)::int` }).from(articles).where(and(eq(articles.featuredImageId, id), isNull(articles.deletedAt)));
  if ((used[0]?.count ?? 0) > 0) return { error: "in_use" as const };
  const asset = await ctx.db.select().from(mediaAssets).where(eq(mediaAssets.id, id));
  await ctx.db.update(mediaAssets).set({ deletedAt: new Date() }).where(eq(mediaAssets.id, id));
  if (asset[0]?.storageKey) await deleteStoredImage(asset[0].storageKey);
  return { ok: true };
}

function asList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, 40);
}

function asLinks(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as { label?: string; url?: string };
      if (!record.url || !/^https:\/\//.test(record.url)) return null;
      return { label: String(record.label ?? "Link").slice(0, 40), url: record.url.slice(0, 300) };
    })
    .filter(Boolean)
    .slice(0, 8);
}
