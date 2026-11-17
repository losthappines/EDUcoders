import { NextRequest, NextResponse } from "next/server";
import { getDatabaseConfigInfo, prisma } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed-data";
import {
  clearSessionCookie,
  getPortalPathForRole,
  hashPassword,
  setSessionCookie,
  VALID_ROLES,
} from "@/lib/auth";
import { encryptField, maskJshshir } from "@/lib/crypto";
import { resolvePolyclinicForLocation } from "@/lib/uz-locations";
import type { DoctorScheduleSlot, UserRole } from "@/lib/types";

function isDbError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("Environment variable not found: DATABASE_URL") ||
    msg.includes("Can't reach database server") ||
    msg.includes("PrismaClientInitializationError") ||
    msg.includes("P1001") ||
    msg.includes("P1012")
  );
}

export async function POST(req: NextRequest) {
  let body: {
    fullName?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    phone?: string;
    region?: string;
    district?: string;
    mahalla?: string;
    address?: string;
    dateOfBirth?: string;
    bloodType?: string;
    jshshir?: string;
    emergencyContact?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 }
    );
  }

  const fullName = (body.fullName || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const role = body.role;

  if (fullName.length < 2) {
    return NextResponse.json(
      { error: "Full name must be at least 2 characters." },
      { status: 400 }
    );
  }
  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 }
    );
  }
  if (!role || !VALID_ROLES.includes(role)) {
    return NextResponse.json(
      { error: "Invalid account role selected." },
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

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const region = (body.region || "").trim();
    const rawDistrict = (body.district || "").trim();
    const resolvedLocation = resolvePolyclinicForLocation(rawDistrict, region);
    const district = rawDistrict
      ? region && !rawDistrict.toLowerCase().includes(region.toLowerCase())
        ? `${rawDistrict}, ${region}`
        : rawDistrict
      : region || "Yunusobod";

    const polyclinicId =
      role === "OVABMU_MD"
        ? "OVABMU-TSH-01"
        : role === "ADMIN_RECEPTION"
          ? "TTB-ADMIN-01"
          : resolvedLocation.polyclinicId;

    const polyclinicName =
      role === "OVABMU_MD"
        ? "Respublika Ona va Bola Salomatligi Markazi (OvaBMU)"
        : role === "ADMIN_RECEPTION"
          ? "Tuman Tibbiyot Birlashmasi — Qabulxona va SLA Nazorati"
          : resolvedLocation.polyclinicName;

    const defaultSlots: DoctorScheduleSlot[] =
      role === "FAMILY_MD"
        ? [
            { slotId: `slot-${Date.now()}-1`, startHourOffset: 3, endHourOffset: 5, bookedPatientId: null },
            { slotId: `slot-${Date.now()}-2`, startHourOffset: 7, endHourOffset: 9, bookedPatientId: null },
            { slotId: `slot-${Date.now()}-3`, startHourOffset: 12, endHourOffset: 14, bookedPatientId: null },
          ]
        : [];

    const passwordHash = hashPassword(password);
    const phone = (body.phone || "").trim();
    const mahalla = (body.mahalla || "").trim();
    const dateOfBirth = (body.dateOfBirth || "").trim();
    const bloodType = (body.bloodType || "").trim() || "I don't know";

    // Patients and Doctors/Physicians must be verified by an Administrator before entering the portal
    const requiresAdminVerification =
      role === "PATIENT" || role === "OVABMU_MD" || role === "FAMILY_MD";
    const initialVerificationStatus = requiresAdminVerification
      ? "PENDING"
      : "VERIFIED";

    const createdUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          fullName,
          role,
          verificationStatus: initialVerificationStatus,
          verifiedAt: requiresAdminVerification ? null : new Date(),
          polyclinicId,
          polyclinicName,
          district,
          specialty:
            role === "OVABMU_MD"
              ? "Akusher-ginekolog (OvaBMU)"
              : role === "FAMILY_MD"
                ? "Hududiy oilaviy shifokor"
                : role === "ADMIN_RECEPTION"
                  ? "Qabulxona & SLA koordinatori"
                  : "Bemor",
          phone,
          scheduleSlotsJson: JSON.stringify(defaultSlots),
        },
      });

      if (role === "PATIENT") {
        const assignedDoc =
          (await tx.user.findFirst({
            where: {
              role: "FAMILY_MD",
              polyclinicId,
              verificationStatus: "VERIFIED",
            },
          })) ??
          (await tx.user.findFirst({
            where: { role: "FAMILY_MD", verificationStatus: "VERIFIED" },
          }));

        const rawJshshir =
          (body.jshshir || "").replace(/\D/g, "").length >= 10
            ? (body.jshshir || "").replace(/\D/g, "").slice(0, 14)
            : `4960${Math.floor(1000000000 + Math.random() * 8999999999)}`;

        await tx.patient.create({
          data: {
            userId: user.id,
            fullName,
            jshshirEncrypted: encryptField(rawJshshir),
            jshshirMasked: maskJshshir(rawJshshir),
            dateOfBirth,
            phone,
            district,
            mahalla,
            address: (body.address || `${district}${mahalla ? `, ${mahalla}` : ""}`).trim(),
            bloodType,
            allergiesJson: JSON.stringify(["Ma'lumot kiritilmagan"]),
            polyclinicId,
            polyclinicName,
            assignedFamilyDoctorId: assignedDoc?.id ?? null,
            emergencyContact:
              (body.emergencyContact || (phone ? `Oila vakili • ${phone}` : "Kiritilmagan")).trim(),
            status: "PENDING_VERIFICATION",
          },
        });
      }

      return user;
    });

    if (requiresAdminVerification) {
      const res = NextResponse.json(
        {
          success: true,
          pendingVerification: true,
          verificationStatus: "PENDING",
          user: {
            id: createdUser.id,
            email: createdUser.email,
            fullName: createdUser.fullName,
            role: createdUser.role,
            verificationStatus: createdUser.verificationStatus,
            polyclinicId: createdUser.polyclinicId,
            polyclinicName: createdUser.polyclinicName,
            district: createdUser.district,
          },
        },
        { status: 201 }
      );
      clearSessionCookie(res);
      return res;
    }

    const redirectTo = getPortalPathForRole(createdUser.role as UserRole);
    const res = NextResponse.json({
      success: true,
      pendingVerification: false,
      redirectTo,
      user: {
        id: createdUser.id,
        email: createdUser.email,
        fullName: createdUser.fullName,
        role: createdUser.role,
        verificationStatus: createdUser.verificationStatus,
        polyclinicId: createdUser.polyclinicId,
        polyclinicName: createdUser.polyclinicName,
        district: createdUser.district,
      },
    });
    setSessionCookie(res, createdUser.id, createdUser.role as UserRole);
    return res;
  } catch (error) {
    console.error("POST /api/auth/signup error:", error);
    if (isDbError(error)) {
      return NextResponse.json(
        {
          error: "Database is unreachable right now. Please try again shortly.",
          code: "DB_UNREACHABLE",
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create account." },
      { status: 500 }
    );
  }
}
