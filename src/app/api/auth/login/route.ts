import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed-data";
import {
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

  try {
    await ensureSeeded();
  } catch (seedError) {
    console.warn("POST /api/auth/login ensureSeeded warning:", seedError);
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Incorrect email or password." },
        { status: 401 }
      );
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
      { error: "Unable to sign in right now. Please try again." },
      { status: 503 }
    );
  }
}
