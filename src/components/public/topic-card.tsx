import type { LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";

export function TopicCard({ href, name, icon: Icon }: { href: string; name: string; icon: LucideIcon; detail?: string }) {
  return (
    <Link href={href} className="flex h-full min-h-[112px] flex-col items-center justify-center gap-2 rounded-md border border-[#E4E8E5] bg-white px-3 py-4 text-center hover:border-[#0B6E66] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0B6E66]">
      <span className="grid h-9 w-9 place-items-center rounded-md bg-[#F2F5F2] text-[#0B6E66]">
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden />
      </span>
      <span className="font-display text-[15px] leading-snug font-semibold text-[#123A35]">{name}</span>
    </Link>
  );
}
