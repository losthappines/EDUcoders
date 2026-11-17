import { NextRequest, NextResponse } from "next/server";
import { getDatabaseConfigInfo, prisma } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed-data";
import {
  clearSessionCookie,
  getPortalPathForRole,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import type { UserRole } from "@/lib/types";

export async function POST(req: NextRequest) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = (await req.json()) as { email?: unknown; password?: unknown };
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 }
    );
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  const dbInfo = getDatabaseConfigInfo();
  if (!dbInfo.url || !dbInfo.isPostgres) {
    return NextResponse.json(
      {
        error:
          "Database is not connected on this deployment (missing PostgreSQL DATABASE_URL).",
        code: "DB_NOT_CONFIGURED",
      },
      { status: 503 }
    );
  }

  try {
    await ensureSeeded();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Incorrect email or password." },
        { status: 401 }
      );
    }

    if (user.verificationStatus === "PENDING") {
      const res = NextResponse.json(
        {
          error:
            "Your account is awaiting administrator verification before you can sign in.",
          code: "PENDING_VERIFICATION",
          verificationStatus: "PENDING",
        },
        { status: 403 }
      );
      clearSessionCookie(res);
      return res;
    }

    if (user.verificationStatus === "REJECTED") {
      const res = NextResponse.json(
        {
          error:
            "Your registration was declined by the administrator.",
          code: "VERIFICATION_REJECTED",
          verificationStatus: "REJECTED",
          reason: user.verificationNote || null,
        },
        { status: 403 }
      );
      clearSessionCookie(res);
      return res;
    }

    const redirectTo = getPortalPathForRole(user.role as UserRole);
    const res = NextResponse.json({
      success: true,
      redirectTo,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        polyclinicId: user.polyclinicId,
        polyclinicName: user.polyclinicName,
        district: user.district,
      },
    });
    setSessionCookie(res, user.id, user.role as UserRole);
    return res;
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json(
      {
        error: "Unable to connect to the database right now. Please try again.",
        code: "DB_UNREACHABLE",
      },
      { status: 503 }
    );
  }
}
