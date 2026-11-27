"use client";

import { UserProfile } from "@clerk/nextjs";
import { useTranslations } from "next-intl";

export function ProfileSettings() {
  const t = useTranslations("profile");
  return (
    <div>
      <h2 className="mb-4 font-display text-2xl text-navy">{t("settings")}</h2>
      <UserProfile routing="hash" />
    </div>
  );
}
