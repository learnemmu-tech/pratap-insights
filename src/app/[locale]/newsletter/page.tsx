import { getTranslations, setRequestLocale } from "next-intl/server";
import { NewsletterForm } from "@/components/public/newsletter-form";

export default async function NewsletterPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ status?: string }> }) {
  const { locale } = await params;
  const { status } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("newsletter");
  return (
    <div className="mx-auto max-w-xl px-5 py-16">
      <h1 className="font-display text-5xl text-navy">{t("title")}</h1>
      <p className="mt-4 text-muted">{t("text")}</p>
      {status && ["confirmed", "unsubscribed", "invalid"].includes(status) ? <p className="mt-6 text-navy">{t(status as "confirmed")}</p> : null}
      <div className="mt-8"><NewsletterForm locale={locale} /></div>
    </div>
  );
}
