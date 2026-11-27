import { and, eq, lte } from "drizzle-orm";
import { getDb } from "@/db";
import { articleTranslations } from "@/db/schema";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const db = getDb();
  if (!db) return Response.json({ error: "unavailable" }, { status: 503 });
  const due = await db
    .select()
    .from(articleTranslations)
    .where(and(eq(articleTranslations.status, "scheduled"), lte(articleTranslations.publishedAt, new Date())));
  for (const row of due) {
    await db.update(articleTranslations).set({ status: "published" }).where(eq(articleTranslations.id, row.id));
  }
  return Response.json({ promoted: due.length });
}
