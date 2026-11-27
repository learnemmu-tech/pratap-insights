import { listAudit } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AuditAdmin() {
  if (!(await requireAdmin())) redirect("/admin");
  const rows = await listAudit();
  return (
    <div>
      <h1 className="font-display text-4xl text-navy">Audit log</h1>
      {rows.length === 0 ? <p className="mt-6 text-muted">No administrative changes recorded.</p> : (
        <ul className="mt-6 space-y-2 text-sm">
          {rows.map((row) => <li key={row.id}>{row.createdAt.toISOString()} · {row.action} · {row.entity} · {row.entityId}</li>)}
        </ul>
      )}
    </div>
  );
}
