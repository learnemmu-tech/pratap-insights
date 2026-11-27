import { readFileSync } from "node:fs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { articleReferences, articleTranslations, articles, categories, categoryTranslations, mediaAssets } from "../src/db/schema";
import { sampleArticles, sampleCategories } from "../src/lib/content/sample-content";

function databaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const raw = readFileSync(new URL("../.env", import.meta.url), "utf8");
  const line = raw.split(/\r?\n/).find((item) => item.startsWith("DATABASE_URL="));
  if (!line) throw new Error("DATABASE_URL is missing.");
  return line.slice("DATABASE_URL=".length).trim().replace(/^"|"$/g, "");
}

async function main() {
  const sql = postgres(databaseUrl(), { max: 1, prepare: false });
  const db = drizzle(sql);
  const categoryIds = new Map<string, string>();
  for (const [index, category] of sampleCategories.entries()) {
    const existing = await db.select().from(categoryTranslations).where(eq(categoryTranslations.slug, category.slug));
    const id = existing[0]?.categoryId ?? crypto.randomUUID();
    if (!existing[0]) {
      await db.insert(categories).values({ id, sortOrder: index + 1, active: true });
      for (const locale of ["en", "te", "hi"]) {
        await db.insert(categoryTranslations).values({
          id: crypto.randomUUID(),
          categoryId: id,
          locale,
          name: category.name,
          slug: category.slug,
          description: category.description,
          seoTitle: category.name,
          seoDescription: category.description,
        });
      }
    }
    categoryIds.set(category.slug, existing[0]?.categoryId ?? id);
  }
  let inserted = 0;
  for (const article of sampleArticles) {
    const found = await db.select().from(articleTranslations).where(eq(articleTranslations.slug, article.slug));
    if (found[0]) continue;
    const articleId = crypto.randomUUID();
    const mediaId = crypto.randomUUID();
    await db.insert(mediaAssets).values({
      id: mediaId,
      url: article.image,
      storageKey: `sample/${article.slug}`,
      alt: article.alt,
      caption: "Sample cover",
      mimeType: "image/jpeg",
      sizeBytes: 0,
    });
    await db.insert(articles).values({
      id: articleId,
      categoryId: categoryIds.get(article.category) ?? null,
      featuredImageId: mediaId,
      featured: article.featured,
      displayAuthor: article.author,
    });
    for (const locale of ["en", "te", "hi"]) {
      await db.insert(articleTranslations).values({
        id: crypto.randomUUID(),
        articleId,
        locale,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        seoTitle: article.title,
        seoDescription: article.excerpt,
        status: "published",
        publishedAt: new Date(`${article.date}T08:00:00.000Z`),
      });
    }
    inserted += 1;
  }
  const showcase = sampleArticles.find((item) => item.slug === "safer-perioperative-handover");
  if (showcase) {
    const rows = await db.select().from(articleTranslations).where(eq(articleTranslations.slug, showcase.slug));
    for (const row of rows) {
      await db.update(articleTranslations).set({ title: showcase.title, excerpt: showcase.excerpt, content: showcase.content, seoTitle: showcase.title, seoDescription: showcase.excerpt }).where(eq(articleTranslations.id, row.id));
      await db.update(articles).set({ displayAuthor: "Pratap Insights Editorial", featured: true }).where(eq(articles.id, row.articleId));
      const existingRefs = await db.select().from(articleReferences).where(eq(articleReferences.articleId, row.articleId));
      if (existingRefs.length === 0 && row.locale === "en") {
        const refs = [
          "Author. Title of the source. Journal, year. (Replace with a verified citation.)",
          "Author. Title of the source. Journal, year. (Replace with a verified citation.)",
          "Author. Title of the source. Journal, year. (Replace with a verified citation.)",
        ];
        for (const [index, title] of refs.entries()) {
          await db.insert(articleReferences).values({ id: crypto.randomUUID(), articleId: row.articleId, sortOrder: index, title, author: "", publishedOn: "", sourceUrl: "", details: "" });
        }
      }
    }
  }
  await sql.end();
  console.log(`Sample content ready. Inserted ${inserted} articles.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Seed failed.");
  process.exit(1);
});
