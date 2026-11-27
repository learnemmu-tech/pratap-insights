"use client";

import { useEffect, useState } from "react";

export function ReadingTracker({ articleId }: { articleId: string }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const key = "pratap-visitor";
    let visitorId = localStorage.getItem(key);
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem(key, visitorId);
    }
    const started = Date.now();
    const send = (engaged: boolean) => {
      const depth = Math.round(progress);
      void fetch("/api/analytics/view", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          articleId,
          visitorId,
          durationSeconds: Math.round((Date.now() - started) / 1000),
          scrollDepth: engaged ? Math.max(depth, 50) : depth,
        }),
        keepalive: true,
      });
    };
    send(false);
    const onScroll = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? Math.min(100, (window.scrollY / height) * 100) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const timer = window.setTimeout(() => send(true), 30000);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
      // progress is read when the timer fires; it must not restart the tracker.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);
  return <div aria-hidden className="fixed top-0 left-0 z-40 h-0.5 bg-[#0B6E66]" style={{ width: `${progress}%` }} />;
}
