import { deactivateCategory, saveCategory } from "@/lib/actions/admin";
import { listAdminCategories } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CategoriesAdmin() {
  if (!(await requireAdmin())) redirect("/admin");
  const categories = await listAdminCategories();
  return (
    <div className="space-y-10">
      <h1 className="font-display text-4xl text-navy">Categories</h1>
      <CategoryForm />
      {categories.length === 0 ? <p className="text-muted">No categories yet. Run the seed or create one.</p> : null}
      {categories.map((category) => (
        <article key={category.id} className="border border-line bg-white p-4">
          <p className="text-sm text-muted">Order {category.sortOrder} · {category.active ? "Active" : "Inactive"}</p>
          <ul className="mt-2 text-sm">{category.translations.map((item) => <li key={item.id}>{item.locale}: {item.name}</li>)}</ul>
          <form className="mt-3" action={async () => { "use server"; await deactivateCategory(category.id); }}>
            <button className="text-sm underline">Deactivate if unused</button>
          </form>
        </article>
      ))}
    </div>
  );
}

function CategoryForm() {
  return (
    <form className="grid gap-3 border border-line bg-white p-4" action={async (formData) => {
      "use server";
      await saveCategory({
        active: true,
        sortOrder: Number(formData.get("sortOrder") ?? 0),
        translations: ["en", "te", "hi"].map((locale) => ({
          locale: locale as "en",
          name: String(formData.get(`${locale}-name`) ?? ""),
          slug: String(formData.get("en-name") ?? ""),
          description: String(formData.get(`${locale}-description`) ?? ""),
          seoTitle: "",
          seoDescription: "",
        })).filter((item) => item.name),
      });
    }}>
      <h2 className="font-display text-2xl">New category</h2>
      {["en", "te", "hi"].map((locale) => (
        <div key={locale} className="grid gap-2 md:grid-cols-2">
          <input name={`${locale}-name`} placeholder={`${locale} name`} className="border border-line px-3 py-2" required={locale === "en"} />
          <input name={`${locale}-description`} placeholder={`${locale} description`} className="border border-line px-3 py-2" />
        </div>
      ))}
      <input name="sortOrder" type="number" defaultValue={categoriesPlaceholder()} className="w-24 border border-line px-3 py-2" />
      <button className="w-fit bg-navy px-4 py-2 text-white">Save category</button>
    </form>
  );
}

function categoriesPlaceholder() {
  return 10;
}
