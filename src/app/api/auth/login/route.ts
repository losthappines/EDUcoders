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
  try {
    await ensureSeeded();

    const body = (await req.json()) as {
      email?: string;
      password?: string;
    };

    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Invalid email or password." },
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
      { error: "Failed to sign in" },
      { status: 500 }
    );
  }
}
