import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://edu-coders.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-01-01T00:00:00.000Z");
  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/signup`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/forgot-password`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}
