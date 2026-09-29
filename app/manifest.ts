import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RETROH Dashboard",
    short_name: "RETROH",
    description: "Waitlist, contacts, feedback, and analytics for RETROH",
    start_url: "/",
    display: "standalone",
    background_color: "#1a0a00",
    theme_color: "#1a0a00",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
