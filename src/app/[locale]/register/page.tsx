import { SignUp } from "@clerk/nextjs";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");
  const ready = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="font-display text-5xl text-navy">{t("register")}</h1>
      {ready ? (
        <div className="mt-8">
          <SignUp routing="hash" signInUrl={`/${locale}/login`} forceRedirectUrl={`/${locale}/profile`} />
        </div>
      ) : (
        <p className="mt-6 text-muted">{t("unconfigured")}</p>
      )}
    </div>
  );
}
