import { CheckCircle2, Eye, FilePenLine, FileText, FolderTree, Star } from "lucide-react";
import { ArticleLists, DashboardHeader, StatCards, WelcomeCard } from "@/components/admin/publishing-cards";
import { DatabaseUnavailable } from "@/components/admin/database-unavailable";
import { publishingDashboard } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const session = await requireAdmin();
  if (!session) redirect("/en/login");
  const data = await publishingDashboard();
  const firstName = session.user.name?.trim().split(/\s+/)[0] || "there";
  if (!data) {
    return (
      <div className="mx-auto w-full max-w-[80rem] px-4 py-8 sm:px-6 md:px-8">
        <DashboardHeader />
        <div className="mt-4"><DatabaseUnavailable /></div>
      </div>
    );
  }
  return (
    <div className="mx-auto flex w-full max-w-[80rem] flex-col gap-4 px-4 py-8 sm:gap-6 sm:px-6 md:px-8">
      <DashboardHeader />
      <WelcomeCard name={firstName} />
      <StatCards items={[
        { label: "Total articles", value: data.total, icon: FileText },
        { label: "Published articles", value: data.published, icon: CheckCircle2 },
        { label: "Draft articles", value: data.drafts, icon: FilePenLine },
        { label: "Categories", value: data.categories, icon: FolderTree },
        { label: "Featured articles", value: data.featured, icon: Star },
        { label: "Article views", value: data.views, icon: Eye },
      ]} />
      <ArticleLists recent={data.recent} updated={data.updated} />
    </div>
  );
}
