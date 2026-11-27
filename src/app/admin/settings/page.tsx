import { saveSiteSettings } from "@/lib/actions/admin";
import { getSettings } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SettingsAdmin() {
  if (!(await requireAdmin())) redirect("/admin");
  const data = await getSettings();
  const settings = data?.settings;
  const legal = (settings?.legal ?? {}) as Record<string, Record<string, string>>;
  return (
    <div>
      <h1 className="font-display text-4xl text-navy">Settings</h1>
      <form className="mt-6 grid max-w-3xl gap-3" action={async (formData) => {
        "use server";
        const current = await getSettings();
        const nextLegal: Record<string, Record<string, string>> = {};
        for (const locale of ["en", "te", "hi"]) {
          nextLegal[locale] = {
            privacy: String(formData.get(`${locale}-privacy`) ?? ""),
            terms: String(formData.get(`${locale}-terms`) ?? ""),
            disclaimer: String(formData.get(`${locale}-disclaimer`) ?? ""),
          };
        }
        await saveSiteSettings({
          ...(current?.settings ?? {}),
          brandName: formData.get("brandName"),
          descriptor: formData.get("descriptor"),
          contactEmail: formData.get("contactEmail"),
          legal: nextLegal,
          seo: { title: String(formData.get("seoTitle") ?? ""), description: String(formData.get("seoDescription") ?? "") },
        });
      }}>
        <input name="brandName" defaultValue={settings?.brandName ?? "Dr. Pratap"} className="border border-line px-3 py-2" />
        <input name="descriptor" defaultValue={settings?.descriptor ?? ""} className="border border-line px-3 py-2" />
        <input name="contactEmail" defaultValue={settings?.contactEmail ?? ""} placeholder="Public contact email" className="border border-line px-3 py-2" />
        <input name="seoTitle" defaultValue={(settings?.seo as { title?: string } | null)?.title ?? ""} placeholder="Default SEO title" className="border border-line px-3 py-2" />
        <textarea name="seoDescription" defaultValue={(settings?.seo as { description?: string } | null)?.description ?? ""} placeholder="Default SEO description" className="border border-line px-3 py-2" />
        {["en", "te", "hi"].map((locale) => (
          <fieldset key={locale} className="grid gap-2 border border-line p-3">
            <legend>{locale} legal text</legend>
            <textarea name={`${locale}-disclaimer`} defaultValue={legal[locale]?.disclaimer ?? ""} placeholder="Disclaimer" rows={4} className="border border-line px-3 py-2" />
            <textarea name={`${locale}-privacy`} defaultValue={legal[locale]?.privacy ?? ""} placeholder="Privacy" rows={4} className="border border-line px-3 py-2" />
            <textarea name={`${locale}-terms`} defaultValue={legal[locale]?.terms ?? ""} placeholder="Terms" rows={4} className="border border-line px-3 py-2" />
          </fieldset>
        ))}
        <button className="w-fit bg-navy px-4 py-2 text-white">Save settings</button>
      </form>
      <section className="mt-8 max-w-3xl text-sm text-muted">
        <p>Supported languages are English, Telugu and Hindi. English remains the default.</p>
        <p className="mt-2">Authentication is Clerk with email and password. Email delivery uses Resend when RESEND_API_KEY and EMAIL_FROM are set.</p>
      </section>
    </div>
  );
}
