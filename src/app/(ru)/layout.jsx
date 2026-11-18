import "../globals.css";
import { RootShell } from "@/components/RootShell";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://edu-coders.vercel.app";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "OnaCare — Патронаж и визит семейного врача на дом за 24 часа",
    template: "%s | OnaCare",
  },
  description:
    "Выписываетесь после родов домой? Семейный врач из поликлиники навестит вас и малыша в течение 24 часов. Удобный дневник самочувствия на русском, узбекском и английском.",
  openGraph: {
    type: "website",
    url: `${SITE_URL}/ru`,
    siteName: "OnaCare",
    title: "OnaCare — Домашний уход и визит врача за 24 часа",
    description:
      "Послеродовая поддержка мам и малышей на дому: визит семейного врача в течение 24 часов и ежедневный контроль самочувствия.",
    locale: "ru_RU",
    alternateLocale: ["uz_UZ", "en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "OnaCare — Визит семейного врача на дом за 24 часа",
    description:
      "Выписываетесь после родов домой? Семейный врач навестит вас и малыша в течение 24 часов.",
  },
};

export default function RuRootLayout({ children }) {
  return <RootShell lang="ru">{children}</RootShell>;
}
