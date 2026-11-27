const MAX_BYTES = 5 * 1024 * 1024;

const SIGNATURES: { mime: string; ext: string; check: (bytes: Uint8Array) => boolean }[] = [
  { mime: "image/jpeg", ext: "jpg", check: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: "image/png", ext: "png", check: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { mime: "image/webp", ext: "webp", check: (b) => b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50 },
  { mime: "image/gif", ext: "gif", check: (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 },
];

export function inspectImage(bytes: Uint8Array) {
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES) return null;
  return SIGNATURES.find((signature) => signature.check(bytes)) ?? null;
}

export async function storeImage(bytes: Uint8Array, ext: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "media";
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Supabase Storage is not configured.");
  }
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const key = `images/${new Date().getUTCFullYear()}/${crypto.randomUUID()}.${ext}`;
  const mime = SIGNATURES.find((item) => item.ext === ext)?.mime ?? "application/octet-stream";
  const { error } = await supabase.storage.from(bucket).upload(key, bytes, {
    contentType: mime,
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(bucket).getPublicUrl(key);
  return { key, url: data.publicUrl };
}

export async function deleteStoredImage(key: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "media";
  if (!supabaseUrl || !serviceKey) throw new Error("Supabase Storage is not configured.");
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { error } = await supabase.storage.from(bucket).remove([key]);
  if (error) throw new Error(error.message);
}
