import { deleteComment, moderateComment, replyToComment } from "@/lib/actions/admin";
import { listComments } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const tabs = ["pending", "approved", "rejected", "reported", "spam"] as const;

export default async function CommentsAdmin({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  if (!(await requireAdmin())) redirect("/admin");
  const status = (await searchParams).status ?? "pending";
  const rows = await listComments(status);
  return (
    <div>
      <h1 className="font-display text-4xl text-navy">Comments</h1>
      <div className="mt-4 flex gap-3 text-sm">
        {tabs.map((tab) => <a key={tab} href={`/admin/comments?status=${tab}`} className={tab === status ? "text-navy underline" : "text-muted"}>{tab}</a>)}
      </div>
      {rows.length === 0 ? <p className="mt-8 text-muted">Nothing in this queue.</p> : (
        <ul className="mt-6 space-y-4">
          {rows.map(({ comment, author }) => (
            <li key={comment.id} className="border border-line bg-white p-4">
              <p className="text-sm text-muted">{author} · {comment.status}</p>
              <p className="mt-2 whitespace-pre-wrap">{comment.body}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                {(["approved", "rejected", "spam", "pending"] as const).map((next) => (
                  <form key={next} action={async () => { "use server"; await moderateComment(comment.id, next); }}>
                    <button>{next}</button>
                  </form>
                ))}
                <form action={async () => { "use server"; await deleteComment(comment.id); }}><button>Delete</button></form>
              </div>
              <form className="mt-3 flex gap-2" action={async (formData) => { "use server"; await replyToComment(comment.id, String(formData.get("body") ?? "")); }}>
                <input name="body" placeholder="Reply publicly" className="w-full border border-line px-3 py-2" />
                <button className="bg-navy px-3 text-white">Reply</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
