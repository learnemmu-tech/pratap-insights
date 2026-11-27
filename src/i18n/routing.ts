import { defineRouting } from "next-intl/routing";

export const locales = ["en", "te", "hi"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale: "en",
  localePrefix: "always",
});

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
