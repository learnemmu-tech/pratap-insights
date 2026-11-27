import { deleteMedia, updateMediaMeta } from "@/lib/actions/admin";
import { listMedia } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/session";
import { redirect } from "next/navigation";
import { MediaUpload } from "@/components/admin/media-upload";

export const dynamic = "force-dynamic";

export default async function MediaAdmin() {
  if (!(await requireAdmin())) redirect("/admin");
  const items = await listMedia();
  return (
    <div>
      <h1 className="font-display text-4xl text-navy">Media library</h1>
      <p className="mt-2 text-sm text-muted">JPEG, PNG, WebP and GIF up to 5 MB. Files are checked by content, not only by extension.</p>
      <MediaUpload />
      {items.length === 0 ? <p className="mt-8 text-muted">No images uploaded.</p> : (
        <ul className="mt-8 grid gap-6 md:grid-cols-2">
          {items.map((item) => (
            <li key={item.id} className="border border-line bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.alt} className="aspect-video w-full object-cover" />
              <form className="mt-3 grid gap-2" action={async (formData) => { "use server"; await updateMediaMeta(item.id, String(formData.get("alt") ?? ""), String(formData.get("caption") ?? "")); }}>
                <input name="alt" defaultValue={item.alt} placeholder="Alt text" className="border border-line px-2 py-2" />
                <input name="caption" defaultValue={item.caption} placeholder="Caption" className="border border-line px-2 py-2" />
                <button className="w-fit border border-navy px-3 py-1 text-sm">Save text</button>
              </form>
              <p className="mt-2 break-all text-xs text-muted">{item.url}</p>
              <form action={async () => { "use server"; await deleteMedia(item.id); }}><button className="mt-2 text-sm underline">Delete if unused</button></form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
