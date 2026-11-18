import "../globals.css";
import { RootShell } from "@/components/RootShell";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://edu-coders.vercel.app";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "OnaCare — 24 soatlik uyda shifokor patronaji | Tug'ruqdan keyingi parvarish",
    template: "%s | OnaCare",
  },
  description:
    "Tug'ruqdan keyin uyga qaytdingizmi? Hamkor poliklinikangizdagi oilaviy shifokor 24 soat ichida uyingizga tashrif buyuradi. O'zbek, rus va ingliz tillarida shaxsiy parvarish kabineti.",
  keywords: [
    "OnaCare",
    "uyda patronaj",
    "tug'ruqdan keyingi parvarish",
    "oilaviy shifokor",
    "24 soatlik tashrif",
    "maternal patronage",
    "Uzbekistan healthcare",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "OnaCare",
    title: "OnaCare — 24 soatlik uyda shifokor patronaji",
    description:
      "Tug'ruqdan keyingi 24 soatlik uy patronaji: siz va chaqalog'ingiz uchun hamkor poliklinikadan uy tashrifi va kunlik parvarish yordami.",
    locale: "uz_UZ",
    alternateLocale: ["ru_RU", "en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "OnaCare — 24 soatlik oilaviy shifokor patronaji",
    description:
      "Tug'ruqdan keyin uyga qaytdingizmi? Oilaviy shifokor 24 soat ichida uyingizga tashrif buyuradi.",
  },
};

export default function UzRootLayout({ children }) {
  return <RootShell lang="uz">{children}</RootShell>;
}
