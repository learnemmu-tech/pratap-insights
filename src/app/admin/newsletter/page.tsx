import { saveCampaign, sendCampaign } from "@/lib/actions/admin";
import { listCampaigns, listSubscribers } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewsletterAdmin() {
  if (!(await requireAdmin())) redirect("/admin");
  const subscribers = await listSubscribers();
  const campaigns = await listCampaigns();
  const configured = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
  return (
    <div className="space-y-10">
      <h1 className="font-display text-4xl text-navy">Newsletter</h1>
      {!configured ? <p className="border border-gold bg-gold-soft p-4 text-sm">Resend is not configured. Messages are stored in the email outbox and are not delivered.</p> : null}
      <form action="/api/admin/newsletter/export"><button className="border border-navy px-4 py-2 text-sm">Export confirmed subscribers</button></form>
      {subscribers.length === 0 ? <p className="text-muted">No subscribers yet.</p> : (
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left"><th className="py-2">Email</th><th>Status</th><th>Consent</th><th>Locale</th></tr></thead>
          <tbody>
            {subscribers.map((subscriber) => (
              <tr key={subscriber.id} className="border-b border-line">
                <td className="py-2">{subscriber.email}</td>
                <td>{subscriber.status}</td>
                <td>{subscriber.consentAt?.toISOString().slice(0, 10) ?? "—"}</td>
                <td>{subscriber.locale}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <form className="grid max-w-2xl gap-3" action={async (formData) => { "use server"; await saveCampaign({ subject: String(formData.get("subject")), body: String(formData.get("body")) }); }}>
        <h2 className="font-display text-2xl">New letter</h2>
        <input name="subject" placeholder="Subject" required className="border border-line px-3 py-2" />
        <textarea name="body" placeholder="Plain-text letter" required rows={8} className="border border-line px-3 py-2" />
        <button className="w-fit bg-navy px-4 py-2 text-white">Save draft</button>
      </form>
      <ul className="space-y-4">
        {campaigns.map((campaign) => (
          <li key={campaign.id} className="border border-line bg-white p-4">
            <p className="font-medium">{campaign.subject}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{campaign.body}</p>
            <p className="mt-2 text-xs uppercase tracking-wide text-gold">{campaign.status}</p>
            <form className="mt-3" action={async () => { "use server"; await sendCampaign(campaign.id); }}>
              <button className="border border-navy px-3 py-2 text-sm">Send to confirmed subscribers</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
