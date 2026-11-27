"use client";

import { ImageIcon, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArticleEditor } from "@/components/admin/editor";
import { MediaUpload } from "@/components/admin/media-upload";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deactivateCategory, loadArticleEditor, saveCategory, softDeleteArticle } from "@/lib/actions/admin";

const primary = "inline-flex h-10 items-center justify-center rounded-[6px] bg-[#c0623a] px-4 text-sm font-semibold text-white hover:bg-[#a8512f]";

export type ArticleRow = {
  id: string;
  title: string;
  category: string | null;
  languages: string;
  status: string;
  updated: string;
  deleted: boolean;
  coverUrl: string | null;
  previews: { locale: string; slug: string }[];
};
export type CategoryOption = { id: string; name: string };
export type CategoryRow = { id: string; sortOrder: number; active: boolean; name: string; description: string; articleCount: number };
export type MediaRow = { id: string; url: string; alt: string; caption: string };

export function ContentWorkspace({
  articles,
  categories,
  categoryRows,
  media,
}: {
  articles: ArticleRow[];
  categories: CategoryOption[];
  categoryRows: CategoryRow[];
  media: MediaRow[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"articles" | "categories" | "media">("articles");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [articleId, setArticleId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<Awaited<ReturnType<typeof loadArticleEditor>> | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryNotice, setCategoryNotice] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);
  const [toast, setToast] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ArticleRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [addedCategories, setAddedCategories] = useState<CategoryOption[]>([]);
  const categoryOptions = [...categories, ...addedCategories.filter((item) => !categories.some((category) => category.id === item.id))];

  const visible = articles.filter((item) => {
    const text = `${item.title} ${item.languages} ${item.category ?? ""}`.toLowerCase();
    return !query || text.includes(query.toLowerCase());
  });

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (articleId && !window.confirm("Close this article? Unsaved changes will be lost.")) return;
      setOpen(false);
      setArticleId(null);
      setLoaded(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, articleId]);

  function openArticle() {
    setError("");
    setLoaded(null);
    setArticleId("");
    setOpen(true);
  }

  async function editArticle(id: string) {
    setError("");
    setLoaded(null);
    setCreating(true);
    setOpen(true);
    setArticleId(null);
    const result = await loadArticleEditor(id);
    setCreating(false);
    if ("error" in result) {
      setError("The article could not be opened.");
      return;
    }
    setLoaded(result);
    setArticleId(id);
  }

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function finishSave(kind: "published" | "draft" | "updated") {
    setOpen(false);
    setArticleId(null);
    setLoaded(null);
    setToast({
      tone: "success",
      message: kind === "updated" ? "Article updated successfully." : kind === "published" ? "Article published successfully." : "Article saved as draft.",
    });
    router.refresh();
  }

  async function confirmDelete() {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    try {
      const result = await softDeleteArticle(pendingDelete.id);
      if (!result || !("ok" in result) || !result.ok) {
        setToast({ tone: "error", message: "The article could not be deleted." });
        return;
      }
      setPendingDelete(null);
      setToast({ tone: "success", message: "Article deleted." });
      router.refresh();
    } catch {
      setToast({ tone: "error", message: "The article could not be deleted." });
    } finally {
      setDeleting(false);
    }
  }

  function requestClose() {
    if (articleId && !window.confirm("Close this article? Save first if you want to keep the latest edits.")) return;
    setOpen(false);
    setArticleId(null);
    setLoaded(null);
  }

  const searchPlaceholder = tab === "articles" ? "Search articles..." : tab === "categories" ? "Search categories..." : "Search media...";
  return (
    <div className="space-y-5">
      <header className="relative overflow-hidden rounded-[20px] border border-[#e2d9cc] bg-white px-7 py-6 shadow-sm">
        <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#f0c2ae] via-[#c0623a] to-[#f0c2ae]" />
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#c0623a]">Admin</p>
        <h1 className="mt-2 font-display text-[28px] leading-none text-[#1c2b3a]">Content Management</h1>
        <p className="mt-2 text-sm text-[#4a5568]">Create, edit and manage medical publications and website content.</p>
      </header>
      <div className="flex items-center gap-1 bg-transparent">
        {(["articles", "categories", "media"] as const).map((item) => (
          <button key={item} type="button" className={`h-9 rounded-[8px] px-3.5 text-sm font-medium ${tab === item ? "bg-[#fbf8f3] text-[#1c2b3a]" : "bg-transparent text-[#4a5568]"}`} onClick={() => setTab(item)}>
            {item === "articles" ? "Articles" : item === "categories" ? "Categories" : "Media Library"}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {tab === "articles" ? (
          <label className="relative block w-full max-w-[340px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#66707a]" aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search articles..." className="h-9 w-full rounded-[8px] border border-[#e2d9cc] bg-[#fbf8f3] pl-9 pr-3 text-sm text-[#1c2b3a] outline-none" />
          </label>
        ) : (
          <label className="relative block w-full max-w-[480px]">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#66707a]">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={searchPlaceholder} className="h-[50px] w-full rounded-full border border-[#e2d9cc] bg-[#fbf8f3] pl-10 pr-4 text-sm text-[#1c2b3a] outline-none" />
          </label>
        )}
        {tab === "articles" ? <button type="button" className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[8px] bg-[#c0623a] px-3.5 text-sm font-medium text-white hover:bg-[#a8512f]" onClick={openArticle}><Plus className="h-4 w-4" aria-hidden="true" /> Add Article</button> : null}
        {tab === "categories" ? <button type="button" className="inline-flex h-10 items-center gap-1.5 rounded-[8px] bg-[#c0623a] px-3 text-sm font-medium text-white hover:bg-[#a8512f]" onClick={() => { setEditingCategory(null); setCategoryName(""); setCategoryDescription(""); setCategoryNotice(""); setCategoryOpen(true); }}><span aria-hidden="true">+</span> Add Category</button> : null}
        {tab === "media" ? <a href="#media-upload" className={primary}>Upload Media</a> : null}
      </div>
      {tab === "articles" ? (
        articles.length === 0 ? (
          <div className="flex h-[325px] flex-col items-center justify-center rounded-[22px] border border-dashed border-[#e2d9cc] bg-[#fbf8f3] text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef1f5] text-[#66707a]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M14 3v5h5" /></svg>
            </span>
            <p className="mt-4 text-[16px] font-semibold text-[#1c2b3a]">No articles have been created yet.</p>
            <p className="mt-1 text-[14px] font-normal text-[#66707a]">Add your first article to get started.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[12px] border border-[#e2d9cc] bg-white">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow className="border-[#e2d9cc] bg-[#f6f1e7] hover:bg-[#f6f1e7]">
                  <TableHead className="text-[#4a5568]">Article</TableHead>
                  <TableHead className="text-[#4a5568]">Category</TableHead>
                  <TableHead className="text-[#4a5568]">Status</TableHead>
                  <TableHead className="text-[#4a5568]">Updated</TableHead>
                  <TableHead className="text-right text-[#4a5568]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.length === 0 ? (
                  <TableRow className="border-[#e2d9cc] hover:bg-white">
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-[#4a5568]">No articles match your search.</TableCell>
                  </TableRow>
                ) : null}
                {visible.map((item) => (
                  <TableRow key={item.id} className="border-[#e2d9cc] hover:bg-[#fbf8f3]">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {item.coverUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.coverUrl} alt="" className="h-10 w-[52px] shrink-0 rounded-[6px] object-cover" />
                        ) : (
                          <span className="flex h-10 w-[52px] shrink-0 items-center justify-center rounded-[6px] bg-[#efe8dc] text-[#66707a]">
                            <ImageIcon className="h-4 w-4" aria-hidden="true" />
                          </span>
                        )}
                        <span className="max-w-[280px] truncate text-sm font-medium text-[#1c2b3a]">{item.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-[#4a5568]">{item.category ?? "—"}</TableCell>
                    <TableCell><StatusBadge status={item.status} /></TableCell>
                    <TableCell className="text-sm text-[#4a5568]">{item.updated}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-[8px] px-2.5 text-[13px] font-medium text-[#c0623a] hover:bg-[#f5e8e2]" onClick={() => void editArticle(item.id)}>
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit
                        </button>
                        <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-[8px] px-2.5 text-[13px] font-medium text-[#c03a3a] hover:bg-[#f8ecec]" onClick={() => setPendingDelete(item)}>
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      ) : null}
      {tab === "categories" ? (
        <div className="overflow-x-auto rounded-[16px] border border-[#e2d9cc] bg-white">
          {categoryRows.filter((row) => row.active && (!query || `${row.name} ${row.description}`.toLowerCase().includes(query.toLowerCase()))).length === 0 ? (
            <p className="px-6 py-16 text-center text-sm text-[#4a5568]">No categories yet. Add a category before assigning articles.</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[#e2d9cc] text-left text-[#4a5568]"><th className="px-4 py-3">Category name</th><th>Description</th><th>Articles</th><th></th></tr></thead>
              <tbody>
                {categoryRows.filter((row) => row.active && (!query || `${row.name} ${row.description}`.toLowerCase().includes(query.toLowerCase()))).map((row) => (
                  <tr key={row.id} className="border-b border-[#e2d9cc]">
                    <td className="px-4 py-3 font-medium text-[#1c2b3a]">{row.name}</td>
                    <td className="text-[#4a5568]">{row.description || "—"}</td>
                    <td>{row.articleCount}</td>
                    <td className="space-x-3 px-4 text-right">
                      <button type="button" className="text-[#c0623a]" onClick={() => { setEditingCategory(row); setCategoryName(row.name); setCategoryDescription(row.description); setCategoryNotice(""); setCategoryOpen(true); }}>Edit</button>
                      <button type="button" className="text-[#1c2b3a]" onClick={async () => {
                        if (!window.confirm(`Delete ${row.name}?`)) return;
                        const result = await deactivateCategory(row.id);
                        if (result && "error" in result && result.error === "in_use") setCategoryNotice("This category is used by articles, so it was not deleted.");
                        else router.refresh();
                      }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {categoryNotice && !categoryOpen ? <p className="px-4 py-3 text-sm text-[#c03a3a]">{categoryNotice}</p> : null}
        </div>
      ) : null}
      {tab === "media" ? (
        <div id="media-upload" className="mt-4 rounded-md border border-[#e2d9cc] bg-white p-4">
          <MediaUpload />
          {media.filter((item) => !query || `${item.alt} ${item.caption}`.toLowerCase().includes(query.toLowerCase())).length === 0 ? <p className="mt-4 text-sm text-[#4a5568]">No images uploaded.</p> : (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {media.filter((item) => !query || `${item.alt} ${item.caption}`.toLowerCase().includes(query.toLowerCase())).map((item) => (
                <li key={item.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={item.alt} className="aspect-video w-full rounded-md object-cover" />
                  <p className="mt-2 text-sm">{item.alt || "No alt text"}</p>
                  <p className="text-xs text-[#4a5568]">{item.caption}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
      {open ? (
        <div className="fixed inset-0 z-50 flex justify-center bg-[#1c2b3a]/30 sm:px-4 sm:py-4">
          <div role="dialog" aria-modal="true" aria-labelledby="article-modal-title" className="flex h-dvh w-full max-w-[640px] flex-col overflow-hidden border border-[#e2d9cc] bg-white sm:h-[calc(100dvh-32px)] sm:rounded-[12px]">
            <div className="relative border-b border-[#e2d9cc] px-7 py-5">
              <button type="button" className="absolute right-5 top-5 text-xl text-[#66707a]" aria-label="Close" onClick={requestClose}>×</button>
              <h2 id="article-modal-title" className="text-[22px] font-semibold text-[#1c2b3a]">{loaded ? "Edit Article" : "Add Article"}</h2>
              <p className="mt-1 text-base text-[#4a5568]">{loaded ? "Update your medical article." : "Publish a new medical article to Pratap Insights."}</p>
            </div>
            {error ? <p className="px-7 pt-4 text-sm text-[#c03a3a]">{error}</p> : null}
            {creating ? <p className="px-7 py-6 text-sm text-[#4a5568]">Loading the article…</p> : null}
            {loaded && "article" in loaded && loaded.article && loaded.translations && loaded.tags && loaded.references ? (
              <ArticleEditor
                articleId={loaded.article.id}
                featured={loaded.article.featured}
                categoryId={loaded.article.categoryId}
                featuredImageId={loaded.article.featuredImageId}
                displayAuthor={loaded.article.displayAuthor || "Dr. Pratap"}
                youtubeUrl={loaded.article.youtubeId ? `https://www.youtube.com/watch?v=${loaded.article.youtubeId}` : ""}
                references={loaded.references}
                translations={loaded.translations}
                tags={loaded.tags}
                categories={categoryOptions}
                onAddCategory={() => { setEditingCategory(null); setCategoryName(""); setCategoryDescription(""); setCategoryNotice(""); setCategoryOpen(true); }}
                media={media.map((item) => ({ id: item.id, url: item.url, alt: item.alt }))}
                onCancel={requestClose}
                onNotify={setToast}
                onSaved={finishSave}
              />
            ) : null}
            {!loaded && !creating && !error ? (
              <ArticleEditor
                featured={false}
                categoryId={null}
                featuredImageId={null}
                displayAuthor="Dr. Pratap"
                translations={[]}
                tags={[]}
                categories={categoryOptions}
                onAddCategory={() => { setEditingCategory(null); setCategoryName(""); setCategoryDescription(""); setCategoryNotice(""); setCategoryOpen(true); }}
                media={media.map((item) => ({ id: item.id, url: item.url, alt: item.alt }))}
                onCancel={requestClose}
                onNotify={setToast}
                onSaved={finishSave}
              />
            ) : null}
          </div>
        </div>
      ) : null}
      {categoryOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1c2b3a]/30 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="category-modal-title" className="w-full max-w-[500px] rounded-[12px] border border-[#e2d9cc] bg-white">
            <div className="relative border-b border-[#e2d9cc] px-6 py-4">
              <button type="button" className="absolute right-4 top-4 text-xl text-[#66707a]" aria-label="Close" onClick={() => { if (!savingCategory) setCategoryOpen(false); }}>×</button>
              <h2 id="category-modal-title" className="font-display text-xl text-[#1c2b3a]">{editingCategory ? "Edit Category" : "Add Category"}</h2>
              <p className="mt-1 text-sm text-[#4a5568]">{editingCategory ? "Update this article category." : "Create a new article category for Pratap Insights."}</p>
            </div>
            <form className="space-y-3 px-6 py-4" onSubmit={async (event) => {
              event.preventDefault();
              if (savingCategory) return;
              if (!categoryName.trim()) { setCategoryNotice("Enter a category name."); return; }
              setSavingCategory(true);
              setCategoryNotice("");
              const result = await saveCategory({
                id: editingCategory?.id,
                active: true,
                sortOrder: editingCategory?.sortOrder ?? categoryRows.length,
                translations: [{ locale: "en", name: categoryName.trim(), slug: categoryName.trim(), description: categoryDescription.trim(), seoTitle: "", seoDescription: "" }],
              });
              setSavingCategory(false);
              if (result && "error" in result) {
                setCategoryNotice(result.error === "duplicate" ? "A category with this name already exists." : "The category could not be saved.");
                return;
              }
              if (result && "id" in result && result.id) setAddedCategories((items) => [...items, { id: result.id, name: categoryName.trim() }]);
              setCategoryOpen(false);
              router.refresh();
            }}>
              <label className="block text-sm font-medium text-[#1c2b3a]">Category Name
                <input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Enter category name" className="mt-1 h-11 w-full rounded-[8px] border border-[#e2d9cc] bg-[#f6f1e7] px-3 text-sm text-[#1c2b3a] outline-none focus:border-[#c0623a]" />
              </label>
              <label className="block text-sm font-medium text-[#1c2b3a]">Description
                <textarea value={categoryDescription} onChange={(event) => setCategoryDescription(event.target.value)} placeholder="Briefly describe this category." className="mt-1 h-20 w-full resize-y rounded-[8px] border border-[#e2d9cc] bg-[#f6f1e7] px-3 py-2 text-sm text-[#1c2b3a] outline-none focus:border-[#c0623a]" />
              </label>
              {categoryNotice ? <p className="text-sm text-[#c03a3a]">{categoryNotice}</p> : null}
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" className="h-10 rounded-[8px] border border-[#e2d9cc] bg-white px-4 text-sm font-medium text-[#1c2b3a]" disabled={savingCategory} onClick={() => setCategoryOpen(false)}>Cancel</button>
                <button type="submit" className="h-10 rounded-[8px] bg-[#c0623a] px-4 text-sm font-medium text-white hover:bg-[#a8512f] disabled:opacity-60" disabled={savingCategory}>{savingCategory ? "Saving…" : "Save Category"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
      {pendingDelete ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#1c2b3a]/30 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-article-title" className="w-full max-w-[420px] rounded-[12px] border border-[#e2d9cc] bg-white p-5">
            <h2 id="delete-article-title" className="text-base font-semibold text-[#1c2b3a]">Delete article</h2>
            <p className="mt-2 text-sm text-[#4a5568]">Delete “{pendingDelete.title}”? It will leave this list after the deletion is confirmed.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="h-9 rounded-[8px] border border-[#e2d9cc] bg-white px-3 text-sm font-medium text-[#1c2b3a]" disabled={deleting} onClick={() => setPendingDelete(null)}>Cancel</button>
              <button type="button" className="h-9 rounded-[8px] bg-[#c03a3a] px-3 text-sm font-medium text-white disabled:opacity-60" disabled={deleting} onClick={() => void confirmDelete()}>{deleting ? "Deleting…" : "Delete"}</button>
            </div>
          </div>
        </div>
      ) : null}
      {toast ? (
        <div className={`fixed bottom-4 right-4 z-[70] flex max-w-sm items-start gap-2 rounded-[8px] border px-3 py-2 text-sm shadow-sm ${toast.tone === "success" ? "border-[#3a7c5e] bg-white text-[#3a7c5e]" : "border-[#c03a3a] bg-white text-[#c03a3a]"}`}>
          <span aria-hidden="true">{toast.tone === "success" ? "✓" : "!"}</span>
          <p>{toast.message}</p>
        </div>
      ) : null}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone = status === "Published" ? "bg-[#e7f4ee] text-[#3a7c5e]" : status === "Archived" ? "bg-[#f6f1e7] text-[#8a6a3b]" : "bg-[#eef1f5] text-[#4a5568]";
  return <span className={`inline-flex h-6 items-center rounded-[6px] px-2 text-xs font-medium ${tone}`}>{status}</span>;
}
