import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { ProfileSettings } from "@/components/public/profile-settings";
import { getSession } from "@/lib/session";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await getSession();
  if (!session?.user) {
    redirect({ href: "/login", locale });
    return null;
  }
  const reader = session.user;
  const t = await getTranslations();
  return (
    <div className="mx-auto max-w-xl px-5 py-16">
      <h1 className="font-display text-5xl text-navy">{t("profile.title")}</h1>
      <p className="mt-4 text-muted">{reader.email}</p>
      {!reader.emailVerified ? <p className="mt-3 text-sm text-steel">{t("auth.verify")}</p> : null}
      <div className="mt-6"><Link href="/profile/bookmarks" className="underline">{t("profile.bookmarks")}</Link></div>
      <div className="mt-8"><ProfileSettings /></div>
    </div>
  );
}
