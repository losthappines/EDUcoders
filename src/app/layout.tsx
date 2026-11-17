import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { PlatformProvider } from "@/context/PlatformContext";
import { AppShell } from "@/components/AppShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin", "cyrillic"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://edu-coders.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "OnaCare — 24 soatlik uyda shifokor patronaji | Home Care After Birth",
    template: "%s | OnaCare",
  },
  description:
    "Tug'ruqdan keyin uyga qaytdingizmi? Mahallangizdagi oilaviy shifokor 24 soat ichida uyingizga tashrif buyuradi. O'zbek, rus va ingliz tillarida shaxsiy parvarish kabineti.",
  keywords: [
    "OnaCare",
    "uyda patronaj",
    "tug'ruqdan keyingi parvarish",
    "oilaviy shifokor",
    "24 soatlik tashrif",
    "maternal patronage",
    "Uzbekistan healthcare",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "OnaCare",
    title: "OnaCare — Going home after birth? A doctor visits within 24 hours.",
    description:
      "Tug'ruqdan keyingi 24 soatlik uy patronaji: siz va chaqalog'ingiz uchun mahallangizdagi poliklinikadan bepul uy tashrifi va kunlik parvarish yordami.",
    locale: "uz_UZ",
    alternateLocale: ["ru_RU", "en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "OnaCare — 24 soatlik oilaviy shifokor patronaji",
    description:
      "Tug'ruqdan keyin uyga qaytdingizmi? Mahallangizdagi oilaviy shifokor 24 soat ichida uyingizga tashrif buyuradi.",
  },
};

const CLIENT_PREFS_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('onacare_theme');if(t!=='dark'&&t!=='light'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.classList.toggle('dark',t==='dark');var l=localStorage.getItem('onacare_lang');if(l!=='uz'&&l!=='ru'&&l!=='en'){l='uz';}document.documentElement.lang=l;}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uz"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: CLIENT_PREFS_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors duration-200">
        <PlatformProvider>
          <AppShell>{children}</AppShell>
        </PlatformProvider>
      </body>
    </html>
  );
}
