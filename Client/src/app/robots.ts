import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Rooms are private by nature (code/password-gated) — no reason for
        // them to get crawled or show up in search results.
        disallow: ["/rooms/", "/account/", "/auth/"],
      },
    ],
    sitemap: "https://spillit.xyz/sitemap.xml",
  };
}
