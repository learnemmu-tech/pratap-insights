"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export function SignedInRedirect({ href }: { href: string }) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const sent = useRef(false);
  useEffect(() => {
    const path = href.split("?")[0];
    if (!isSignedIn || sent.current || window.location.pathname === path) return;
    if (window.sessionStorage.getItem("pi-signed-in-redirect") === href) return;
    sent.current = true;
    window.sessionStorage.setItem("pi-signed-in-redirect", href);
    router.replace(href);
  }, [href, isSignedIn, router]);
  return null;
}
