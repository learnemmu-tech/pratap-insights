import { createClerkClient } from "@clerk/nextjs/server";
import { isDesignatedAdmin, normalizeEmail } from "../src/lib/admin-access";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const secret = process.env.CLERK_SECRET_KEY;
  if (!email || !secret) throw new Error("Set ADMIN_EMAIL and CLERK_SECRET_KEY.");
  if (!isDesignatedAdmin(normalizeEmail(email), true)) throw new Error("This address is not the designated administrator.");
  const clerk = createClerkClient({ secretKey: secret });
  const matches = await clerk.users.getUserList({ emailAddress: [email] });
  const account = matches.data[0];
  if (!account) throw new Error("Create the administrator account in Clerk before assigning the role.");
  await clerk.users.updateUserMetadata(account.id, { publicMetadata: { role: "admin" } });
  console.log("Administrator role assigned in Clerk public metadata.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Administrator setup failed.");
  process.exit(1);
});
