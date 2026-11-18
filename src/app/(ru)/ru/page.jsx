import { LandingPageClient } from "@/components/LandingPageClient";

export const metadata = {
  title: "OnaCare — Домашний патронаж и визит врача за 24 часа",
  description:
    "Выписываетесь после родов домой? Семейный врач из вашей поликлиники придет к вам в течение 24 часов. Безопасный дневник самочувствия для мам.",
  alternates: {
    canonical: "/ru",
    languages: {
      uz: "/",
      ru: "/ru",
      en: "/en",
      "x-default": "/",
    },
  },
};

export default function RussianHomePage() {
  return <LandingPageClient />;
}
