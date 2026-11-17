import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://edu-coders.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/signup", "/forgot-password"],
        disallow: ["/api/", "/patient", "/clinical", "/admin"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
