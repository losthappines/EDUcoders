import "../globals.css";
import { RootShell } from "@/components/RootShell";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://edu-coders.vercel.app";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "OnaCare — Postpartum Home Care & Doctor Visit Within 24 Hours",
    template: "%s | OnaCare",
  },
  description:
    "Going home after childbirth? A local family doctor or monitoring nurse visits within 24 hours, plus encrypted daily health check-ins in UZ, RU & EN.",
  openGraph: {
    type: "website",
    url: `${SITE_URL}/en`,
    siteName: "OnaCare",
    title: "OnaCare — Home Care & Family Doctor Visit Within 24 Hours",
    description:
      "Postpartum home follow-up for mothers and newborns with participating local family clinics.",
    locale: "en_US",
    alternateLocale: ["uz_UZ", "ru_RU"],
  },
  twitter: {
    card: "summary_large_image",
    title: "OnaCare — 24-Hour Postpartum Home Care",
    description:
      "Going home after birth? A local doctor visits within 24 hours.",
  },
};

export default function EnRootLayout({ children }) {
  return <RootShell lang="en">{children}</RootShell>;
}
