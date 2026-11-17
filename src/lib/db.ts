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

function isPostgresUrl(val: string | undefined): val is string {
  return (
    typeof val === "string" &&
    (val.startsWith("postgres://") || val.startsWith("postgresql://"))
  );
}

export function getDatabaseConfigInfo(): {
  url: string | undefined;
  envKey: string | null;
  isPostgres: boolean;
} {
  for (const key of KNOWN_DB_ENV_KEYS) {
    const val = process.env[key];
    if (isPostgresUrl(val)) {
      return { url: val, envKey: key, isPostgres: true };
    }
  }

  for (const [key, val] of Object.entries(process.env)) {
    if (isPostgresUrl(val)) {
      return { url: val, envKey: key, isPostgres: true };
    }
  }

  const fallback = process.env.DATABASE_URL;
  return {
    url: fallback,
    envKey: fallback ? "DATABASE_URL" : null,
    isPostgres: isPostgresUrl(fallback),
  };
}

const dbConfig = getDatabaseConfigInfo();

// Ensure PrismaClient internal schema check finds DATABASE_URL when Vercel
// exposes POSTGRES_PRISMA_URL, STORAGE_DATABASE_URL, or NEON_DATABASE_URL instead.
if (dbConfig.url && !process.env.DATABASE_URL) {
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
