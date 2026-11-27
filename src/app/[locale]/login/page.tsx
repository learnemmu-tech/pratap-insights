import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { SignedInRedirect } from "@/components/public/signed-in-redirect";

function destination(locale: string, redirectUrl: string | undefined) {
  const fallback = `/${locale}/profile`;
  if (!redirectUrl) return fallback;
  try {
    const url = new URL(redirectUrl);
    if (url.origin !== (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000") && url.hostname !== "localhost") return fallback;
    return `${url.pathname}${url.search}`;
  } catch {
    return redirectUrl.startsWith("/") ? redirectUrl : fallback;
  }
}

export default async function LoginPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ redirect_url?: string }> }) {
  const { locale } = await params;
  const { redirect_url: redirectUrl } = await searchParams;
  setRequestLocale(locale);
  const next = destination(locale, redirectUrl);
  const { userId } = await auth();
  if (userId) redirect(next);
  const t = await getTranslations("auth");
  const ready = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <SignedInRedirect href={next} />
      <h1 className="font-display text-5xl text-navy">{t("login")}</h1>
      {ready ? (
        <div className="mt-8">
          <SignIn routing="hash" signUpUrl={`/${locale}/register`} forceRedirectUrl={next} />
        </div>
      ) : (
        <p className="mt-6 text-muted">{t("unconfigured")}</p>
      )}
    </div>
  );
}
