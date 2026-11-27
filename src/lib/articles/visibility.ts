export type PublicationStatus = "draft" | "in_review" | "scheduled" | "published" | "archived";

export function isPubliclyVisible(input: {
  status: PublicationStatus;
  publishedAt: Date | null;
  now?: Date;
}) {
  if (!input.publishedAt) return false;
  const now = input.now ?? new Date();
  if (input.publishedAt.getTime() > now.getTime()) return false;
  return input.status === "published" || input.status === "scheduled";
}

export function isCommentPublic(status: string) {
  return status === "approved";
}
