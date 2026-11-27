import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { deliverEmail } from "@/lib/email";
import { appUrl } from "@/lib/utils";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  const db = getDb();
  if (!db || !token) return NextResponse.redirect(appUrl("/en/newsletter?status=invalid"));
  const rows = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.confirmToken, token));
  const subscriber = rows[0];
  if (!subscriber) return NextResponse.redirect(appUrl("/en/newsletter?status=invalid"));
  await db
    .update(newsletterSubscribers)
    .set({ status: "confirmed", confirmedAt: new Date(), confirmToken: null })
    .where(eq(newsletterSubscribers.id, subscriber.id));
  await deliverEmail({
    to: subscriber.email,
    subject: "You are subscribed to Dr. Pratap",
    text: `Your subscription is confirmed.\n\nUnsubscribe: ${appUrl(`/api/newsletter/unsubscribe?token=${subscriber.unsubscribeToken}`)}`,
  });
  return NextResponse.redirect(appUrl(`/${subscriber.locale}/newsletter?status=confirmed`));
}
