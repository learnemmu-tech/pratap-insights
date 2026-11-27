"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/client-navigation";
import { reportComment, submitComment, toggleBookmark, toggleReaction } from "@/lib/actions/public";

type Comment = { id: string; body: string; parentId: string | null; createdAt: Date | string; author: string };

export function Engagement({
  articleId,
  locale,
  slug,
  signedIn,
  state,
  comments,
}: {
  articleId: string;
  locale: string;
  slug: string;
  signedIn: boolean;
  state: { claps: number; likes: number; clapped: boolean; liked: boolean; bookmarked: boolean };
  comments: Comment[];
}) {
  const t = useTranslations("engage");
  const [notice, setNotice] = useState("");
  const [local, setLocal] = useState(state);
  const roots = comments.filter((comment) => !comment.parentId);
  async function react(type: "clap" | "like") {
    const result = await toggleReaction(articleId, type, locale, slug);
    if ("error" in result) return setNotice(result.error === "auth" ? t("login") : t("restricted"));
    setLocal((current) =>
      type === "clap"
        ? { ...current, clapped: !current.clapped, claps: current.claps + (current.clapped ? -1 : 1) }
        : { ...current, liked: !current.liked, likes: current.likes + (current.liked ? -1 : 1) },
    );
  }
  return (
    <section className="mt-12 border-t border-line pt-8">
      <div className="flex flex-wrap gap-3">
        <button className={`border px-4 py-2 text-sm ${local.clapped ? "border-navy bg-navy text-white" : "border-line"}`} onClick={() => react("clap")}>
          {t("clap")} · {local.claps}
        </button>
        <button className={`border px-4 py-2 text-sm ${local.liked ? "border-navy bg-navy text-white" : "border-line"}`} onClick={() => react("like")}>
          {t("like")} · {local.likes}
        </button>
        <button
          className="border border-line px-4 py-2 text-sm"
          onClick={async () => {
            const result = await toggleBookmark(articleId, locale, slug);
            if ("error" in result) return setNotice(t("login"));
            setLocal((current) => ({ ...current, bookmarked: !current.bookmarked }));
          }}
        >
          {local.bookmarked ? t("saved") : t("bookmark")}
        </button>
        <ArticleShareButton className="border border-line px-4 py-2 text-sm" />
      </div>
      {notice ? <p className="mt-3 text-sm text-steel">{notice}</p> : null}
      <div className="mt-10">
        <h2 className="font-display text-3xl text-navy">{t("comments")}</h2>
        <p className="mt-2 text-sm text-muted">{t("guidelines")}</p>
        {signedIn ? (
          <CommentForm articleId={articleId} locale={locale} slug={slug} onNotice={setNotice} />
        ) : (
          <Link href="/login" className="mt-4 inline-block text-sm text-steel underline">
            {t("login")}
          </Link>
        )}
        <div className="mt-8 space-y-6">
          {roots.length === 0 ? <p className="text-muted">{t("empty")}</p> : null}
          {roots.map((comment) => (
            <CommentItem key={comment.id} comment={comment} replies={comments.filter((item) => item.parentId === comment.id)} signedIn={signedIn} articleId={articleId} locale={locale} slug={slug} onNotice={setNotice} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CommentForm({ articleId, locale, slug, parentId, onNotice }: { articleId: string; locale: string; slug: string; parentId?: string; onNotice: (value: string) => void }) {
  const t = useTranslations("engage");
  const [body, setBody] = useState("");
  return (
    <form
      className="mt-4 space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        const result = await submitComment({ articleId, body, parentId, locale, slug });
        if ("ok" in result) {
          setBody("");
          onNotice(t("pending"));
        } else if (result.error === "rate") onNotice(t("rate"));
        else if (result.error === "auth") onNotice(t("login"));
        else onNotice(t("restricted"));
      }}
    >
      <label className="sr-only" htmlFor={`comment-${parentId ?? "root"}`}>{t("placeholder")}</label>
      <textarea id={`comment-${parentId ?? "root"}`} value={body} onChange={(event) => setBody(event.target.value)} required minLength={2} maxLength={2000} className="w-full border border-line bg-white p-3" rows={4} placeholder={t("placeholder")} />
      <button className="bg-navy px-4 py-2 text-sm text-white">{parentId ? t("reply") : t("submit")}</button>
    </form>
  );
}

function CommentItem({ comment, replies, signedIn, articleId, locale, slug, onNotice }: { comment: Comment; replies: Comment[]; signedIn: boolean; articleId: string; locale: string; slug: string; onNotice: (value: string) => void }) {
  const t = useTranslations("engage");
  const [replying, setReplying] = useState(false);
  const [reported, setReported] = useState(false);
  return (
    <article className="border-b border-line pb-4">
      <p className="text-sm text-muted">{comment.author}</p>
      <p className="mt-2 whitespace-pre-wrap">{comment.body}</p>
      <div className="mt-2 flex gap-4 text-sm">
        {signedIn ? <button onClick={() => setReplying((value) => !value)}>{t("reply")}</button> : null}
        <button
          onClick={async () => {
            await reportComment(comment.id);
            setReported(true);
          }}
        >
          {reported ? t("reported") : t("report")}
        </button>
      </div>
      {replying ? <CommentForm articleId={articleId} locale={locale} slug={slug} parentId={comment.id} onNotice={onNotice} /> : null}
      <div className="mt-4 space-y-4 border-l border-line pl-4">
        {replies.map((reply) => (
          <div key={reply.id}>
            <p className="text-sm text-muted">{reply.author}</p>
            <p className="mt-1 whitespace-pre-wrap">{reply.body}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

export function ArticleShareButton({ className = "inline-flex h-9 items-center gap-1.5 rounded-[12px] border border-[#e2d9cc] bg-white px-3 text-sm font-medium text-[#123A35]" }: { className?: string }) {
  const t = useTranslations("article");
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        const url = window.location.href;
        if (navigator.share) await navigator.share({ url }).catch(() => undefined);
        else {
          await navigator.clipboard.writeText(url);
          setCopied(true);
        }
      }}
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="18" cy="5" r="2.2" /><circle cx="6" cy="12" r="2.2" /><circle cx="18" cy="19" r="2.2" /><path d="M8 12.8 16 18.2M16 5.8 8 11.2" /></svg>
      {copied ? t("copied") : t("share")}
    </button>
  );
}

export function ArticleHeroActions({
  articleId,
  locale,
  slug,
  state,
}: {
  articleId: string;
  locale: string;
  slug: string;
  state: { likes: number; liked: boolean; bookmarked: boolean };
}) {
  const t = useTranslations("engage");
  const [notice, setNotice] = useState("");
  const [local, setLocal] = useState(state);
  const button = "inline-flex h-9 items-center gap-1.5 rounded-[12px] border border-[#e2d9cc] bg-white px-3 text-sm font-medium text-[#123A35]";
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={button} onClick={async () => {
          const result = await toggleReaction(articleId, "like", locale, slug);
          if ("error" in result) return setNotice(result.error === "auth" ? t("login") : t("restricted"));
          setLocal((current) => ({ ...current, liked: !current.liked, likes: current.likes + (current.liked ? -1 : 1) }));
        }}>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill={local.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z" /></svg>
          {t("like")} {local.likes}
        </button>
        <button type="button" className={button} onClick={async () => {
          const result = await toggleBookmark(articleId, locale, slug);
          if ("error" in result) return setNotice(t("login"));
          setLocal((current) => ({ ...current, bookmarked: !current.bookmarked }));
        }}>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill={local.bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3-6 3V5a1 1 0 0 1 1-1z" /></svg>
          {local.bookmarked ? t("saved") : t("bookmark")}
        </button>
      </div>
      {notice ? <p className="mt-2 text-sm text-[#4a5568]">{notice}</p> : null}
    </div>
  );
}
