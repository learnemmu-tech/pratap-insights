import { getDb } from "@/db";
import { auditLogs, rateLimits } from "@/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";

export async function writeAudit(input: {
  actorId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const db = getDb();
  if (!db) return;
  await db.insert(auditLogs).values({
    id: crypto.randomUUID(),
    actorId: input.actorId ?? null,
    action: input.action,
    entity: input.entity,
    entityId: input.entityId ?? null,
    metadata: input.metadata ?? {},
  });
}

export async function consumeRateLimit(key: string, limit: number, windowMs: number) {
  const db = getDb();
  if (!db) return false;
  const since = new Date(Date.now() - windowMs);
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(rateLimits)
    .where(and(eq(rateLimits.key, key), gte(rateLimits.createdAt, since)));
  if ((rows[0]?.count ?? 0) >= limit) return false;
  await db.insert(rateLimits).values({ id: crypto.randomUUID(), key });
  return true;
}
