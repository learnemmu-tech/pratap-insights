"use server";

import { getSession } from "@/lib/session";

export async function currentAdminAccess() {
  const session = await getSession();
  return Boolean(session?.user.role === "admin" && session.user.emailVerified && !session.user.banned);
}

export async function adminSignInRoute() {
  const allowed = await currentAdminAccess();
  return allowed ? "/admin" : null;
}
