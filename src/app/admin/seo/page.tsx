import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SeoAdmin() {
  if (!(await requireAdmin())) redirect("/admin");
  return (
    <div>
      <h1 className="font-display text-4xl text-navy">SEO</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">The default title and description are stored with the site settings.</p>
      <Link href="/admin/settings" className="mt-6 inline-block text-sm font-semibold text-[#c0623a]">Open settings</Link>
    </div>
  );
}
