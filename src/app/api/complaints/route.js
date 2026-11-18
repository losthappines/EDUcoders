import { NextResponse, connection } from "next/server";
import { prisma } from "@/lib/db";
import { recordAuditLog, resolveActorAfterSeed } from "@/lib/rbac";
import { haversineDistanceKm, matchNearestDoctor, resolveCoordinatesForLocation } from "@/lib/geo";
import { notifyUserViaTelegram } from "@/lib/telegram-bot";

const VALID_CATEGORIES = new Set(["POSTPARTUM", "CARDIO", "PEDIATRIC", "GENERAL", "EMERGENCY", "OTHER"]);
const VALID_SEVERITIES = new Set(["MILD", "MODERATE", "SEVERE", "CRITICAL"]);
const VALID_DESTINATIONS = new Set(["HOME", "CURRENT_GPS", "RELATIVE_HOME", "CLINIC", "CUSTOM"]);

export async function GET(req) {
  await connection();
  try {
    const actor = await resolveActorAfterSeed(req);
    if (!actor) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: actor.userId },
      include: { patientProfile: true },
    });

    let complaints = [];
    if (actor.role === "PATIENT") {
      if (!currentUser?.patientProfile) {
        return NextResponse.json({ complaints: [] });
      }
      complaints = await prisma.complaint.findMany({
        where: { patientId: currentUser.patientProfile.id },
        include: {
          patient: { select: { id: true, fullName: true, phone: true, district: true, address: true } },
          assignedDoctor: {
            select: {
              id: true,
              fullName: true,
              role: true,
              specialty: true,
              expertiseArea: true,
              experienceYears: true,
              phone: true,
              telegramHandle: true,
              district: true,
              latitude: true,
              longitude: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (actor.role === "FAMILY_MD" || actor.role === "OVABMU_MD") {
      const raw = await prisma.complaint.findMany({
        include: {
          patient: {
            select: {
              id: true,
              userId: true,
              fullName: true,
              phone: true,
              district: true,
              mahalla: true,
              address: true,
              bloodType: true,
            },
          },
          assignedDoctor: {
            select: {
              id: true,
              fullName: true,
              specialty: true,
              expertiseArea: true,
              experienceYears: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const docLat =
        currentUser?.latitude ??
        resolveCoordinatesForLocation(currentUser?.district || "", "").latitude;
      const docLng =
        currentUser?.longitude ??
        resolveCoordinatesForLocation(currentUser?.district || "", "").longitude;

      complaints = raw
        .map((c) => {
          const liveDistanceKm =
            typeof c.latitude === "number" && typeof c.longitude === "number"
              ? haversineDistanceKm(docLat, docLng, c.latitude, c.longitude)
              : c.distanceKm;
          return {
            ...c,
            distanceKm: liveDistanceKm,
            verifiedVitals: c.verifiedVitalsJson ? JSON.parse(c.verifiedVitalsJson) : null,
          };
        })
        .sort((a, b) => {
          const aDone = a.status === "VERIFIED_COMPLETED" ? 1 : 0;
          const bDone = b.status === "VERIFIED_COMPLETED" ? 1 : 0;
          if (aDone !== bDone) return aDone - bDone;
          const dA = typeof a.distanceKm === "number" ? a.distanceKm : 999;
          const dB = typeof b.distanceKm === "number" ? b.distanceKm : 999;
          return dA - dB;
        });

      return NextResponse.json({ complaints });
    } else {
      complaints = await prisma.complaint.findMany({
        include: {
          patient: { select: { id: true, fullName: true, phone: true, district: true, address: true } },
          assignedDoctor: {
            select: {
              id: true,
              fullName: true,
              specialty: true,
              expertiseArea: true,
              experienceYears: true,
              telegramHandle: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({
      complaints: complaints.map((c) => ({
        ...c,
        verifiedVitals: c.verifiedVitalsJson ? JSON.parse(c.verifiedVitalsJson) : null,
      })),
    });
  } catch (error) {
    console.error("GET /api/complaints error:", error);
    return NextResponse.json({ error: "Failed to load complaints" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const actor = await resolveActorAfterSeed(req);
    if (!actor) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (actor.role !== "PATIENT") {
      return NextResponse.json({ error: "Only patients can submit complaints" }, { status: 403 });
    }

    const patient = await prisma.patient.findUnique({ where: { userId: actor.userId } });
    if (!patient) {
      return NextResponse.json({ error: "Patient profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const title = (body.title || "").trim().slice(0, 140);
    const description = (body.description || "").trim().slice(0, 1500);
    if (description.length < 3) {
      return NextResponse.json({ error: "Please describe your complaint or symptoms." }, { status: 400 });
    }

    const category = VALID_CATEGORIES.has(body.category) ? body.category : "POSTPARTUM";
    const severity = VALID_SEVERITIES.has(body.severity) ? body.severity : "MODERATE";
    const visitDestination = VALID_DESTINATIONS.has(body.visitDestination) ? body.visitDestination : "HOME";
    const visitAddress =
      (body.visitAddress || "").trim() ||
      patient.address ||
      `${patient.district}, ${patient.mahalla}`;
    const preferredTimeWindow = (body.preferredTimeWindow || "Eng qisqa vaqtda").trim().slice(0, 80);

    const parsedLat = typeof body.latitude === "number" ? body.latitude : null;
    const parsedLng = typeof body.longitude === "number" ? body.longitude : null;
    const fallback =
      typeof patient.latitude === "number" && typeof patient.longitude === "number"
        ? { latitude: patient.latitude, longitude: patient.longitude }
        : resolveCoordinatesForLocation(patient.district, "");
    const latitude = parsedLat ?? fallback.latitude;
    const longitude = parsedLng ?? fallback.longitude;

    // Also update patient GPS if shared cleanly
    if (parsedLat !== null && parsedLng !== null) {
      await prisma.$transaction([
        prisma.patient.update({
          where: { id: patient.id },
          data: { latitude: parsedLat, longitude: parsedLng },
        }),
        prisma.user.update({
          where: { id: actor.userId },
          data: { latitude: parsedLat, longitude: parsedLng },
        }),
      ]);
    }

    const verifiedDoctors = await prisma.user.findMany({
      where: {
        role: { in: ["FAMILY_MD", "OVABMU_MD"] },
        verificationStatus: "VERIFIED",
      },
    });
    const matched = matchNearestDoctor(verifiedDoctors, {
      latitude,
      longitude,
      district: patient.district,
      category,
    });

    const visitOtpCode = String(Math.floor(1000 + Math.random() * 9000));

    const complaint = await prisma.complaint.create({
      data: {
        patientId: patient.id,
        assignedDoctorId: matched.doctor?.id ?? null,
        title: title || description.slice(0, 72),
        description,
        category,
        severity,
        status: "SUBMITTED",
        visitDestination,
        visitAddress,
        latitude,
        longitude,
        distanceKm: matched.distanceKm,
        preferredTimeWindow,
        sourceChannel: "WEB",
        visitOtpCode,
      },
      include: {
        patient: { select: { id: true, fullName: true, phone: true, district: true } },
        assignedDoctor: {
          select: {
            id: true,
            fullName: true,
            specialty: true,
            expertiseArea: true,
            experienceYears: true,
            phone: true,
            telegramHandle: true,
          },
        },
      },
    });

    if (matched.doctor) {
      await notifyUserViaTelegram(
        matched.doctor.id,
        `🚨 <b>Yangi bemor shikoyati!</b>\n` +
          `👩 Bemor: <b>${patient.fullName}</b> (${patient.phone})\n` +
          `📌 Yo'nalish: ${category} • Daraja: <b>${severity}</b>\n` +
          `🚑 Tashrif manzili (${visitDestination}): ${visitAddress}\n` +
          `📏 Masofa: ${matched.distanceKm !== null ? `${matched.distanceKm} km` : "Hududiy"}\n` +
          `📝 ${description}`,
        [
          [
            { text: "💬 Javob berish", callbackData: `DOC_RESPOND:${complaint.id}` },
            { text: "🚗 Yo'lga chiqdim", callbackData: `DOC_ENROUTE:${complaint.id}` },
          ],
          [{ text: "✅ Tashrifni verifikatsiya qilish", callbackData: `DOC_VERIFY:${complaint.id}` }],
        ]
      );
    }

    await recordAuditLog({
      actor,
      action: "COMPLAINT_SUBMITTED",
      resourceType: "Complaint",
      resourceId: complaint.id,
      details: {
        category,
        severity,
        visitDestination,
        latitude,
        longitude,
        matchedDoctorId: matched.doctor?.id || null,
        distanceKm: matched.distanceKm,
      },
    });

    return NextResponse.json({ success: true, complaint }, { status: 201 });
  } catch (error) {
    console.error("POST /api/complaints error:", error);
    return NextResponse.json({ error: "Failed to submit complaint" }, { status: 500 });
  }
}
