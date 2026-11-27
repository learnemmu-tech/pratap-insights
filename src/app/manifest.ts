import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dr. Pratap",
    short_name: "Dr. Pratap",
    description: "Medical knowledge and professional insights.",
    start_url: "/en",
    display: "standalone",
    background_color: "#F7F8FA",
    theme_color: "#1c2b3a",
    icons: [{ src: "/pratap-insights-logo.jpg", sizes: "any", type: "image/jpeg", purpose: "any" }],
  };
}
