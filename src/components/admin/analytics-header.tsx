"use client";

import { BarChart3, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function AnalyticsHeader() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <section className="relative overflow-hidden rounded-[16px] border border-[#e2d9cc]/50 bg-white p-6 shadow-sm sm:px-8">
      <span className="absolute inset-x-0 top-0 h-1 bg-[#c0623a]" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#c0623a]/10 text-[#c0623a]">
            <BarChart3 className="h-6 w-6" />
          </span>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#c0623a]">Admin analytics</p>
            <h1 className="mt-1 font-display text-xl font-bold text-[#1c2b3a] sm:text-2xl">Publication insights</h1>
            <p className="mt-1 text-sm text-[#4a5568]">Pratap Insights · content performance</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-[6px] border border-[#e2d9cc] bg-white px-3 text-sm font-medium text-[#1c2b3a]" onClick={() => startTransition(() => router.refresh())}>
            <Loader2 className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Link href="/admin" className="inline-flex h-10 items-center rounded-[6px] bg-[#c0623a] px-3 text-sm font-medium text-white hover:bg-[#a8512f]">Dashboard</Link>
        </div>
      </div>
      {pending ? <p className="mt-4 text-xs text-[#4a5568]">Syncing publication analytics…</p> : null}
    </section>
  );
}
