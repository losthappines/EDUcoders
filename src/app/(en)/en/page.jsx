import { LandingPageClient } from "@/components/LandingPageClient";

export const metadata = {
  title: "OnaCare — Postpartum Home Care & Doctor Visit Within 24 Hours",
  description:
    "Going home after birth? A local family doctor visits within 24 hours, with private daily symptom check-ins for mothers and babies.",
  alternates: {
    canonical: "/en",
    languages: {
      uz: "/",
      ru: "/ru",
      en: "/en",
      "x-default": "/",
    },
  },
};

export default function EnglishHomePage() {
  return <LandingPageClient />;
}
