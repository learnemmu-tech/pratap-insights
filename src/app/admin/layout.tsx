import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminFrame } from "@/components/admin/frame";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) redirect("/en/login");
  const isAdmin = session.user.role === "admin" && session.user.emailVerified && !session.user.banned;
  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-lg px-5 py-24">
        <h1 className="font-display text-4xl text-navy">403</h1>
        <p className="mt-4 text-muted">This account cannot open the publishing dashboard.</p>
        <Link href="/en" className="mt-6 inline-block text-sm text-teal">Return to the site</Link>
      </main>
    );
  }
  return <AdminFrame name={session.user.name} email={session.user.email}>{children}</AdminFrame>;
}
