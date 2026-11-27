import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSite } from "@/lib/content/queries";

export const dynamic = "force-dynamic";

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const site = await getSite();
  return (
    <div className="mx-auto max-w-xl px-5 py-16">
      <h1 className="font-display text-5xl text-navy">{t("title")}</h1>
      <p className="mt-4 text-muted">{t("text")}</p>
      {site?.contactEmail ? <a className="mt-8 inline-block text-lg text-navy underline" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> : <p className="mt-8 text-muted">{t("empty")}</p>}
    </div>
  );
}
