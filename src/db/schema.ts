import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("reader"),
  banned: boolean("banned").notNull().default(false),
  clerkUserId: text("clerk_user_id").unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const categoryTranslations = pgTable(
  "category_translations",
  {
    id: text("id").primaryKey(),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description").notNull().default(""),
    seoTitle: text("seo_title").notNull().default(""),
    seoDescription: text("seo_description").notNull().default(""),
  },
  (table) => [
    uniqueIndex("category_locale_unique").on(table.categoryId, table.locale),
    uniqueIndex("category_slug_locale_unique").on(table.locale, table.slug),
  ],
);

export const articles = pgTable("articles", {
  id: text("id").primaryKey(),
  authorId: text("author_id").references(() => user.id),
  categoryId: text("category_id").references(() => categories.id),
  featuredImageId: text("featured_image_id"),
  featured: boolean("featured").notNull().default(false),
  displayAuthor: text("display_author").notNull().default("Dr. Pratap"),
  youtubeId: text("youtube_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const articleTranslations = pgTable(
  "article_translations",
  {
    id: text("id").primaryKey(),
    articleId: text("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(),
    title: text("title").notNull().default(""),
    slug: text("slug").notNull().default(""),
    subtitle: text("subtitle").notNull().default(""),
    excerpt: text("excerpt").notNull().default(""),
    content: jsonb("content").notNull().default({ type: "doc", content: [{ type: "paragraph" }] }),
    seoTitle: text("seo_title").notNull().default(""),
    seoDescription: text("seo_description").notNull().default(""),
    status: text("status").notNull().default("draft"),
    publishedAt: timestamp("published_at"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("article_locale_unique").on(table.articleId, table.locale),
    uniqueIndex("article_slug_locale_unique").on(table.locale, table.slug),
    index("article_status_idx").on(table.status, table.publishedAt),
  ],
);

export const articleReferences = pgTable("article_references", {
  id: text("id").primaryKey(),
  articleId: text("article_id")
    .notNull()
    .references(() => articles.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  title: text("title").notNull(),
  author: text("author").notNull().default(""),
  publishedOn: text("published_on").notNull().default(""),
  sourceUrl: text("source_url").notNull().default(""),
  details: text("details").notNull().default(""),
});

export const tags = pgTable(
  "tags",
  {
    id: text("id").primaryKey(),
    locale: text("locale").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
  },
  (table) => [uniqueIndex("tag_locale_slug").on(table.locale, table.slug)],
);

export const articleTags = pgTable(
  "article_tags",
  {
    articleId: text("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [uniqueIndex("article_tag_unique").on(table.articleId, table.tagId)],
);

export const mediaAssets = pgTable("media_assets", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  storageKey: text("storage_key").notNull(),
  alt: text("alt").notNull().default(""),
  caption: text("caption").notNull().default(""),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  createdBy: text("created_by").references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const comments = pgTable(
  "comments",
  {
    id: text("id").primaryKey(),
    articleId: text("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    parentId: text("parent_id"),
    body: text("body").notNull(),
    status: text("status").notNull().default("pending"),
    reported: boolean("reported").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [index("comment_article_status_idx").on(table.articleId, table.status)],
);

export const articleReactions = pgTable(
  "article_reactions",
  {
    id: text("id").primaryKey(),
    articleId: text("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("reaction_unique").on(table.articleId, table.userId, table.type)],
);

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: text("id").primaryKey(),
    articleId: text("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("bookmark_unique").on(table.articleId, table.userId)],
);

export const articleViewEvents = pgTable(
  "article_view_events",
  {
    id: text("id").primaryKey(),
    articleId: text("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    visitorHash: text("visitor_hash").notNull(),
    viewDay: text("view_day").notNull(),
    engaged: boolean("engaged").notNull().default(false),
    referrer: text("referrer"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("view_article_idx").on(table.articleId, table.createdAt),
    uniqueIndex("view_daily_unique").on(table.articleId, table.visitorHash, table.viewDay),
  ],
);

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  status: text("status").notNull().default("pending"),
  locale: text("locale").notNull().default("en"),
  consentAt: timestamp("consent_at"),
  confirmToken: text("confirm_token"),
  unsubscribeToken: text("unsubscribe_token").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
  unsubscribedAt: timestamp("unsubscribed_at"),
});

export const newsletterCampaigns = pgTable("newsletter_campaigns", {
  id: text("id").primaryKey(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  sentAt: timestamp("sent_at"),
});

export const emailOutbox = pgTable("email_outbox", {
  id: text("id").primaryKey(),
  toAddress: text("to_address").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull().default("queued"),
  providerId: text("provider_id"),
  error: text("error"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const doctorProfiles = pgTable("doctor_profiles", {
  id: text("id").primaryKey(),
  portraitId: text("portrait_id"),
  coverId: text("cover_id"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const doctorProfileTranslations = pgTable(
  "doctor_profile_translations",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => doctorProfiles.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(),
    name: text("name").notNull().default(""),
    title: text("title").notNull().default(""),
    introduction: text("introduction").notNull().default(""),
    biography: text("biography").notNull().default(""),
    education: jsonb("education").notNull().default([]),
    qualifications: jsonb("qualifications").notNull().default([]),
    experience: jsonb("experience").notNull().default([]),
    expertise: jsonb("expertise").notNull().default([]),
    achievements: jsonb("achievements").notNull().default([]),
    researchInterests: jsonb("research_interests").notNull().default([]),
    memberships: jsonb("memberships").notNull().default([]),
    contactEmail: text("contact_email").notNull().default(""),
    contactPhone: text("contact_phone").notNull().default(""),
    socialLinks: jsonb("social_links").notNull().default([]),
  },
  (table) => [uniqueIndex("profile_locale_unique").on(table.profileId, table.locale)],
);

export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey(),
  brandName: text("brand_name").notNull().default("Dr. Pratap"),
  descriptor: text("descriptor").notNull().default("Medical Knowledge"),
  defaultLocale: text("default_locale").notNull().default("en"),
  contactEmail: text("contact_email").notNull().default(""),
  featuredArticleId: text("featured_article_id"),
  homepage: jsonb("homepage").notNull().default({}),
  legal: jsonb("legal").notNull().default({}),
  seo: jsonb("seo").notNull().default({}),
  socialLinks: jsonb("social_links").notNull().default([]),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  actorId: text("actor_id"),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const rateLimits = pgTable(
  "rate_limits",
  {
    id: text("id").primaryKey(),
    key: text("key").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("rate_limit_key_idx").on(table.key, table.createdAt)],
);
