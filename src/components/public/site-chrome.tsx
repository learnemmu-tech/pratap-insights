"use client";

import { useUser } from "@clerk/nextjs";
import { ChevronDown, Globe, HeartPulse, Menu, X } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter as useAppRouter } from "next/navigation";
import { Link, usePathname, useRouter } from "@/i18n/client-navigation";
import { locales, type Locale } from "@/i18n/routing";
import { adminSignInRoute } from "@/lib/actions/admin-access";
import { SearchModalButton } from "@/components/public/search-modal";

const links = [
  ["/", "home"],
  ["/publications", "publications"],
  ["/categories", "categories"],
  ["/about", "about"],
  ["/contact", "contact"],
] as const;

const languageLabel: Record<Locale, string> = { en: "EN", te: "TE", hi: "HI" };

export function SiteHeader({
  categories = [],
}: {
  signedIn?: boolean;
  isAdmin?: boolean;
  categories?: { name: string; slug: string }[];
}) {
  const t = useTranslations();
  const pathname = usePathname();
  const { isSignedIn } = useUser();
  const [open, setOpen] = useState(false);
  const router = useAppRouter();
  const categoryActive = pathname === "/categories" || pathname.startsWith("/categories/");
  const signInRouted = useRef(false);
  useEffect(() => {
    if (!isSignedIn || signInRouted.current || window.sessionStorage.getItem("pi-signin-intent") !== "1") return;
    signInRouted.current = true;
    window.sessionStorage.removeItem("pi-signin-intent");
    void adminSignInRoute().then((href) => {
      if (href && window.location.pathname !== href) router.push(href);
    }).catch(() => undefined);
  }, [isSignedIn, router]);
  return (
    <header className="sticky top-0 z-40 border-b border-[#E4E8E5] bg-white">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-5 sm:px-7">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-[#111] text-white" aria-hidden><HeartPulse className="h-4 w-4" strokeWidth={1.8} /></span>
          <span className="min-w-0">
            <span className="block truncate font-display text-[22px] leading-none font-semibold tracking-[-0.01em] text-[#123A35]">Pratap Insights</span>
            <span className="mt-1 hidden text-[10px] font-medium tracking-[0.14em] text-[#64716D] uppercase sm:block">Medical Knowledge</span>
          </span>
        </Link>
        <nav className="hidden flex-1 items-center justify-center gap-8 lg:flex" aria-label="Primary">
          {links.map(([href, key]) => {
            if (key === "categories" && categories.length > 0) {
              return <CategoryMenu key={href} label="Medical Topics" categories={categories} active={categoryActive} />;
            }
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-0.5 py-1.5 text-[15px] transition-colors ${active ? "font-semibold text-[#0B6E66]" : "font-medium text-[#242424] hover:text-[#0B6E66]"}`}
              >
                {key === "categories" ? "Medical Topics" : t(`nav.${key}`)}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-1 lg:ml-0">
          <LanguageMenu />
          <SearchModalButton label={t("nav.search")} />
          <button
            className="inline-flex h-10 w-10 items-center justify-center text-[#123A35] hover:bg-[#F2F5F2] lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t("nav.close") : t("nav.menu")}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {open ? (
        <nav id="mobile-nav" className="border-t border-[#E4E8E5] bg-white px-5 py-2 lg:hidden" aria-label="Mobile">
          {links.map(([href, key]) => (
            <Link
              key={href}
              href={href}
              className={`block border-b border-[#E4E8E5] px-1 py-3.5 text-[15px] font-medium ${pathname === href || (key === "categories" && categoryActive) ? "text-[#0B6E66]" : "text-[#26332F]"}`}
              onClick={() => setOpen(false)}
            >
              {key === "categories" ? "Medical Topics" : t(`nav.${key}`)}
            </Link>
          ))}
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="block border-b border-[#E4E8E5] px-1 py-3 pl-4 text-sm text-[#64716D]"
              onClick={() => setOpen(false)}
            >
              {category.name}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}

function LanguageMenu() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useDismiss(menuRef, () => setOpen(false));
  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        className="inline-flex h-10 items-center gap-1 px-2 text-sm font-medium text-[#123A35] hover:bg-[#F2F5F2]"
        aria-label="Language"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((value) => !value)}
      >
        <Globe size={15} className="text-[#0B6E66]" />
        {languageLabel[locale as Locale]}
        <ChevronDown size={14} className="text-[#4a5568]" />
      </button>
      {open ? (
        <div role="listbox" className="absolute right-0 z-20 mt-2 w-24 rounded-2xl border border-[#e2d9cc] bg-white py-1 text-sm shadow-[0_12px_32px_rgba(23,44,67,0.08)]">
          {locales.map((item) => (
            <button
              key={item}
              type="button"
              role="option"
              aria-selected={item === locale}
              className={`block w-full px-3 py-2 text-left ${item === locale ? "font-semibold text-[#0B6E66]" : "text-[#123A35] hover:bg-[#F2F5F2]"}`}
              onClick={() => {
                setOpen(false);
                router.replace(pathname, { locale: item });
              }}
            >
              {languageLabel[item]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CategoryMenu({ label, categories, active }: { label: string; categories: { name: string; slug: string }[]; active: boolean }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useDismiss(menuRef, () => setOpen(false));
  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        className={`inline-flex items-center gap-1 px-0.5 py-1.5 text-[15px] transition-colors ${active || open ? "font-semibold text-[#0B6E66]" : "font-medium text-[#242424] hover:text-[#0B6E66]"}`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        {label}
        <ChevronDown size={14} />
      </button>
      {open ? (
        <div role="menu" className="absolute left-0 z-20 mt-2 w-56 rounded-2xl border border-[#e2d9cc] bg-white py-1 text-sm shadow-[0_12px_32px_rgba(23,44,67,0.08)]">
          <Link role="menuitem" href="/categories" className="block px-3 py-2 text-[#123A35] hover:bg-[#F2F5F2]" onClick={() => setOpen(false)}>
            {label}
          </Link>
          {categories.map((category) => (
            <Link key={category.slug} role="menuitem" href={`/categories/${category.slug}`} className="block px-3 py-2 text-[#123A35] hover:bg-[#F2F5F2]" onClick={() => setOpen(false)}>
              {category.name}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function useDismiss(menuRef: RefObject<HTMLDivElement | null>, close: () => void) {
  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) close();
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuRef, close]);
}

export function SiteFooter({ email, socials }: { email?: string; socials: { label: string; url: string }[] }) {
  const t = useTranslations();
  return (
    <footer className="border-t border-[#E7E7E7] bg-white text-[#3A3A3A]">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-16 sm:px-7 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-[#111] text-white" aria-hidden><HeartPulse className="h-4 w-4" strokeWidth={1.8} /></span>
            <span>
              <p className="text-[18px] leading-none font-semibold text-[#111]">Pratap Insights</p>
              <p className="mt-1 text-[10px] tracking-[0.14em] text-[#87918D] uppercase">Medical Knowledge</p>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-6">{t("footer.summary")}</p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.08em] text-[#111] uppercase">Publications</p>
          <div className="mt-4 space-y-2.5 text-sm">
            <Link href="/publications" className="block hover:text-[#0B6E66]">{t("nav.publications")}</Link>
            <Link href="/about" className="block hover:text-[#0B6E66]">{t("nav.about")}</Link>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.08em] text-[#111] uppercase">Topics</p>
          <div className="mt-4 space-y-2.5 text-sm">
            <Link href="/categories" className="block hover:text-[#0B6E66]">Medical Topics</Link>
            <Link href="/newsletter" className="block hover:text-[#0B6E66]">{t("nav.newsletter")}</Link>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.08em] text-[#111] uppercase">Company</p>
          <div className="mt-4 space-y-2.5 text-sm">
            <Link href="/contact" className="block hover:text-[#0B6E66]">{t("nav.contact")}</Link>
            <Link href="/privacy" className="block hover:text-[#0B6E66]">{t("footer.privacy")}</Link>
            <Link href="/terms" className="block hover:text-[#0B6E66]">{t("footer.terms")}</Link>
            <Link href="/disclaimer" className="block hover:text-[#0B6E66]">{t("footer.disclaimer")}</Link>
            {email ? <a href={`mailto:${email}`} className="block hover:text-[#0B6E66]">{email}</a> : null}
            {socials.map((item) => <a key={item.url} href={item.url} className="block hover:text-[#0B6E66]" rel="noreferrer">{item.label}</a>)}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[1200px] border-t border-[#E7E7E7] px-5 py-6 text-[13px] text-[#5F6764] sm:px-7">
        <p className="max-w-3xl">Content published on Pratap Insights is intended for educational and informational purposes only and is not a substitute for professional medical advice, diagnosis or treatment.</p>
        <p className="mt-4">© {new Date().getFullYear()} Pratap Insights. {t("footer.rights")}</p>
      </div>
    </footer>
  );
}
