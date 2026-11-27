"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { subscribeNewsletter } from "@/lib/actions/public";

export function NewsletterForm({ locale, compact = false, appearance = "default" }: { locale: string; compact?: boolean; appearance?: "default" | "inverse" | "panel" }) {
  const t = useTranslations("newsletter");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <form
      className={appearance === "panel" ? "space-y-3" : compact ? "space-y-3" : "space-y-4"}
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setPending(true);
        const result = await subscribeNewsletter({
          email: String(form.get("email") ?? ""),
          consent: form.get("consent") === "on" ? true : (false as unknown as true),
          locale,
        });
        setPending(false);
        if ("ok" in result) setMessage(t("success"));
        else if (result.error === "exists") setMessage(t("exists"));
        else if (result.error === "rate") setMessage(t("rate"));
        else setMessage(t("error"));
      }}
    >
      <label className={appearance === "inverse" || appearance === "panel" ? "sr-only" : "block text-sm"} htmlFor={`email-${compact ? "c" : "f"}`}>
        {t("email")}
      </label>
      <div className={appearance === "panel" ? "space-y-3" : "flex flex-col gap-3 sm:flex-row"}>
        <input id={`email-${compact ? "c" : "f"}`} name="email" type="email" required placeholder="Your email address" className={appearance === "inverse" ? "w-full min-w-0 flex-1 rounded-md border border-white/40 bg-white px-4 py-3.5 text-[#26332F]" : appearance === "panel" ? "h-11 w-full rounded-md border border-[#E4E8E5] px-3 text-sm" : "w-full border border-line bg-white px-3 py-3"} />
        <button disabled={pending} className={appearance === "panel" ? "h-11 w-full rounded-md bg-[#0B6E66] text-sm font-semibold text-white hover:bg-[#085E58] disabled:opacity-60" : "h-11 shrink-0 rounded-md bg-[#0B6E66] px-5 text-sm font-semibold text-white hover:bg-[#085E58] disabled:opacity-60"}>
          {t("subscribe")}
        </button>
      </div>
      <label className={`flex items-start gap-2 text-sm ${appearance === "inverse" ? "text-[#E7F0EE]" : "text-muted"}`}>
        <input name="consent" type="checkbox" required className="mt-1 accent-[#0B6E66]" />
        <span>{t("consent")}</span>
      </label>
      {message ? <p role="status" className="text-sm text-navy">{message}</p> : null}
    </form>
  );
}
