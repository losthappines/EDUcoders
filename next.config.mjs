const isDev = process.env.NODE_ENV === "development";

const baseDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com https://telegram.org`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com https://telegram.org",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
];

const strictCsp = [...baseDirectives, "frame-ancestors 'none'"].join("; ");
const tgMiniAppCsp = [...baseDirectives, "frame-ancestors 'self' https://web.telegram.org https://*.telegram.org"].join("; ");

const commonSecurityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/((?!tg(?:/|$)).*)",
        headers: [
          { key: "Content-Security-Policy", value: strictCsp },
          { key: "X-Frame-Options", value: "DENY" },
          ...commonSecurityHeaders,
        ],
      },
      {
        source: "/tg",
        headers: [
          { key: "Content-Security-Policy", value: tgMiniAppCsp },
          ...commonSecurityHeaders,
        ],
      },
      {
        source: "/tg/:path*",
        headers: [
          { key: "Content-Security-Policy", value: tgMiniAppCsp },
          ...commonSecurityHeaders,
        ],
      },
    ];
  },
};

export default nextConfig;
