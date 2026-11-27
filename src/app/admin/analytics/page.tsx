import { Archive, CheckCircle2, Eye, FilePenLine, FileText, FolderTree, Star } from "lucide-react";
import { AnalyticsHeader } from "@/components/admin/analytics-header";
import { ArticleLists, InsightCards, StatCards } from "@/components/admin/publishing-cards";
import { PublishingCharts } from "@/components/admin/publishing-charts";
import { DatabaseUnavailable } from "@/components/admin/database-unavailable";
import { publishingDashboard } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AnalyticsAdmin() {
  if (!(await requireAdmin())) redirect("/admin");
  const data = await publishingDashboard();
  if (!data) {
    return (
      <div className="mx-auto w-full max-w-[80rem] px-4 py-8 sm:px-6 md:px-8">
        <AnalyticsHeader />
        <div className="mt-4"><DatabaseUnavailable /></div>
      </div>
    );
  }
  return (
    <div className="mx-auto flex w-full max-w-[80rem] flex-col gap-4 px-4 py-8 sm:gap-6 sm:px-6 md:px-8">
      <AnalyticsHeader />
      <StatCards items={[
        { label: "Total articles", value: data.total, icon: FileText },
        { label: "Published articles", value: data.published, icon: CheckCircle2 },
        { label: "Draft articles", value: data.drafts, icon: FilePenLine },
        { label: "Archived articles", value: data.archived, icon: Archive },
        { label: "Total categories", value: data.categories, icon: FolderTree },
        { label: "Featured articles", value: data.featured, icon: Star },
        { label: "Article views", value: data.views, icon: Eye },
      ]} />
      <InsightCards data={data} />
      <PublishingCharts monthly={data.monthly} growth={data.growth} />
      <ArticleLists recent={data.recent} updated={data.updated} />
    </div>
  );
}
