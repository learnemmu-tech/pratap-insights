"use client"

import { BarChart3, FileText, HeartPulse, LayoutDashboard } from "lucide-react"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"

const groups = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
      { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
      { title: "Content Management", url: "/admin/publications", icon: FileText },
    ],
  },
]

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email: string; avatar: string }
}) {
  return (
    <Sidebar collapsible="icon" className="border-[#e2d9cc] bg-[#f6f1e7]" {...props}>
      <SidebarHeader className="border-b border-[#e2d9cc] px-3 py-3">
        <div className="flex items-center gap-2">
          <HeartPulse className="size-7 shrink-0 text-[#c0623a]" strokeWidth={1.75} aria-hidden />
          <div className="grid min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold text-[#1c2b3a]">Pratap Insights</p>
            <p className="truncate text-xs text-[#4a5568]">Admin Workspace</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="overflow-x-hidden overflow-y-auto [scrollbar-color:#e2d9cc_transparent] [scrollbar-width:thin]">
        <NavMain groups={groups} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
