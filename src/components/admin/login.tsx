"use client";

import { SignIn } from "@clerk/nextjs";

export function AdminLogin() {
  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <h1 className="font-display text-4xl text-navy">Administrator</h1>
      <p className="mt-3 text-sm text-muted">Only the configured administrator account can enter. Email and password are managed by Clerk.</p>
      <div className="mt-8">
        <SignIn routing="hash" forceRedirectUrl="/admin" />
      </div>
    </div>
  );
}
