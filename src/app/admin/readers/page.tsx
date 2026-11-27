import { setReaderRestriction } from "@/lib/actions/admin";
import { listReaders } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ReadersAdmin({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  if (!(await requireAdmin())) redirect("/admin");
  const q = ((await searchParams).q ?? "").toLowerCase();
  const readers = (await listReaders()).filter((reader) => !q || `${reader.name} ${reader.email}`.toLowerCase().includes(q));
  return (
    <div>
      <h1 className="font-display text-4xl text-navy">Readers</h1>
      <form className="mt-4"><input name="q" defaultValue={q} placeholder="Search" className="border border-line px-3 py-2" /><button className="ml-2 border border-navy px-3 py-2">Search</button></form>
      {readers.length === 0 ? <p className="mt-8 text-muted">No accounts match.</p> : (
        <table className="mt-6 w-full text-sm">
          <thead><tr className="border-b text-left"><th className="py-2">Name</th><th>Email</th><th>Joined</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {readers.map((reader) => (
              <tr key={reader.id} className="border-b border-line">
                <td className="py-2">{reader.name}</td>
                <td>{reader.email}</td>
                <td>{reader.createdAt.toISOString().slice(0, 10)}</td>
                <td>{reader.role}{reader.banned ? " · restricted" : ""}{reader.emailVerified ? "" : " · unverified"}</td>
                <td>{reader.role === "admin" ? null : (
                  <form action={async () => { "use server"; await setReaderRestriction(reader.id, !reader.banned); }}>
                    <button>{reader.banned ? "Restore" : "Restrict"}</button>
                  </form>
                )}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
