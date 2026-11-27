ALTER TABLE "user" ADD COLUMN "clerk_user_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_clerk_user_id_unique" UNIQUE("clerk_user_id");