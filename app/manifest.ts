import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Premium Tech Store`,
    short_name: SITE_NAME,
    description: "Premium gadgets, verified originals, and fast delivery across Nigeria.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#070b18",
    theme_color: "#3f6bfd",
    categories: ["shopping", "lifestyle", "business"],
    icons: [
      {
        src: "/pwa-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/pwa-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/pwa-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
