import { execSync } from "node:child_process";

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

function cleanEnvValue(val) {
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

function findPostgresUrl() {
  for (const key of KNOWN_DB_ENV_KEYS) {
    const val = cleanEnvValue(process.env[key]);
    if (val && (val.startsWith("postgres://") || val.startsWith("postgresql://"))) {
      return { key, url: val };
    }
  }
  for (const [key, raw] of Object.entries(process.env)) {
    const val = cleanEnvValue(raw);
    if (val && (val.startsWith("postgres://") || val.startsWith("postgresql://"))) {
      return { key, url: val };
    }
  }
  return null;
}

const found = findPostgresUrl();

if (found) {
  console.log(`[sync-db] PostgreSQL URL detected via ${found.key}. Running prisma db push...`);
  try {
    execSync("npx prisma db push --skip-generate", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: found.url },
    });
    console.log("[sync-db] Database schema is in sync.");
  } catch (err) {
    console.warn(
      "[sync-db] Warning: prisma db push failed during build; runtime ensureSeeded() will reconcile schema.",
      err instanceof Error ? err.message : err
    );
  }
} else {
  console.log("[sync-db] Skipping prisma db push (no PostgreSQL URL in build env).");
}
