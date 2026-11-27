import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { categories, categoryTranslations, doctorProfiles, siteSettings } from "../src/db/schema";

const subjects = [
  ["Anaesthesiology", "అనస్థీషియాలజీ", "एनेस्थिसियोलॉजी"],
  ["Critical Care", "క్రిటికల్ కేర్", "क्रिटिकल केयर"],
  ["Perioperative Medicine", "పెరిఆపరేటివ్ మెడిసిన్", "पेरिऑपरेटिव मेडिसिन"],
  ["Pain Management", "నొప్పి నిర్వహణ", "दर्द प्रबंधन"],
  ["Patient Safety", "రోగి భద్రత", "रोगी सुरक्षा"],
  ["Medical Education", "వైద్య విద్య", "चिकित्सा शिक्षा"],
  ["Clinical Insights", "క్లినికల్ అంతర్దృష్టులు", "नैदानिक अंतर्दृष्टि"],
  ["Research & Publications", "పరిశోధన మరియు ప్రచురణలు", "शोध और प्रकाशन"],
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required.");
  const sql = postgres(url, { max: 1 });
  const db = drizzle(sql);
  const existing = await db.select().from(categories);
  if (existing.length === 0) {
    for (const [index, names] of subjects.entries()) {
      const id = crypto.randomUUID();
      await db.insert(categories).values({ id, sortOrder: index + 1 });
      const slugs = ["anaesthesiology", "critical-care", "perioperative-medicine", "pain-management", "patient-safety", "medical-education", "clinical-insights", "research-publications"];
      for (const [localeIndex, locale] of ["en", "te", "hi"].entries()) {
        await db.insert(categoryTranslations).values({
          id: crypto.randomUUID(),
          categoryId: id,
          locale,
          name: names[localeIndex],
          slug: slugs[index],
          description: "",
        });
      }
    }
  }
  const settings = await db.select().from(siteSettings);
  if (!settings[0]) {
    await db.insert(siteSettings).values({ id: "site", brandName: "Dr. Pratap" });
  }
  const profiles = await db.select().from(doctorProfiles);
  if (!profiles[0]) await db.insert(doctorProfiles).values({ id: crypto.randomUUID() });
  await sql.end();
  console.log("Seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
