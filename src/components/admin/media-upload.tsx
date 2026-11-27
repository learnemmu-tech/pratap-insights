"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MediaUpload() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  return (
    <form
      className="mt-6 flex flex-wrap items-end gap-3"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const response = await fetch("/api/media", { method: "POST", body: form });
        const payload = await response.json();
        setMessage(response.ok ? "Uploaded." : payload.error ?? "Upload failed.");
        if (response.ok) router.refresh();
      }}
    >
      <label className="text-sm">Image<input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required className="mt-1 block" /></label>
      <label className="text-sm">Alt<input name="alt" className="mt-1 block border border-line px-2 py-2" /></label>
      <label className="text-sm">Caption<input name="caption" className="mt-1 block border border-line px-2 py-2" /></label>
      <button className="bg-navy px-4 py-2 text-white">Upload</button>
      {message ? <p className="text-sm">{message}</p> : null}
    </form>
  );
}
