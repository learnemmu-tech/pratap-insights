import { eq, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { mediaAssets } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { inspectImage, storeImage } from "@/lib/storage";
import { writeAudit } from "@/lib/audit";

export async function GET() {
  const session = await requireAdmin();
  const db = getDb();
  if (!session || !db) return Response.json({ error: "forbidden" }, { status: 403 });
  const items = await db.select().from(mediaAssets).where(isNull(mediaAssets.deletedAt));
  return Response.json({ items });
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  const db = getDb();
  if (!session || !db) return Response.json({ error: "forbidden" }, { status: 403 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "invalid" }, { status: 400 });
  const bytes = new Uint8Array(await file.arrayBuffer());
  const inspected = inspectImage(bytes);
  if (!inspected) return Response.json({ error: "unsupported" }, { status: 400 });
  try {
    const stored = await storeImage(bytes, inspected.ext);
    const id = crypto.randomUUID();
    const alt = String(form.get("alt") ?? "").slice(0, 300);
    const caption = String(form.get("caption") ?? "").slice(0, 400);
    await db.insert(mediaAssets).values({
      id,
      url: stored.url,
      storageKey: stored.key,
      alt,
      caption,
      mimeType: inspected.mime,
      sizeBytes: bytes.byteLength,
      createdBy: session.user.id,
    });
    await writeAudit({ actorId: session.user.id, action: "media.upload", entity: "media", entityId: id });
    const rows = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id));
    return Response.json({ item: rows[0] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
