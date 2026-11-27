import { requireAdmin } from "@/lib/session";
import { listSubscribers } from "@/lib/admin/queries";

export async function GET() {
  if (!(await requireAdmin())) return new Response("Forbidden", { status: 403 });
  const subscribers = (await listSubscribers()).filter((item) => item.status === "confirmed");
  const csv = ["email,locale,confirmed_at", ...subscribers.map((item) => `${item.email},${item.locale},${item.confirmedAt?.toISOString() ?? ""}`)].join("\n");
  return new Response(csv, {
    headers: {
      "content-type": "text/csv",
      "content-disposition": "attachment; filename=subscribers.csv",
    },
  });
}
