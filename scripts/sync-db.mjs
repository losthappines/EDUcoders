import { execSync } from "node:child_process";

const dbUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL ||
  "";

if (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://")) {
  console.log("[sync-db] PostgreSQL URL detected. Running prisma db push...");
  try {
    execSync("npx prisma db push --skip-generate", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: dbUrl },
    });
    console.log("[sync-db] Database schema is in sync.");
  } catch (err) {
    console.warn(
      "[sync-db] Warning: prisma db push failed during build; runtime ensureSeeded() will reconcile auth columns.",
      err instanceof Error ? err.message : err
    );
  }
} else {
  console.log("[sync-db] Skipping prisma db push (no PostgreSQL URL in build env).");
}
