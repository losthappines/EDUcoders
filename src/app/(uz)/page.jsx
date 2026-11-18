import { LandingPageClient } from "@/components/LandingPageClient";

export const metadata = {
  alternates: {
    canonical: "/",
    languages: {
      uz: "/",
      ru: "/ru",
      en: "/en",
      "x-default": "/",
    },
  },
};

export default function HomePage() {
  return <LandingPageClient />;
}
