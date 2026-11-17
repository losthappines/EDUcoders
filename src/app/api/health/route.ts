import { NextResponse, connection } from "next/server";
import { getDatabaseConfigInfo, prisma } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed-data";

export async function GET() {
  await connection();
  const dbInfo = getDatabaseConfigInfo();

  if (!dbInfo.url || !dbInfo.isPostgres) {
    return NextResponse.json(
      {
        ok: false,
        dbConfigured: false,
        dbEnvKey: dbInfo.envKey,
        dbConnected: false,
        code: "DB_NOT_CONFIGURED",
        message:
          "No PostgreSQL DATABASE_URL found in server environment variables.",
      },
      { status: 503 }
    );
  }

  try {
    await ensureSeeded();
    const userCount = await prisma.user.count();
    return NextResponse.json({
      ok: true,
      dbConfigured: true,
      dbEnvKey: dbInfo.envKey,
      dbConnected: true,
      userCount,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        ok: false,
        dbConfigured: true,
        dbEnvKey: dbInfo.envKey,
        dbConnected: false,
        code: "DB_UNREACHABLE",
        message: errMsg.slice(0, 220),
      },
      { status: 503 }
    );
  }
}
