import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed-data";
import {
  getPortalPathForRole,
  hashPassword,
  setSessionCookie,
  VALID_ROLES,
} from "@/lib/auth";
import { encryptField, maskJshshir } from "@/lib/crypto";
import { resolvePolyclinicForLocation } from "@/lib/uz-locations";
import type {
  DoctorScheduleSlot,
  PatientGuide,
  UserRole,
  VitalsSnapshot,
} from "@/lib/types";

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

  try {
    await ensureSeeded();

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

    const createdUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          fullName,
          role,
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
            where: { role: "FAMILY_MD", polyclinicId },
          })) ??
          (await tx.user.findFirst({ where: { role: "FAMILY_MD" } }));

        const dischargingDoc =
          (await tx.user.findFirst({ where: { role: "OVABMU_MD" } })) ??
          assignedDoc ??
          user;

        const rawJshshir =
          (body.jshshir || "").replace(/\D/g, "").length >= 10
            ? (body.jshshir || "").replace(/\D/g, "").slice(0, 14)
            : `4960${Math.floor(1000000000 + Math.random() * 8999999999)}`;

        const now = new Date();
        const slaDeadline = new Date(now.getTime() + 24 * 3600 * 1000);
        const winStart = new Date(now.getTime() + 4 * 3600 * 1000);
        const winEnd = new Date(now.getTime() + 6 * 3600 * 1000);

        const patient = await tx.patient.create({
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
            status: "PATRONAGE_ACTIVE",
            dischargedAt: now,
          },
        });

        await tx.ehrRecord.create({
          data: {
            patientId: patient.id,
            authorId: dischargingDoc.id,
            recordType: "DISCHARGE_EPIKRIZ",
            diagnosisIcd10: "Z39.2",
            diagnosisText:
              "Tug'ruqdan keyingi rejali patronaj kuzatuvi va salomatlik monitoringi",
            severity: "MODERATE",
            clinicalNotesEncrypted: encryptField(
              "Bemor mustaqil portal orqali ro'yxatdan o'tdi. 24 soatlik hududiy oilaviy shifokor patronaj ko'rigi rejalashtirildi."
            ),
            vitalsJson: JSON.stringify({
              systolicBp: 120,
              diastolicBp: 80,
              heartRate: 78,
              tempC: 36.6,
              spo2: 98,
              respRate: 18,
              recordedAt: now.toISOString(),
              phase: "INPATIENT_PRE_DISCHARGE",
            } satisfies VitalsSnapshot),
            proceduresJson: JSON.stringify(["Birlamchi patronaj profilini faollashtirish"]),
          },
        });

        if (assignedDoc) {
          const guide: PatientGuide = {
            summaryUz: `Hurmatli ${fullName}, sizning shaxsiy patronaj kabinetingiz faollashtirildi. Hududiy shifokoringiz ${assignedDoc.fullName} bilan 24 soatlik aloqa o'rnatildi.`,
            summaryRu: `Уважаемая ${fullName}, ваш личный кабинет патронажа активирован. Назначен семейный врач ${assignedDoc.fullName}.`,
            summaryEn: `Welcome ${fullName}. Your personal patronage portal is active with assigned family doctor ${assignedDoc.fullName}.`,
            dailyRulesUz: [
              "Kuniga 1 marta simptomlar va qon bosimingizni portalga kiriting",
              "Shifokor tavsiya qilgan dorilarni vaqtida qabul qiling",
              "Yetarli suv iching va dam olish rejimiga rioya qiling",
            ],
            dailyRulesRu: [
              "Ежедневно вносите показатели давления и симптомов",
              "Принимайте назначенные препараты по графику",
              "Соблюдайте питьевой режим и отдых",
            ],
            dailyRulesEn: [
              "Log your daily blood pressure and symptoms in the check-in form",
              "Take prescribed medications on schedule",
              "Maintain hydration and adequate rest",
            ],
            emergencySignsUz: [
              "Qon bosimi 140/90 mmHg dan oshsa yoki kuchli bosh og'rig'i bo'lsa",
              "Tana harorati 38.0°C dan ko'tarilsa",
              "Kuchli qon ketishi yoki hushdan ketish holati sezilsa",
            ],
            emergencySignsRu: [
              "Повышение АД выше 140/90 мм рт. ст. или сильная головная боль",
              "Температура тела выше 38.0°C",
              "Обильное кровотечение или резкая слабость",
            ],
            emergencySignsEn: [
              "Blood pressure > 140/90 mmHg or severe headache",
              "Fever above 38.0°C",
              "Heavy bleeding or severe dizziness",
            ],
          };

          const otp = String(Math.floor(1000 + Math.random() * 9000));
          await tx.activeCall.create({
            data: {
              patientId: patient.id,
              dischargedById: dischargingDoc.id,
              assignedDoctorId: assignedDoc.id,
              polyclinicName,
              district,
              status: "SCHEDULED",
              priority: "NORMAL",
              riskScore: 42,
              redFlagsJson: JSON.stringify([
                "24 soatlik birlamchi patronaj ko'rigi rejalashtirilgan",
              ]),
              checklistJson: JSON.stringify([
                {
                  id: "chk-init-vitals",
                  titleUz: "AQB, puls va tana haroratini o'lchash",
                  titleRu: "Измерение АД, пульса и температуры",
                  titleEn: "Measure BP, pulse, and temperature",
                  category: "VITALS",
                  checked: false,
                },
                {
                  id: "chk-init-consult",
                  titleUz: "Umumiy ahvol va shikoyatlarni baholash",
                  titleRu: "Оценка общего состояния и жалоб",
                  titleEn: "Assess overall recovery and symptoms",
                  category: "PHYSICAL_EXAM",
                  checked: false,
                },
              ]),
              patientGuideJson: JSON.stringify(guide),
              scheduledWindowStart: winStart,
              scheduledWindowEnd: winEnd,
              dischargedAt: now,
              slaDeadlineAt: slaDeadline,
              escalationLevel: 0,
              patientOtpCode: otp,
              aiAgentTraceJson: JSON.stringify([]),
              notificationLogJson: JSON.stringify([]),
            },
          });
        }
      }

      return user;
    });

    const redirectTo = getPortalPathForRole(createdUser.role as UserRole);
    const res = NextResponse.json({
      success: true,
      redirectTo,
      user: {
        id: createdUser.id,
        email: createdUser.email,
        fullName: createdUser.fullName,
        role: createdUser.role,
        polyclinicId: createdUser.polyclinicId,
        polyclinicName: createdUser.polyclinicName,
        district: createdUser.district,
      },
    });
    setSessionCookie(res, createdUser.id, createdUser.role as UserRole);
    return res;
  } catch (error) {
    console.error("POST /api/auth/signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
