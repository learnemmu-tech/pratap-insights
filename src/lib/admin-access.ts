const INITIAL_ADMIN_EMAIL = "learnemmu@gmail.com";

export function normalizeEmail(email: string | null | undefined) {
  return (email ?? "").trim().toLowerCase();
}

export function isDesignatedAdmin(email: string | null | undefined, emailVerified: boolean) {
  return emailVerified && normalizeEmail(email) === INITIAL_ADMIN_EMAIL;
}
