import type { LucideIcon } from "lucide-react";
import type { PublishingDashboard, PublishingRow } from "@/lib/admin/queries";

const card = "relative overflow-hidden rounded-[16px] border border-[#e2d9cc]/50 bg-white shadow-sm";

export function GradientCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`${card} ${className}`}>
      <span className="absolute inset-x-0 top-0 h-1 bg-[#c0623a]" />
      {children}
    </section>
  );
}

export function DashboardHeader() {
  return (
    <GradientCard>
      <div className="px-5 py-5 sm:px-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#c0623a]">Overview</p>
        <h1 className="mt-2 font-display text-[22px] font-bold leading-tight text-[#1c2b3a] sm:text-[30px]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#4a5568]">Pratap Insights · publishing overview</p>
      </div>
    </GradientCard>
  );
}

export function WelcomeCard({ name }: { name: string }) {
  return (
    <section className="rounded-[16px] border border-[#e2d9cc]/50 bg-gradient-to-br from-[#f5e8e2] to-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#c0623a]/10 text-[#c0623a]">
          <SparklesIcon />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold text-[#1c2b3a]">Welcome, {name}</h2>
          <p className="mt-1 text-sm text-[#4a5568]">Manage medical articles, professional insights, and publication content from one place.</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Info label="Publication" value="Pratap Insights" />
        <Info label="Focus" value="Medical Knowledge & Professional Insights" />
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-[#e2d9cc]/50 bg-white px-4 py-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#4a5568]">{label}</p>
      <p className="mt-1 text-sm font-medium text-[#1c2b3a]">{value}</p>
    </div>
  );
}

export function StatCards({ items }: { items: { label: string; value: number; icon: LucideIcon }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
      {items.map((item) => (
        <article key={item.label} className={card}>
          <span className="absolute inset-x-0 top-0 h-1 bg-[#c0623a]" />
          <div className="flex items-center justify-between p-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#4a5568]">{item.label}</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#c0623a]/10 text-[#c0623a]">
              <item.icon className="h-4 w-4" />
            </span>
          </div>
          <p className="px-4 pb-4 text-2xl font-bold text-[#1c2b3a] sm:text-[30px]">{item.value}</p>
        </article>
      ))}
    </div>
  );
}

export function ArticleLists({ recent, updated }: { recent: PublishingRow[]; updated: PublishingRow[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ArticleList title="Recent articles" description="Recently created articles in your publication." rows={recent} />
      <ArticleList title="Recently updated articles" description="Latest changes to your medical publications." rows={updated} />
    </div>
  );
}

function ArticleList({ title, description, rows }: { title: string; description: string; rows: PublishingRow[] }) {
  return (
    <GradientCard>
      <header className="px-5 pb-3 pt-5">
        <h2 className="font-display text-base text-[#1c2b3a]">{title}</h2>
        <p className="mt-1 text-xs text-[#4a5568]">{description}</p>
      </header>
      <div className="space-y-2 px-5 pb-5">
        {rows.length === 0 ? <Empty message="No articles available yet." /> : rows.map((row) => (
          <div key={`${title}-${row.id}`} className="rounded-[12px] border border-[#e2d9cc]/50 bg-[#eef1f5] px-4 py-3">
            <p className="text-sm font-medium text-[#1c2b3a]">{row.title}</p>
            <p className="mt-1 text-xs text-[#4a5568]">{row.category ?? "No category"} · {row.status} · {row.updated}</p>
          </div>
        ))}
      </div>
    </GradientCard>
  );
}

export function Empty({ message }: { message: string }) {
  return <p className="rounded-[12px] border border-dashed border-[#e2d9cc] px-4 py-6 text-center text-sm text-[#4a5568]">{message}</p>;
}

function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3zM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z" />
    </svg>
  );
}

export function InsightCards({ data }: { data: PublishingDashboard }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Insight title="Most viewed article" description="Based on actual article views." metric="Views" value={data.mostViewed ? String(data.mostViewed.views) : null} item={data.mostViewed?.title ?? null} empty="No article views recorded yet." />
      <Insight title="Most published category" description="Based on published articles by category." metric="Published articles" value={data.topCategory ? String(data.topCategory.published) : null} item={data.topCategory?.name ?? null} empty="No published category data yet." />
      <Insight title="Latest published article" description="Your most recently published medical insight." metric="Published" value={data.latestPublished?.published ?? null} item={data.latestPublished ? `${data.latestPublished.title}${data.latestPublished.category ? ` · ${data.latestPublished.category}` : ""}` : null} empty="No published articles yet." />
    </div>
  );
}

function Insight({ title, description, metric, value, item, empty }: { title: string; description: string; metric: string; value: string | null; item: string | null; empty: string }) {
  return (
    <section className="relative overflow-hidden rounded-[16px] border border-[#e2d9cc]/50 bg-white shadow-sm">
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#c0623a]/20 via-[#c0623a]/50 to-[#c0623a]/20" />
      <header className="flex items-start gap-3 px-5 pb-3 pt-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#c0623a]/10 text-[#c0623a]">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="8" /></svg>
        </span>
        <div>
          <h2 className="font-display text-base text-[#1c2b3a]">{title}</h2>
          <p className="mt-1 text-xs text-[#4a5568]">{description}</p>
        </div>
      </header>
      <div className="px-5 pb-5">
        {item && value ? (
          <>
            <p className="text-lg font-semibold text-[#1c2b3a]">{item}</p>
            <p className="mt-1 text-sm text-[#4a5568]">{metric} <span className="font-medium text-[#1c2b3a]">{value}</span></p>
          </>
        ) : <Empty message={empty} />}
      </div>
    </section>
  );
}
