import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalBody } from "@/components/public/legal";

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return <LegalBody title={t("footer.terms")} fallback={t("legal.terms")} field="terms" locale={locale} />;
}
