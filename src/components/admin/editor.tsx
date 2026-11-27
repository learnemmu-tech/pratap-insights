"use client";

import TipTapLink from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useMemo, useRef, useState } from "react";
import { saveArticle } from "@/lib/actions/admin";
import { slugify } from "@/lib/utils";
import { youtubeIdFromUrl } from "@/lib/youtube";

type Translation = {
  locale: string;
  title: string;
  subtitle: string;
  excerpt: string;
  content: unknown;
  seoTitle: string;
  seoDescription: string;
  slug: string;
  status: string;
  publishedAt: string | null;
};
type Media = { id: string; url: string; alt: string };
type Category = { id: string; name: string };
type Reference = { title: string; author: string; publishedOn: string; sourceUrl: string; details: string };

const field = "mt-1 h-10 w-full rounded-[8px] border border-[#e2d9cc] bg-[#f6f1e7] px-3 text-sm text-[#1c2b3a] outline-none focus:border-[#c0623a]";
const label = "mb-3 block text-[13px] font-medium text-[#1c2b3a]";

export function ArticleEditor({
  articleId = "",
  featured,
  categoryId,
  featuredImageId,
  translations,
  tags,
  categories,
  media,
  displayAuthor = "Dr. Pratap",
  youtubeUrl = "",
  references = [],
  onSaved,
  onCancel,
  onAddCategory,
  onNotify,
}: {
  articleId?: string;
  featured: boolean;
  categoryId: string | null;
  featuredImageId: string | null;
  translations: Translation[];
  tags: { name: string; locale: string }[];
  categories: Category[];
  media: Media[];
  displayAuthor?: string;
  youtubeUrl?: string;
  references?: Reference[];
  cover?: { url: string; alt: string } | null;
  onSaved?: (kind: "published" | "draft" | "updated") => void;
  onCancel?: () => void;
  onAddCategory?: () => void;
  onNotify?: (notice: { tone: "success" | "error"; message: string }) => void;
}) {
  const existing = Boolean(articleId);
  const initial = useMemo(() => translations.find((item) => item.locale === "en") ?? emptyTranslation(), [translations]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(initial.title);
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [author, setAuthor] = useState(displayAuthor || "Dr. Pratap");
  const [category, setCategory] = useState(categoryId ?? "");
  const [tagText, setTagText] = useState(tags.filter((tag) => tag.locale === "en").map((tag) => tag.name).join(", "));
  const [video, setVideo] = useState(youtubeUrl);
  const [imageId, setImageId] = useState(featuredImageId ?? "");
  const [imageUrl, setImageUrl] = useState(media.find((item) => item.id === featuredImageId)?.url ?? "");
  const [imageAlt, setImageAlt] = useState(media.find((item) => item.id === featuredImageId)?.alt ?? "");
  const [imageFile, setImageFile] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isFeatured, setFeatured] = useState(featured);
  const [publish, setPublish] = useState(initial.status === "published");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState(initial.content);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      TipTapLink.configure({ openOnClick: false, autolink: false }),
      Image.extend({ addAttributes() { return { ...this.parent?.(), caption: { default: "" }, alt: { default: "" } }; } }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: "Write the full article content..." }),
    ],
    content: (initial.content as object) ?? { type: "doc", content: [{ type: "paragraph" }] },
    immediatelyRender: false,
    onUpdate: ({ editor: current }) => setContent(current.getJSON()),
  });
  const videoId = video.trim() ? youtubeIdFromUrl(video) : "";

  function uploadCover(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      const message = "Image must be 2 MB or smaller.";
      setNotice(message);
      onNotify?.({ tone: "error", message });
      return;
    }
    setNotice("");
    setUploadProgress(0);
    const body = new FormData();
    body.set("file", file);
    body.set("alt", imageAlt || title || "Article cover");
    const request = new XMLHttpRequest();
    request.open("POST", "/api/media");
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) setUploadProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () => {
      setUploadProgress(null);
      const payload = JSON.parse(request.responseText || "{}") as { item?: { id: string; url: string; alt: string }; error?: string };
      if (request.status >= 200 && request.status < 300 && payload.item) {
        setImageId(payload.item.id);
        setImageUrl(payload.item.url);
        setImageAlt(payload.item.alt);
        setImageFile(`${file.name} · ${Math.max(1, Math.round(file.size / 1024))} KB`);
      } else {
        const message = payload.error === "unsupported" ? "Use a JPEG, PNG, WebP, or GIF." : "The image could not be uploaded.";
        setNotice(message);
        onNotify?.({ tone: "error", message });
      }
    };
    request.onerror = () => {
      setUploadProgress(null);
      setNotice("The image could not be uploaded.");
      onNotify?.({ tone: "error", message: "The image could not be uploaded." });
    };
    request.send(body);
  }

  async function persist() {
    if (saving) return;
    const nextErrors: Record<string, string> = {};
    if (!title.trim()) nextErrors.title = "Enter an article title.";
    if (!category) nextErrors.category = "Select a category.";
    if (!excerpt.trim()) nextErrors.excerpt = "Enter a short description.";
    if (!author.trim()) nextErrors.author = "Enter an author.";
    if (!imageId) nextErrors.cover = "Upload a cover image.";
    if (video.trim() && !videoId) nextErrors.video = "Enter a valid YouTube URL.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      onNotify?.({ tone: "error", message: "Complete the required fields before saving." });
      return;
    }
    setSaving(true);
    setNotice("");
    let result: Awaited<ReturnType<typeof saveArticle>>;
    try {
      result = await saveArticle({
      articleId,
      locale: "en",
      title,
      subtitle: "",
      excerpt,
      content: JSON.stringify(editor?.getJSON() ?? content),
      seoTitle: initial.seoTitle,
      seoDescription: initial.seoDescription,
      slug: initial.slug && !initial.slug.startsWith("draft-") ? initial.slug : slugify(title),
      categoryId: category,
      featured: isFeatured,
      featuredImageId: imageId,
      tags: tagText.split(",").map((tag) => tag.trim()).filter(Boolean),
      status: publish ? "published" : "draft",
      publishedAt: publish ? (initial.publishedAt ?? new Date().toISOString()) : null,
      displayAuthor: author.trim(),
      youtubeUrl: video,
      references,
    });
    } catch {
      setSaving(false);
      const message = "The article could not be saved.";
      setNotice(message);
      onNotify?.({ tone: "error", message });
      return;
    }
    setSaving(false);
    if (!result || !("ok" in result) || !result.ok) {
      const message = result && "error" in result ? result.error === "slug" ? "That URL slug is already in use." : result.error === "youtube" ? "Enter a valid YouTube URL." : result.error === "incomplete" ? "Title, category, and short description are required." : result.error === "forbidden" ? "You do not have permission to save this article." : result.error === "category" ? "Select a valid category." : result.error === "database" && "message" in result && result.message ? result.message : "The article could not be saved." : "The article could not be saved.";
      setNotice(message);
      onNotify?.({ tone: "error", message });
      return;
    }
    onSaved?.(existing ? "updated" : publish ? "published" : "draft");
  }

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={(event) => event.preventDefault()}>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-7 py-4">
        <section className="space-y-0 rounded-[16px] border border-[#eadfce] bg-[#fbf8f3] p-4">
          <h3 className="mb-3 text-base font-semibold text-[#1c2b3a]">Article Details</h3>
          <label className={label}>Title
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Article title" className={field} />
          </label>
          {errors.title ? <p className="mb-2 text-sm text-[#c03a3a]">{errors.title}</p> : null}
          <div className="mb-3">
            <p className={label}>Category</p>
            <CategorySelect value={category} categories={categories} onChange={setCategory} onAddCategory={onAddCategory} />
          </div>
          {errors.category ? <p className="mb-2 text-sm text-[#c03a3a]">{errors.category}</p> : null}
          <label className={label}>Short Description
            <textarea value={excerpt} onChange={(event) => setExcerpt(event.target.value)} maxLength={500} placeholder="Brief summary shown on article cards..." className="mt-1 h-20 w-full resize-y rounded-[8px] border border-[#e2d9cc] bg-[#f6f1e7] px-3 py-2 text-sm text-[#1c2b3a] outline-none focus:border-[#c0623a]" />
          </label>
          {errors.excerpt ? <p className="mb-2 text-sm text-[#c03a3a]">{errors.excerpt}</p> : null}
          <div className="mb-3">
            <p className={label}>Full Content</p>
            <div className="min-h-[140px] rounded-[8px] border border-[#e2d9cc] bg-[#f6f1e7] px-3 py-2 text-sm [&_.ProseMirror]:min-h-[120px] [&_.ProseMirror]:outline-none">
              <EditorContent editor={editor} />
            </div>
          </div>
          <label className={label}>Author
            <input value={author} onChange={(event) => setAuthor(event.target.value)} className={field} />
          </label>
          {errors.author ? <p className="mb-2 text-sm text-[#c03a3a]">{errors.author}</p> : null}
          <label className={label}>Tags (optional)
            <input value={tagText} onChange={(event) => setTagText(event.target.value)} placeholder="Medical Research, Clinical Practice, Health Insights (comma separated)" className={field} />
          </label>
          <p className="-mt-2 mb-3 text-sm text-[#66707a]">Comma-separated tags</p>
          <label className={label}>YouTube URL (optional)
            <input value={video} onChange={(event) => setVideo(event.target.value)} placeholder="https://youtube.com/watch?v=... or https://youtu.be/..." className={field} />
          </label>
          {errors.video ? <p className="text-sm text-[#c03a3a]">{errors.video}</p> : null}
          {videoId ? (
            <div className="mt-3 aspect-video overflow-hidden rounded-[10px] bg-[#1c2b3a]">
              <iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${videoId}`} title="YouTube preview" allowFullScreen />
            </div>
          ) : null}
        </section>

        <section className="rounded-[12px] border border-[#e2d9cc] bg-white p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-medium text-[#1c2b3a]">Cover image</h3>
              <p className="text-xs text-[#66707a]">JPEG, PNG, WebP, or GIF. Max 2 MB.</p>
            </div>
            <button type="button" className="h-9 rounded-[8px] border border-[#e2d9cc] px-3 text-sm font-medium text-[#1c2b3a]" onClick={() => fileRef.current?.click()}>{imageUrl ? "Replace" : "Upload"}</button>
          </div>
          {imageUrl ? (
            <div className="mt-3 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt={imageAlt || ""} className="h-16 w-24 rounded-[8px] object-cover" />
              <div className="min-w-0">
                <p className="truncate text-sm text-[#1c2b3a]">{imageFile || "Current cover"}</p>
                <button type="button" className="mt-1 text-xs text-[#c03a3a]" onClick={() => { setImageId(""); setImageUrl(""); setImageFile(""); }}>Remove</button>
              </div>
            </div>
          ) : (
            <button type="button" className="mt-3 flex h-16 w-full items-center justify-center gap-2 rounded-[8px] border border-dashed border-[#c9baaa] bg-[#f6f1e7] text-sm text-[#4a5568]" onClick={() => fileRef.current?.click()}>
              {uploadProgress !== null ? `Uploading ${uploadProgress}%` : "Click to upload a cover image"}
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadCover(file); event.currentTarget.value = ""; }} />
          {errors.cover ? <p className="mt-2 text-sm text-[#c03a3a]">{errors.cover}</p> : null}
        </section>

        <div className="divide-y divide-[#e2d9cc] rounded-[12px] border border-[#e2d9cc] bg-white">
          <SwitchCard title="Featured Article" description="Highlight this article for future homepage features." checked={isFeatured} onChange={setFeatured} />
          <SwitchCard title="Publish" description="Make this article visible on the website." checked={publish} onChange={setPublish} />
        </div>
        {notice ? <p className="text-sm text-[#c03a3a]">{notice}</p> : null}
      </div>
      <div className="flex justify-end gap-3 border-t border-[#e2d9cc] bg-white px-7 py-3">
        <button type="button" className="h-9 rounded-[8px] border border-[#e2d9cc] bg-white px-3 text-sm font-medium text-[#1c2b3a]" disabled={saving} onClick={onCancel}>Cancel</button>
        <button type="button" className="h-9 rounded-[8px] bg-[#c0623a] px-3 text-sm font-medium text-white hover:bg-[#a8512f] disabled:opacity-60" disabled={saving} onClick={() => void persist()}>{saving ? "Saving…" : existing ? "Update Article" : "Save Article"}</button>
      </div>
    </form>
  );
}

function CategorySelect({ value, categories, onChange, onAddCategory }: { value: string; categories: Category[]; onChange: (id: string) => void; onAddCategory?: () => void }) {
  const [open, setOpen] = useState(false);
  const selected = categories.find((item) => item.id === value);
  return (
    <div className="relative">
      <button type="button" className="flex h-10 w-full items-center justify-between rounded-[8px] border border-[#e2d9cc] bg-[#f6f1e7] px-3 text-left text-sm text-[#1c2b3a]" onClick={() => setOpen((current) => !current)}>
        <span className={selected ? "" : "text-[#66707a]"}>{selected?.name ?? "Select category"}</span>
        <span aria-hidden="true" className="text-[#66707a]">▾</span>
      </button>
      {open ? (
        <div className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-[8px] border border-[#e2d9cc] bg-white py-1 shadow-[0_8px_24px_rgba(28,43,58,0.12)]">
          {categories.length === 0 ? <p className="px-3 py-2 text-sm text-[#66707a]">No categories yet.</p> : categories.map((item) => (
            <button type="button" key={item.id} className={`block w-full px-3 py-2 text-left text-sm hover:bg-[#f5e8e2] ${item.id === value ? "bg-[#f5e8e2] font-medium text-[#1c2b3a]" : "text-[#1c2b3a]"}`} onClick={() => { onChange(item.id); setOpen(false); }}>{item.name}</button>
          ))}
          {onAddCategory ? <button type="button" className="block w-full px-3 py-2 text-left text-sm font-medium text-[#c0623a] hover:bg-[#f5e8e2]" onClick={() => { setOpen(false); onAddCategory(); }}>+ Add Category</button> : null}
        </div>
      ) : null}
    </div>
  );
}

function SwitchCard({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 px-3 py-2">
      <div>
        <p className="text-sm font-medium text-[#1c2b3a]">{title}</p>
        <p className="text-xs text-[#66707a]">{description}</p>
      </div>
      <button type="button" role="switch" aria-checked={checked} aria-label={title} className={`relative h-5 w-9 shrink-0 rounded-full transition ${checked ? "bg-[#c0623a]" : "bg-[#e2d9cc]"}`} onClick={() => onChange(!checked)}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${checked ? "left-4" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function emptyTranslation(): Translation {
  return { locale: "en", title: "", subtitle: "", excerpt: "", content: { type: "doc", content: [{ type: "paragraph" }] }, seoTitle: "", seoDescription: "", slug: "", status: "draft", publishedAt: null };
}
