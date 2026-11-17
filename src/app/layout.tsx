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

export const metadata: Metadata = {
  title: "OnaCare AI — Avtomatlashtirilgan Patronaj Tizimi (Continuity of Care)",
  description:
    "AI-driven hospital-to-polyclinic discharge handoff and mandatory 24-hour family doctor patronage platform for OvaBMU maternal/perinatal care in Uzbekistan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 text-slate-900 font-sans">
        <PlatformProvider>
          <AppShell>{children}</AppShell>
        </PlatformProvider>
      </body>
    </html>
  );
}
