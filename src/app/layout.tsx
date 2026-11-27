import { ClerkProvider } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";
import type { Metadata, Viewport } from "next";
import { Manrope, Noto_Sans_Devanagari, Noto_Sans_Telugu, Source_Sans_3, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", weight: ["400", "500", "600", "700"] });
const sourceSans = Source_Sans_3({ subsets: ["latin"], variable: "--font-source-sans", weight: ["400", "500", "600"] });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-source-serif", weight: ["500", "600"] });
const telugu = Noto_Sans_Telugu({ subsets: ["telugu"], variable: "--font-telugu" });
const devanagari = Noto_Sans_Devanagari({ subsets: ["devanagari"], variable: "--font-devanagari" });

export const metadata: Metadata = {
  title: { default: "Pratap Insights", template: "%s · Pratap Insights" },
  description: "Medical knowledge, professional insights and clinical perspectives.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
};

export const viewport: Viewport = { themeColor: "#07574F" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${sourceSans.variable} ${sourceSerif.variable} ${telugu.variable} ${devanagari.variable}`}>
      <body className={`${manrope.className} min-h-screen text-[17px] leading-[1.65] antialiased`}>
        <ClerkProvider
          appearance={clerkAppearance}
          localization={{ signIn: { start: { title: "Welcome back", subtitle: "Sign in to your Pratap Insights account." } } }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
