"use client";

import { Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "@/i18n/client-navigation";
import type { Locale } from "@/i18n/routing";
import { searchPublished } from "@/lib/actions/search";

type Result = { slug: string; title: string; excerpt: string; categoryName: string | null };

export function SearchModalButton({ label }: { label: string }) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = buttonRef.current;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const items = [...dialogRef.current.querySelectorAll<HTMLElement>("button, a, input")].filter((item) => !item.hasAttribute("disabled"));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const term = query.trim();
    if (!term) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }
    const handle = window.setTimeout(() => {
      setLoading(true);
      void searchPublished(locale, term)
        .then((response) => {
          setResults(response.items);
          setError(response.error);
        })
        .catch(() => setError("unavailable"))
        .finally(() => setLoading(false));
    }, 250);
    return () => window.clearTimeout(handle);
  }, [locale, open, query]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#123A35] transition-colors hover:bg-[#F2F5F2]"
        onClick={() => setOpen(true)}
      >
        <Search size={18} strokeWidth={1.75} />
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-[#123A35]/45 px-4 pt-[12vh]" onMouseDown={() => setOpen(false)}>
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="site-search-title"
            className="w-full max-w-xl rounded-[18px] border border-[#e2d9cc] bg-white p-5 shadow-[0_24px_60px_rgba(23,44,67,0.18)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="site-search-title" className="font-display text-2xl font-semibold text-[#123A35]">Search Pratap Insights</h2>
                <p className="mt-1 text-sm text-[#4a5568]">Discover medical articles and professional insights.</p>
              </div>
              <button type="button" aria-label={t("nav.close")} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#4a5568] hover:bg-[#F2F5F2]" onClick={() => setOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <label className="mt-5 flex h-12 items-center gap-2 rounded-[10px] border border-[#E4E8E5] px-3 focus-within:border-[#0B6E66]">
              <Search size={16} className="text-[#0B6E66]" />
              <span className="sr-only">{t("search.prompt")}</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-full w-full bg-transparent text-[#123A35] outline-none"
                placeholder={t("search.prompt")}
              />
            </label>
            <div className="mt-4 max-h-72 overflow-y-auto" aria-live="polite">
              {loading ? <p className="px-1 py-3 text-sm text-[#4a5568]">Searching…</p> : null}
              {!loading && error ? <p className="px-1 py-3 text-sm text-[#4a5568]">Search is unavailable right now.</p> : null}
              {!loading && !error && query.trim() && results.length === 0 ? <p className="px-1 py-3 text-sm text-[#4a5568]">{t("search.empty")}</p> : null}
              {!loading && !error ? (
                <ul>
                  {results.map((item) => (
                    <li key={item.slug}>
                      <Link href={`/publications/${item.slug}`} className="block rounded-[10px] px-2 py-2 hover:bg-[#F2F5F2]" onClick={() => setOpen(false)}>
                        <span className="block font-medium text-[#123A35]">{item.title}</span>
                        {item.excerpt ? <span className="mt-1 line-clamp-2 block text-sm text-[#4a5568]">{item.excerpt}</span> : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>,
        document.body,
      )
        : null}
    </>
  );
}
