"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { User } from "lucide-react";
import { useRef } from "react";
import { clerkAppearance } from "@/lib/clerk-appearance";

export function SignInModalButton({ label }: { label: string }) {
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const buttonRef = useRef<HTMLButtonElement>(null);

  if (isSignedIn) return null;

  return (
    <button
      ref={buttonRef}
      type="button"
      className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#0B6E66] px-3 text-sm font-semibold text-white transition-colors hover:bg-[#085E58] sm:px-4"
      onClick={() => {
        window.sessionStorage.setItem("pi-signin-intent", "1");
        void openSignIn({
          appearance: clerkAppearance,
          fallbackRedirectUrl: window.location.href,
          signUpFallbackRedirectUrl: window.location.href,
        });
      }}
    >
      <User size={16} strokeWidth={1.75} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
