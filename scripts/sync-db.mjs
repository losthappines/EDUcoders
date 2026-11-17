import { execSync } from "node:child_process";

const DIRECT_DB_ENV_KEYS = [
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_URL_UNPOOLED",
  "DIRECT_URL",
  "STORAGE_POSTGRES_URL_NON_POOLING",
  "STORAGE_URL_NON_POOLING",
  "SUPABASE_DB_URL",
];

const FALLBACK_DB_ENV_KEYS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "NEON_DATABASE_URL",
  "STORAGE_DATABASE_URL",
  "STORAGE_POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "PRISMA_DATABASE_URL",
  "STORAGE_PRISMA_DATABASE_URL",
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

function isPostgresUrl(val) {
  return (
    typeof val === "string" &&
    (val.startsWith("postgres://") || val.startsWith("postgresql://"))
  );
}

function isTransactionPoolerUrl(val) {
  return val.includes(":6543") || /[?&]pgbouncer=true\b/i.test(val);
}

function findDirectPostgresUrl() {
  for (const key of DIRECT_DB_ENV_KEYS) {
    const val = cleanEnvValue(process.env[key]);
    if (isPostgresUrl(val) && !isTransactionPoolerUrl(val)) {
      return { key, url: val };
    }
  }
  for (const key of FALLBACK_DB_ENV_KEYS) {
    const val = cleanEnvValue(process.env[key]);
    if (isPostgresUrl(val) && !isTransactionPoolerUrl(val)) {
      return { key, url: val };
    }
  }
  for (const [key, raw] of Object.entries(process.env)) {
    const val = cleanEnvValue(raw);
    if (isPostgresUrl(val) && !isTransactionPoolerUrl(val)) {
      return { key, url: val };
    }
  }
  return null;
}

const found = findDirectPostgresUrl();

if (found) {
  console.log(`[sync-db] Direct PostgreSQL URL detected via ${found.key}. Running prisma db push...`);
  try {
    execSync("npx prisma db push --skip-generate", {
      stdio: "inherit",
      timeout: 20000,
      env: { ...process.env, DATABASE_URL: found.url },
    });
    console.log("[sync-db] Database schema is in sync.");
  } catch (err) {
    console.warn(
      "[sync-db] Warning: prisma db push did not complete during build; runtime ensureSeeded() will reconcile schema.",
      err instanceof Error ? err.message : err
    );
  }
} else {
  console.log(
    "[sync-db] Skipping prisma db push (no non-pooling PostgreSQL URL in build env; runtime ensureSeeded() will reconcile schema)."
  );
}
