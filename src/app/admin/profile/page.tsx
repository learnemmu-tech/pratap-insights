import { saveDoctorProfile } from "@/lib/actions/admin";
import { getProfileAdmin } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const fields = ["name", "title", "introduction", "biography", "education", "qualifications", "experience", "expertise", "achievements", "researchInterests", "memberships", "contactEmail", "contactPhone"] as const;

export default async function ProfileAdmin({ searchParams }: { searchParams: Promise<{ locale?: string }> }) {
  if (!(await requireAdmin())) redirect("/admin");
  const requested = (await searchParams).locale;
  const locale = requested === "te" || requested === "hi" ? requested : "en";
  const data = await getProfileAdmin();
  const translation = data?.translations.find((item) => item.locale === locale);
  return (
    <div>
      <h1 className="font-display text-4xl text-navy">Doctor profile</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">Leave a field blank until the information is verified. Empty sections stay unpublished.</p>
      <div className="mt-4 flex gap-3 text-sm">{["en", "te", "hi"].map((item) => <a key={item} href={`/admin/profile?locale=${item}`} className={item === locale ? "underline" : ""}>{item}</a>)}</div>
      <form className="mt-6 grid max-w-3xl gap-3" action={async (formData) => {
        "use server";
        const list = (key: string) => String(formData.get(key) ?? "").split("\n").map((line) => line.trim()).filter(Boolean);
        await saveDoctorProfile({
          locale: locale as "en",
          portraitId: String(formData.get("portraitId") || "") || null,
          coverId: String(formData.get("coverId") || "") || null,
          fields: {
            name: formData.get("name"),
            title: formData.get("title"),
            introduction: formData.get("introduction"),
            biography: formData.get("biography"),
            education: list("education"),
            qualifications: list("qualifications"),
            experience: list("experience"),
            expertise: list("expertise"),
            achievements: list("achievements"),
            researchInterests: list("researchInterests"),
            memberships: list("memberships"),
            contactEmail: formData.get("contactEmail"),
            contactPhone: formData.get("contactPhone"),
            socialLinks: String(formData.get("social") ?? "").split("\n").map((line) => {
              const [label, url] = line.split("|");
              return { label: label?.trim(), url: url?.trim() };
            }),
          },
        });
      }}>
        <select name="portraitId" defaultValue={data?.profile?.portraitId ?? ""} className="border border-line px-3 py-2">
          <option value="">No portrait</option>
          {data?.media.map((item) => <option key={item.id} value={item.id}>{item.alt || item.url}</option>)}
        </select>
        <select name="coverId" defaultValue={data?.profile?.coverId ?? ""} className="border border-line px-3 py-2">
          <option value="">No cover</option>
          {data?.media.map((item) => <option key={item.id} value={item.id}>{item.alt || item.url}</option>)}
        </select>
        {fields.map((field) => {
          const value = translation ? translation[field] : "";
          const text = Array.isArray(value) ? value.join("\n") : String(value ?? "");
          const long = ["introduction", "biography", "education", "qualifications", "experience", "expertise", "achievements", "researchInterests", "memberships"].includes(field);
          return long ? <textarea key={field} name={field} defaultValue={text} placeholder={field} rows={4} className="border border-line px-3 py-2" /> : <input key={field} name={field} defaultValue={text} placeholder={field} className="border border-line px-3 py-2" />;
        })}
        <textarea name="social" placeholder="LinkedIn | https://linkedin.com/in/example" rows={3} className="border border-line px-3 py-2" defaultValue={Array.isArray(translation?.socialLinks) ? (translation.socialLinks as { label: string; url: string }[]).map((item) => `${item.label} | ${item.url}`).join("\n") : ""} />
        <button className="w-fit bg-navy px-4 py-2 text-white">Save profile</button>
      </form>
    </div>
  );
}
