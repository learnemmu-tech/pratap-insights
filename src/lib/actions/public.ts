"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { articleReactions, bookmarks, comments, newsletterSubscribers, user } from "@/db/schema";
import { consumeRateLimit, writeAudit } from "@/lib/audit";
import { deliverEmail } from "@/lib/email";
import { getSession } from "@/lib/session";
import { appUrl } from "@/lib/utils";

async function verifiedReader() {
  const session = await getSession();
  if (!session?.user) return { error: "auth" as const };
  if (!session.user.emailVerified) return { error: "verify" as const };
  if (session.user.banned) return { error: "restricted" as const };
  return { user: session.user };
}

export async function toggleReaction(articleId: string, type: "clap" | "like", locale: string, slug: string) {
  const reader = await verifiedReader();
  if ("error" in reader) return reader;
  const db = getDb();
  if (!db) return { error: "unavailable" as const };
  const existing = await db
    .select()
    .from(articleReactions)
    .where(
      and(
        eq(articleReactions.articleId, articleId),
        eq(articleReactions.userId, reader.user.id),
        eq(articleReactions.type, type),
      ),
    );
  if (existing[0]) {
    await db.delete(articleReactions).where(eq(articleReactions.id, existing[0].id));
  } else {
    await db.insert(articleReactions).values({
      id: crypto.randomUUID(),
      articleId,
      userId: reader.user.id,
      type,
    });
  }
  revalidatePath(`/${locale}/publications/${slug}`);
  return { ok: true };
}

export async function toggleBookmark(articleId: string, locale: string, slug: string) {
  const reader = await verifiedReader();
  if ("error" in reader) return reader;
  const db = getDb();
  if (!db) return { error: "unavailable" as const };
  const existing = await db
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.articleId, articleId), eq(bookmarks.userId, reader.user.id)));
  if (existing[0]) await db.delete(bookmarks).where(eq(bookmarks.id, existing[0].id));
  else {
    await db.insert(bookmarks).values({ id: crypto.randomUUID(), articleId, userId: reader.user.id });
  }
  revalidatePath(`/${locale}/publications/${slug}`);
  revalidatePath(`/${locale}/profile/bookmarks`);
  return { ok: true };
}

const commentSchema = z.object({
  articleId: z.string().min(1),
  body: z.string().trim().min(2).max(2000),
  parentId: z.string().optional(),
  locale: z.string(),
  slug: z.string(),
});

export async function submitComment(input: z.infer<typeof commentSchema>) {
  const parsed = commentSchema.safeParse(input);
  if (!parsed.success) return { error: "invalid" as const };
  const reader = await verifiedReader();
  if ("error" in reader) return reader;
  const db = getDb();
  if (!db) return { error: "unavailable" as const };
  const allowed = await consumeRateLimit(`comment:${reader.user.id}`, 5, 10 * 60 * 1000);
  if (!allowed) return { error: "rate" as const };
  await db.insert(comments).values({
    id: crypto.randomUUID(),
    articleId: parsed.data.articleId,
    userId: reader.user.id,
    parentId: parsed.data.parentId || null,
    body: parsed.data.body,
    status: "pending",
  });
  revalidatePath(`/${parsed.data.locale}/publications/${parsed.data.slug}`);
  return { ok: true, pending: true };
}

export async function reportComment(commentId: string) {
  const reader = await verifiedReader();
  if ("error" in reader) return reader;
  const db = getDb();
  if (!db) return { error: "unavailable" as const };
  await db.update(comments).set({ reported: true, status: "reported" }).where(eq(comments.id, commentId));
  return { ok: true };
}

const subscribeSchema = z.object({
  email: z.string().email(),
  consent: z.literal(true),
  locale: z.string(),
});

export async function subscribeNewsletter(input: z.infer<typeof subscribeSchema>) {
  const parsed = subscribeSchema.safeParse(input);
  if (!parsed.success) return { error: "invalid" as const };
  const db = getDb();
  if (!db) return { error: "unavailable" as const };
  const allowed = await consumeRateLimit(`news:${parsed.data.email.toLowerCase()}`, 3, 60 * 60 * 1000);
  if (!allowed) return { error: "rate" as const };
  const email = parsed.data.email.toLowerCase();
  const existing = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, email));
  const confirmToken = crypto.randomUUID();
  const unsubscribeToken = existing[0]?.unsubscribeToken ?? crypto.randomUUID();
  if (existing[0]?.status === "confirmed") return { error: "exists" as const };
  if (existing[0]) {
    await db
      .update(newsletterSubscribers)
      .set({ status: "pending", confirmToken, locale: parsed.data.locale, consentAt: new Date(), unsubscribedAt: null })
      .where(eq(newsletterSubscribers.id, existing[0].id));
  } else {
    await db.insert(newsletterSubscribers).values({
      id: crypto.randomUUID(),
      email,
      status: "pending",
      locale: parsed.data.locale,
      consentAt: new Date(),
      confirmToken,
      unsubscribeToken,
    });
  }
  const link = appUrl(`/api/newsletter/confirm?token=${confirmToken}`);
  const delivery = await deliverEmail({
    to: email,
    subject: "Confirm your subscription to Dr. Pratap",
    text: `Confirm that you want to receive publication notices.\n\n${link}\n\nYou can unsubscribe at any time.`,
  });
  return { ok: true, delivered: delivery.delivered, queued: delivery.queued };
}

export async function updateReaderProfile(input: { name: string }) {
  const reader = await verifiedReader();
  if ("error" in reader) return reader;
  const name = input.name.trim();
  if (name.length < 2 || name.length > 80) return { error: "invalid" as const };
  const db = getDb();
  if (!db) return { error: "unavailable" as const };
  await db.update(user).set({ name, updatedAt: new Date() }).where(eq(user.id, reader.user.id));
  await writeAudit({ actorId: reader.user.id, action: "profile.update", entity: "user", entityId: reader.user.id });
  return { ok: true };
}
