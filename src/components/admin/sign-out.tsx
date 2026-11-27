"use client";

import { useClerk } from "@clerk/nextjs";

export function AdminSignOut() {
  const { signOut } = useClerk();
  return (
    <button type="button" className="block px-2 py-2 text-left text-sm text-steel" onClick={() => signOut({ redirectUrl: "/en" })}>
      Sign out
    </button>
  );
}
