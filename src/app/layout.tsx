import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { PlatformProvider } from "@/context/PlatformContext";
import { AppShell } from "@/components/AppShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://edu-coders.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "OnaCare AI — Automated Maternal Patronage & 24h Continuity of Care",
    template: "%s | OnaCare AI",
  },
  description:
    "AI-driven hospital-to-polyclinic discharge handoff and mandatory 24-hour family doctor patronage platform for OvaBMU maternal/perinatal care in Uzbekistan.",
  keywords: [
    "OnaCare AI",
    "maternal patronage",
    "OvaBMU",
    "continuity of care",
    "Uzbekistan healthcare",
    "HL7 FHIR R4",
    "24-hour SLA",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "OnaCare AI",
    title: "OnaCare AI — Automated Maternal Patronage & 24h Continuity of Care",
    description:
      "Zero-gap 24-hour hospital-to-polyclinic discharge handoff, AI symptom triage, and family doctor patronage verification for Uzbekistan maternal healthcare.",
    locale: "en_US",
    alternateLocale: ["uz_UZ", "ru_RU"],
  },
  twitter: {
    card: "summary_large_image",
    title: "OnaCare AI — Automated Maternal Patronage System",
    description:
      "AI-driven OvaBMU discharge handoff and 24-hour regional family doctor patronage continuity platform.",
  },
};

const CLIENT_PREFS_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('onacare_theme');if(t!=='dark'&&t!=='light'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.classList.toggle('dark',t==='dark');var l=localStorage.getItem('onacare_lang');if(l==='uz'||l==='ru'||l==='en'){document.documentElement.lang=l;}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
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
