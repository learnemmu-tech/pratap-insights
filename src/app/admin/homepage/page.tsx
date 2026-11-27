import { saveSiteSettings } from "@/lib/actions/admin";
import { getSettings } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomepageAdmin() {
  if (!(await requireAdmin())) redirect("/admin");
  const data = await getSettings();
  const homepage = (data?.settings?.homepage ?? {}) as Record<string, { headline?: string; description?: string; newsletterTitle?: string; newsletterText?: string }>;
  return (
    <div>
      <h1 className="font-display text-4xl text-navy">Homepage</h1>
      <form className="mt-6 grid max-w-3xl gap-3" action={async (formData) => {
        "use server";
        const current = await getSettings();
        const nextHome: Record<string, unknown> = {};
        for (const locale of ["en", "te", "hi"]) {
          nextHome[locale] = {
            headline: String(formData.get(`${locale}-headline`) ?? ""),
            description: String(formData.get(`${locale}-description`) ?? ""),
            newsletterTitle: String(formData.get(`${locale}-newsletterTitle`) ?? ""),
            newsletterText: String(formData.get(`${locale}-newsletterText`) ?? ""),
          };
        }
        await saveSiteSettings({
          ...(current?.settings ?? {}),
          featuredArticleId: String(formData.get("featuredArticleId") || "") || null,
          homepage: nextHome,
          socialLinks: String(formData.get("social") ?? "").split("\n").map((line) => {
            const [label, url] = line.split("|");
            return { label: label?.trim(), url: url?.trim() };
          }),
        });
      }}>
        <label className="text-sm">Featured publication
          <select name="featuredArticleId" defaultValue={data?.settings?.featuredArticleId ?? ""} className="mt-1 w-full border border-line px-3 py-2">
            <option value="">None</option>
            {data?.articles.filter((item) => !item.article.deletedAt).map((item) => (
              <option key={item.article.id} value={item.article.id}>{item.translations.find((translation) => translation.locale === "en")?.title || item.article.id}</option>
            ))}
          </select>
        </label>
        {["en", "te", "hi"].map((locale) => (
          <fieldset key={locale} className="grid gap-2 border border-line p-3">
            <legend className="px-1 text-sm">{locale}</legend>
            <input name={`${locale}-headline`} defaultValue={homepage[locale]?.headline ?? ""} placeholder="Headline" className="border border-line px-3 py-2" />
            <textarea name={`${locale}-description`} defaultValue={homepage[locale]?.description ?? ""} placeholder="Introduction" className="border border-line px-3 py-2" />
            <input name={`${locale}-newsletterTitle`} defaultValue={homepage[locale]?.newsletterTitle ?? ""} placeholder="Newsletter heading" className="border border-line px-3 py-2" />
            <input name={`${locale}-newsletterText`} defaultValue={homepage[locale]?.newsletterText ?? ""} placeholder="Newsletter text" className="border border-line px-3 py-2" />
          </fieldset>
        ))}
        <textarea name="social" placeholder="LinkedIn | https://www.linkedin.com" className="border border-line px-3 py-2" rows={3} defaultValue={Array.isArray(data?.settings?.socialLinks) ? (data.settings.socialLinks as { label: string; url: string }[]).map((item) => `${item.label} | ${item.url}`).join("\n") : ""} />
        <button className="w-fit bg-navy px-4 py-2 text-white">Save homepage</button>
      </form>
    </div>
  );
}
