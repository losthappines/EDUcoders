const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://edu-coders.vercel.app";

export default function sitemap() {
  const lastModified = new Date("2026-11-18T00:00:00.000Z");
  const alternates = {
    languages: {
      uz: SITE_URL,
      ru: `${SITE_URL}/ru`,
      en: `${SITE_URL}/en`,
    },
  };

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      alternates,
    },
    {
      url: `${SITE_URL}/ru`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.95,
      alternates,
    },
    {
      url: `${SITE_URL}/en`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.95,
      alternates,
    },
    {
      url: `${SITE_URL}/hamjamiyat`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/technology`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/signup`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
