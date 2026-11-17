import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  __prisma?: PrismaClient;
};

const KNOWN_DB_ENV_KEYS = [
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_URL_UNPOOLED",
  "NEON_DATABASE_URL",
  "PRISMA_DATABASE_URL",
  "STORAGE_PRISMA_DATABASE_URL",
  "STORAGE_DATABASE_URL",
  "STORAGE_POSTGRES_URL",
  "SUPABASE_DB_URL",
];

function cleanEnvValue(val: string | undefined): string | undefined {
  if (typeof val !== "string") return undefined;
  let cleaned = val.trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned || undefined;
}

function isPostgresUrl(val: string | undefined): val is string {
  return (
    typeof val === "string" &&
    (val.startsWith("postgres://") || val.startsWith("postgresql://"))
  );
}

function normalizeRuntimePostgresUrl(url: string): string {
  if (url.includes(":6543") && !/[?&]pgbouncer=true\b/i.test(url)) {
    return `${url}${url.includes("?") ? "&" : "?"}pgbouncer=true`;
  }
  return url;
}

export function getDatabaseConfigInfo(): {
  url: string | undefined;
  envKey: string | null;
  isPostgres: boolean;
  detectedKeys: string[];
} {
  const detectedKeys = Object.entries(process.env)
    .filter(
      ([key]) =>
        /(DATABASE|POSTGRES|PRISMA|NEON|SUPABASE)/i.test(key) &&
        !/OBJECT_STORAGE/i.test(key)
    )
    .map(([key, raw]) => {
      const cleaned = cleanEnvValue(raw);
      if (!cleaned) return `${key}:empty`;
      const schemeIdx = cleaned.indexOf("://");
      const scheme = schemeIdx > 0 ? cleaned.slice(0, schemeIdx + 3) : "set";
      return `${key}:${scheme}`;
    });

  for (const key of KNOWN_DB_ENV_KEYS) {
    const val = cleanEnvValue(process.env[key]);
    if (isPostgresUrl(val)) {
      return {
        url: normalizeRuntimePostgresUrl(val),
        envKey: key,
        isPostgres: true,
        detectedKeys,
      };
    }
  }

  for (const [key, raw] of Object.entries(process.env)) {
    const val = cleanEnvValue(raw);
    if (isPostgresUrl(val)) {
      return {
        url: normalizeRuntimePostgresUrl(val),
        envKey: key,
        isPostgres: true,
        detectedKeys,
      };
    }
  }

  const fallback = cleanEnvValue(process.env.DATABASE_URL);
  return {
    url: fallback,
    envKey: fallback ? "DATABASE_URL" : null,
    isPostgres: isPostgresUrl(fallback),
    detectedKeys,
  };
}

const dbConfig = getDatabaseConfigInfo();

// Ensure PrismaClient internal schema check finds DATABASE_URL when Vercel
// exposes POSTGRES_PRISMA_URL, STORAGE_DATABASE_URL, or NEON_DATABASE_URL instead.
if (dbConfig.url && dbConfig.isPostgres && process.env.DATABASE_URL !== dbConfig.url) {
  process.env.DATABASE_URL = dbConfig.url;
}

export const prisma =
  globalForPrisma.__prisma ??
  new PrismaClient({
    ...(dbConfig.url ? { datasources: { db: { url: dbConfig.url } } } : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma;
}
