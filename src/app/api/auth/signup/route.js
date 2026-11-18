import { NextResponse } from "next/server";
import { getDatabaseConfigInfo, prisma } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed-data";
import { clearSessionCookie, createTelegramLinkToken, getPortalPathForRole, hashPassword, setSessionCookie, VALID_ROLES, verifyPhoneVerifiedToken, } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { encryptField, maskJshshir } from "@/lib/crypto";
import { resolvePolyclinicForLocation } from "@/lib/uz-locations";
import { resolveCoordinatesForLocation } from "@/lib/geo";
import { getTelegramBotUsername, notifyAdminsViaTelegram } from "@/lib/telegram-bot";
function isDbError(error) {
    const msg = error instanceof Error ? error.message : String(error);
    return (msg.includes("Environment variable not found: DATABASE_URL") ||
        msg.includes("Can't reach database server") ||
        msg.includes("PrismaClientInitializationError") ||
        msg.includes("P1001") ||
        msg.includes("P1012"));
}
export async function POST(req) {
    const clientIp = getClientIp(req);
    const rl = checkRateLimit({
        key: `signup:${clientIp}`,
        limit: 8,
        windowMs: 10 * 60_000,
    });
    if (!rl.allowed) {
        return NextResponse.json({ error: "Too many registration attempts. Please try again later." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } });
    }
    let body;
    try {
        body = (await req.json());
    }
    catch {
        return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }
    const fullName = (body.fullName || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";
    const role = body.role;
    if (fullName.length < 2) {
        return NextResponse.json({ error: "Full name must be at least 2 characters." }, { status: 400 });
    }
    if (!email || !email.includes("@")) {
        return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }
    if (!role || !VALID_ROLES.includes(role)) {
        return NextResponse.json({ error: "Invalid account role selected." }, { status: 400 });
    }
    if (typeof body.verifiedPhoneToken === "string" && body.verifiedPhoneToken) {
        if (!verifyPhoneVerifiedToken(body.phone || "", body.verifiedPhoneToken)) {
            return NextResponse.json({ error: "Invalid phone verification token. Please re-verify your phone number." }, { status: 400 });
        }
    }
    const dbInfo = getDatabaseConfigInfo();
    if (!dbInfo.url || !dbInfo.isPostgres) {
        return NextResponse.json({
            error: "Database is not connected on this deployment (missing PostgreSQL DATABASE_URL).",
            code: "DB_NOT_CONFIGURED",
        }, { status: 503 });
    }
    try {
        await ensureSeeded();
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
        }
        const region = (body.region || "").trim();
        const rawDistrict = (body.district || "").trim();
        const resolvedLocation = resolvePolyclinicForLocation(rawDistrict, region);
        const district = rawDistrict
            ? region && !rawDistrict.toLowerCase().includes(region.toLowerCase())
                ? `${rawDistrict}, ${region}`
                : rawDistrict
            : region || "Yunusobod";
        const fallbackCoords = resolveCoordinatesForLocation(rawDistrict, region);
        const latitude = typeof body.latitude === "number" && Number.isFinite(body.latitude) ? body.latitude : fallbackCoords.latitude;
        const longitude = typeof body.longitude === "number" && Number.isFinite(body.longitude) ? body.longitude : fallbackCoords.longitude;
        const polyclinicId = role === "OVABMU_MD"
            ? "OVABMU-TSH-01"
            : role === "ADMIN_RECEPTION"
                ? "TTB-ADMIN-01"
                : resolvedLocation.polyclinicId;
        const polyclinicName = role === "OVABMU_MD"
            ? "Respublika Ona va Bola Salomatligi Markazi (OvaBMU)"
            : role === "ADMIN_RECEPTION"
                ? "Tuman Tibbiyot Birlashmasi — Qabulxona va SLA Nazorati"
                : resolvedLocation.polyclinicName;
        const defaultSlots = role === "FAMILY_MD" || role === "PSYCHOLOGIST"
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
        const rawDeliveryDate = body.deliveryDate ? new Date(body.deliveryDate) : null;
        const deliveryDate = rawDeliveryDate && !Number.isNaN(rawDeliveryDate.getTime()) ? rawDeliveryDate : null;
        const bloodType = (body.bloodType || "").trim() || "I don't know";
        const customSpecialty = (body.specialty || "").trim().slice(0, 120);
        const expertiseArea = (body.expertiseArea || customSpecialty || "").trim().slice(0, 160);
        const expRaw = body.experienceYears !== undefined && body.experienceYears !== null && body.experienceYears !== ""
            ? parseInt(String(body.experienceYears), 10)
            : null;
        const experienceYears = Number.isFinite(expRaw) && expRaw >= 0 ? Math.min(expRaw, 65) : null;
        const bioSummary = (body.bioSummary || "").trim().slice(0, 400) || null;
        const telegramHandle = (body.telegramHandle || "").trim().slice(0, 64) || null;
        // Patients, Doctors, and Psychologists must be verified by an Administrator before entering the portal
        const requiresAdminVerification = role === "PATIENT" || role === "OVABMU_MD" || role === "FAMILY_MD" || role === "PSYCHOLOGIST";
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
                    specialty: customSpecialty ||
                        (role === "OVABMU_MD"
                            ? "Akusher-ginekolog (OvaBMU)"
                            : role === "FAMILY_MD"
                                ? "Hududiy oilaviy shifokor"
                                : role === "PSYCHOLOGIST"
                                    ? "Perinatal psixolog"
                                    : role === "ADMIN_RECEPTION"
                                        ? "Qabulxona & SLA koordinatori"
                                        : "Bemor"),
                    expertiseArea: expertiseArea || null,
                    experienceYears,
                    bioSummary,
                    latitude,
                    longitude,
                    phone,
                    telegramHandle,
                    scheduleSlotsJson: JSON.stringify(defaultSlots),
                },
            });
            if (role === "PATIENT") {
                const assignedDoc = (await tx.user.findFirst({
                    where: {
                        role: "FAMILY_MD",
                        polyclinicId,
                        verificationStatus: "VERIFIED",
                    },
                })) ??
                    (await tx.user.findFirst({
                        where: { role: "FAMILY_MD", verificationStatus: "VERIFIED" },
                    }));
                const rawJshshir = (body.jshshir || "").replace(/\D/g, "").length >= 10
                    ? (body.jshshir || "").replace(/\D/g, "").slice(0, 14)
                    : `4960${Math.floor(1000000000 + Math.random() * 8999999999)}`;
                await tx.patient.create({
                    data: {
                        userId: user.id,
                        fullName,
                        jshshirEncrypted: encryptField(rawJshshir),
                        jshshirMasked: maskJshshir(rawJshshir),
                        dateOfBirth,
                        deliveryDate,
                        phone,
                        district,
                        mahalla,
                        address: (body.address || `${district}${mahalla ? `, ${mahalla}` : ""}`).trim(),
                        latitude,
                        longitude,
                        bloodType,
                        allergiesJson: JSON.stringify(["Ma'lumot kiritilmagan"]),
                        polyclinicId,
                        polyclinicName,
                        assignedFamilyDoctorId: assignedDoc?.id ?? null,
                        emergencyContact: (body.emergencyContact || (phone ? `Oila vakili • ${phone}` : "Kiritilmagan")).trim(),
                        status: "PENDING_VERIFICATION",
                    },
                });
            }
            return user;
        });
        const [telegramLinkToken, telegramBotUsername] = await Promise.all([
            Promise.resolve(createTelegramLinkToken(createdUser.id)),
            getTelegramBotUsername(),
        ]);
        const telegramDeepLink = `https://t.me/${telegramBotUsername}?start=${telegramLinkToken}`;
        if (requiresAdminVerification) {
            await notifyAdminsViaTelegram(`🆕 <b>Yangi ro'yxatdan o'tish:</b> ${createdUser.fullName} (${createdUser.role}) — 📍 ${createdUser.district}`);
            const res = NextResponse.json({
                success: true,
                pendingVerification: true,
                verificationStatus: "PENDING",
                telegramLinkToken,
                telegramBotUsername,
                telegramDeepLink,
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
            }, { status: 201 });
            clearSessionCookie(res);
            return res;
        }
        const redirectTo = getPortalPathForRole(createdUser.role);
        const res = NextResponse.json({
            success: true,
            pendingVerification: false,
            redirectTo,
            telegramLinkToken,
            telegramBotUsername,
            telegramDeepLink,
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
        setSessionCookie(res, createdUser.id, createdUser.role);
        return res;
    }
    catch (error) {
        console.error("POST /api/auth/signup error:", error);
        if (isDbError(error)) {
            return NextResponse.json({
                error: "Database is unreachable right now. Please try again shortly.",
                code: "DB_UNREACHABLE",
            }, { status: 503 });
        }
        return NextResponse.json({ error: "Failed to create account." }, { status: 500 });
    }
}
