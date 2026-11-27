import { and, eq } from "drizzle-orm";
import { createHash } from "crypto";
import { getDb } from "@/db";
import { articleViewEvents } from "@/db/schema";
import { isEngagedRead, isLikelyBot } from "@/lib/analytics/bots";
import { consumeRateLimit } from "@/lib/audit";

export async function POST(request: Request) {
  const db = getDb();
  if (!db) return Response.json({ ok: false }, { status: 503 });
  const userAgent = request.headers.get("user-agent");
  if (isLikelyBot(userAgent)) return Response.json({ ok: true, ignored: true });
  const body = (await request.json().catch(() => null)) as {
    articleId?: string;
    visitorId?: string;
    durationSeconds?: number;
    scrollDepth?: number;
  } | null;
  if (!body?.articleId || !body.visitorId || body.visitorId.length < 8 || body.visitorId.length > 80) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }
  const allowed = await consumeRateLimit(`view:${body.visitorId}:${body.articleId}`, 12, 60 * 60 * 1000);
  if (!allowed) return Response.json({ ok: true, limited: true });
  const visitorHash = createHash("sha256").update(body.visitorId).digest("hex");
  const viewDay = new Date().toISOString().slice(0, 10);
  const engaged = isEngagedRead(body);
  const existing = await db
    .select()
    .from(articleViewEvents)
    .where(
      and(
        eq(articleViewEvents.articleId, body.articleId),
        eq(articleViewEvents.visitorHash, visitorHash),
        eq(articleViewEvents.viewDay, viewDay),
      ),
    );
  if (existing[0]) {
    if (engaged && !existing[0].engaged) {
      await db.update(articleViewEvents).set({ engaged: true }).where(eq(articleViewEvents.id, existing[0].id));
    }
  } else {
    await db.insert(articleViewEvents).values({
      id: crypto.randomUUID(),
      articleId: body.articleId,
      visitorHash,
      viewDay,
      engaged,
      referrer: request.headers.get("referer")?.slice(0, 300) ?? null,
    });
  }
  return Response.json({ ok: true });
}
