import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { PwaRegister } from "@/components/pwa-register";
import { SiteFooter, SiteHeader } from "@/components/public/site-chrome";
import { routing } from "@/i18n/routing";
import { getSite, listCategories } from "@/lib/content/queries";

export const revalidate = 60;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const [site, categoryRows] = await Promise.all([getSite(), listCategories(locale)]);
  const categories = categoryRows.map((item) => ({ name: item.name, slug: item.slug }));
  const socials = Array.isArray(site?.socialLinks) ? (site.socialLinks as { label: string; url: string }[]) : [];
  return (
    <NextIntlClientProvider>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)}` }} />
      <PwaRegister />
      <div className="public-site">
      <SiteHeader categories={categories} />
      <main>{children}</main>
      <SiteFooter email={site?.contactEmail || undefined} socials={socials} />
      </div>
    </NextIntlClientProvider>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("homeTitle"), description: t("homeDescription") };
}
