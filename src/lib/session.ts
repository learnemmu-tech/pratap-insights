import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { user } from "@/db/schema";
import { isDesignatedAdmin, normalizeEmail } from "./admin-access";

export type AppSession = {
  user: {
    id: string;
    name: string;
    email: string;
    role?: string | null;
    banned?: boolean | null;
    emailVerified: boolean;
  };
};

export async function getSession() {
  const { userId } = await auth();
  if (!userId) return null;
  const clerkUser = await currentUser();
  if (!clerkUser) return null;
  const addresses = clerkUser.emailAddresses ?? [];
  const designatedVerified = addresses.some((address) =>
    isDesignatedAdmin(address.emailAddress, (address.verification?.status ?? "").toLowerCase() === "verified"),
  );
  const email = normalizeEmail(clerkUser.primaryEmailAddress?.emailAddress) || normalizeEmail(addresses.find((address) => address.verification?.status === "verified")?.emailAddress);
  const name = clerkUser.fullName || clerkUser.username || email || "Reader";
  const verified = designatedVerified || clerkUser.primaryEmailAddress?.verification?.status === "verified";
  const role = designatedVerified ? "admin" : "reader";
  const clerkSession = { user: { id: userId, name, email, role, banned: false, emailVerified: verified } };
  const db = getDb();
  if (!db || !email) return clerkSession;
  try {
    const byClerk = await db.select().from(user).where(eq(user.clerkUserId, userId));
    const existing = byClerk[0] ?? (await db.select().from(user).where(eq(user.email, email)))[0];
    if (!existing) {
      const id = crypto.randomUUID();
      await db.insert(user).values({
        id,
        clerkUserId: userId,
        name,
        email,
        emailVerified: verified,
        image: clerkUser.imageUrl,
        role,
      });
      return { user: { id, name, email, role, banned: false, emailVerified: verified } };
    }
    await db
      .update(user)
      .set({
        clerkUserId: userId,
        name,
        email,
        emailVerified: verified,
        image: clerkUser.imageUrl,
        role,
        updatedAt: new Date(),
      })
      .where(eq(user.id, existing.id));
    return {
      user: {
        id: existing.id,
        name,
        email,
        role,
        banned: existing.banned,
        emailVerified: verified,
      },
    };
  } catch {
    return clerkSession;
  }
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session?.user?.emailVerified || session.user.role !== "admin" || session.user.banned) return null;
  return session;
}
