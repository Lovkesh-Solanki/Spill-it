import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SpillIt — Truth or Dare",
    short_name: "SpillIt",
    description: "Spin, choose, spill. A Truth or Dare game for you and your friends.",
    start_url: "/",
    display: "standalone",
    background_color: "#0c0915",
    theme_color: "#14101f",
    orientation: "portrait-primary",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
