"use client";

export function ArticleShareTools({ title }: { title: string }) {
  const button = "grid h-9 w-9 place-items-center rounded-md border border-[#E4E8E5] bg-white text-[#123A35] hover:border-[#0B6E66] hover:text-[#0B6E66] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0B6E66]";
  function share() {
    const url = window.location.href;
    if (navigator.share) {
      void navigator.share({ title, url }).catch(() => undefined);
      return;
    }
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, "_blank", "noopener,noreferrer");
  }
  function open(href: string) {
    window.open(href, "_blank", "noopener,noreferrer");
  }
  return (
    <div className="flex gap-2" aria-label="Share this article">
      <button type="button" className={button} aria-label="Share" onClick={share}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="6" cy="12" r="2" /><circle cx="16" cy="7" r="2" /><circle cx="16" cy="17" r="2" /><path d="m8 11 6-3M8 13l6 3" /></svg>
      </button>
      <button type="button" className={button} aria-label="Share on LinkedIn" onClick={() => open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`)}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M6.5 9H4V20h2.5V9zM5.2 4A1.6 1.6 0 1 0 5.2 7.2 1.6 1.6 0 0 0 5.2 4zM20 20h-2.5v-5.6c0-1.6-.6-2.6-2-2.6-1 0-1.6.7-1.9 1.4-.1.2-.1.6-.1.9V20H11V9h2.4v1.5c.4-.7 1.3-1.8 3.2-1.8 2.3 0 4 1.5 4 4.8V20z" /></svg>
      </button>
      <button type="button" className={button} aria-label="Share on Facebook" onClick={() => open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`)}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.6l.4-3H13v-2c0-.6.4-1 1-1z" /></svg>
      </button>
      <button type="button" className={button} aria-label="Share on X" onClick={() => open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(title)}`)}>
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M14.7 10.3 21.4 3h-1.6l-5.8 6.3L9.2 3H3.5l7 9.6L3.5 21h1.6l6.1-6.7 4.9 6.7h5.7l-7.1-10.7Zm-2.2 2.4-.7-1-5.6-7.6h2.4l4.5 6.1.7 1 5.9 8h-2.4l-4.8-6.5Z" /></svg>
      </button>
    </div>
  );
}
