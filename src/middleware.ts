import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);
const isReaderRoute = createRouteMatcher(["/(en|te|hi)/profile(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)", "/api/media(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (isReaderRoute(request) || isAdminRoute(request)) await auth.protect();
  const path = request.nextUrl.pathname;
  if (path.startsWith("/admin") || path.startsWith("/api")) return;
  return intlMiddleware(request);
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
