const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://edu-coders.vercel.app";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/ru", "/en", "/privacy", "/terms", "/technology", "/login", "/signup"],
        disallow: ["/api/", "/patient", "/clinical", "/admin"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
