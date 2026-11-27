"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useClerk } from "@clerk/nextjs"
import { Bell, LogOut, Settings, UserRound } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

const titles: [string, string][] = [
  ["/admin/publications", "Content Management"],
  ["/admin/categories", "Categories"],
  ["/admin/media", "Media Library"],
  ["/admin/analytics", "Analytics"],
  ["/admin/readers", "Readers"],
  ["/admin/comments", "Comments"],
  ["/admin/newsletter", "Newsletter"],
  ["/admin/homepage", "Homepage"],
  ["/admin/languages", "Languages"],
  ["/admin/seo", "SEO"],
  ["/admin/settings", "Settings"],
  ["/admin", "Dashboard"],
]

export function AdminFrame({ name, email, children }: { name: string; email: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const { signOut } = useClerk()
  const title = titles.find(([href]) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)))?.[1] ?? "Admin"
  return (
    <SidebarProvider>
      <AppSidebar user={{ name, email, avatar: "" }} />
      <SidebarInset className="bg-[#f6f1e7]">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[#e2d9cc] bg-white px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">Admin</BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium text-[#1c2b3a]">{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex size-9 items-center justify-center rounded-md text-[#4a5568] hover:bg-[#f6f1e7]" aria-label="Notifications">
                <Bell size={18} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <p className="px-2 py-3 text-sm text-[#4a5568]">No notifications.</p>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-md" aria-label="Account menu">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-[#1c2b3a] text-xs text-white">{name.slice(0, 1).toUpperCase() || "A"}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild><Link href="/admin/profile"><UserRound /> My Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/admin/settings"><Settings /> Account Settings</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ redirectUrl: "/en" })}>
                  <LogOut /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
