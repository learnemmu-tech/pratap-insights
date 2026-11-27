import { listAdminArticles } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LanguagesAdmin() {
  if (!(await requireAdmin())) redirect("/admin");
  const articles = (await listAdminArticles()) ?? [];
  const counts = { en: 0, te: 0, hi: 0 };
  for (const article of articles) {
    for (const translation of article.translations) {
      if (translation.status === "published" && translation.locale in counts) counts[translation.locale as "en"] += 1;
    }
  }
  return (
    <div>
      <h1 className="font-display text-4xl text-navy">Languages</h1>
      <p className="mt-3 max-w-2xl text-muted">Each translation is drafted and published on its own. Publishing English does not publish Telugu or Hindi.</p>
      <ul className="mt-6 space-y-2">
        <li>English · {counts.en} published translations · default</li>
        <li>Telugu · {counts.te} published translations</li>
        <li>Hindi · {counts.hi} published translations</li>
      </ul>
    </div>
  );
}
