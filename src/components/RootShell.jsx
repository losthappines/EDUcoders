import { Inter, JetBrains_Mono } from "next/font/google";
import { PlatformProvider } from "@/context/PlatformContext";
import { RouteLanguageProvider } from "@/context/LanguageContext";
import { AppShell } from "@/components/AppShell";
import {
  SafeErrorBoundary,
  TelemetryAndErrorMonitor,
} from "@/components/TelemetryAndErrorMonitor";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const CLIENT_PREFS_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('onacare_theme');if(t!=='dark'&&t!=='light'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.classList.toggle('dark',t==='dark');var p=window.location&&window.location.pathname||'';var l;if(p==='/ru'||p.indexOf('/ru/')===0){l='ru';}else if(p==='/en'||p.indexOf('/en/')===0){l='en';}else{l=localStorage.getItem('onacare_lang');if(l!=='uz'&&l!=='ru'&&l!=='en'){var nl=(navigator.languages&&navigator.languages[0])||navigator.language||'';nl=String(nl).toLowerCase();l=nl.indexOf('ru')===0?'ru':nl.indexOf('en')===0?'en':'uz';}}document.documentElement.lang=l;}catch(e){}})();`;

export function RootShell({ lang = "uz", children }) {
  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: CLIENT_PREFS_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors duration-200">
        <SafeErrorBoundary>
          <RouteLanguageProvider initialLang={lang}>
            <PlatformProvider>
              <AppShell>{children}</AppShell>
            </PlatformProvider>
          </RouteLanguageProvider>
        </SafeErrorBoundary>
        <TelemetryAndErrorMonitor />
      </body>
    </html>
  );
}
