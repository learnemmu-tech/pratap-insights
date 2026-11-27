import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { appUrl } from "@/lib/utils";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  const db = getDb();
  if (!db || !token) return NextResponse.redirect(appUrl("/en/newsletter?status=invalid"));
  const rows = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.unsubscribeToken, token));
  if (!rows[0]) return NextResponse.redirect(appUrl("/en/newsletter?status=invalid"));
  await db
    .update(newsletterSubscribers)
    .set({ status: "unsubscribed", unsubscribedAt: new Date() })
    .where(eq(newsletterSubscribers.id, rows[0].id));
  return NextResponse.redirect(appUrl(`/${rows[0].locale}/newsletter?status=unsubscribed`));
}
