ALTER TABLE "articles" ADD COLUMN "display_author" text DEFAULT 'Dr. Pratap' NOT NULL;
ALTER TABLE "articles" ADD COLUMN "youtube_id" text;
CREATE TABLE "article_references" (
  "id" text PRIMARY KEY NOT NULL,
  "article_id" text NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "title" text NOT NULL,
  "author" text DEFAULT '' NOT NULL,
  "published_on" text DEFAULT '' NOT NULL,
  "source_url" text DEFAULT '' NOT NULL,
  "details" text DEFAULT '' NOT NULL
);
ALTER TABLE "article_references" ADD CONSTRAINT "article_references_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
