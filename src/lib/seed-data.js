import { prisma } from "./db";
import { encryptField, maskJshshir } from "./crypto";
import { hashPassword } from "./auth";
import { slaMemoryQueue } from "./sla-queue";
import { buildEpikrizDocumentHtml, buildUltrasoundSvg, putStorageObject, } from "./storage";
let seedingPromise = null;
let backfillChecked = false;
let schemaChecked = false;
let schemaPromise = null;
async function ensureDatabaseSchema() {
    if (schemaChecked)
        return;
    if (!schemaPromise) {
        schemaPromise = (async () => {
            try {
                await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "users" (
            "id" TEXT NOT NULL,
            "email" TEXT NOT NULL,
            "passwordHash" TEXT NOT NULL DEFAULT '',
            "fullName" TEXT NOT NULL,
            "role" TEXT NOT NULL,
            "verificationStatus" TEXT NOT NULL DEFAULT 'VERIFIED',
            "verificationNote" TEXT,
            "verifiedAt" TIMESTAMP(3),
            "verifiedById" TEXT,
            "polyclinicId" TEXT,
            "polyclinicName" TEXT,
            "district" TEXT,
            "specialty" TEXT,
            "phone" TEXT,
            "telegramHandle" TEXT,
            "scheduleSlotsJson" TEXT NOT NULL DEFAULT '[]',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "users_pkey" PRIMARY KEY ("id")
          );
        `);
                await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email")`);
                await prisma.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT NOT NULL DEFAULT ''`);
                await prisma.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verificationStatus" TEXT NOT NULL DEFAULT 'VERIFIED'`);
                await prisma.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verificationNote" TEXT`);
                await prisma.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3)`);
                await prisma.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verifiedById" TEXT`);
                await prisma.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "expertiseArea" TEXT`);
                await prisma.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "experienceYears" INTEGER`);
                await prisma.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bioSummary" TEXT`);
                await prisma.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION`);
                await prisma.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION`);
                await prisma.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "telegramChatId" TEXT`);
                await prisma.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscriptionTier" TEXT NOT NULL DEFAULT 'FREE'`);
                await prisma.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscriptionStatus" TEXT NOT NULL DEFAULT 'NONE'`);
                await prisma.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscriptionExpiresAt" TIMESTAMP(3)`);
                await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "users_telegramChatId_key" ON "users"("telegramChatId")`);
                await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "patients" (
            "id" TEXT NOT NULL,
            "userId" TEXT,
            "fullName" TEXT NOT NULL,
            "jshshirEncrypted" TEXT NOT NULL,
            "jshshirMasked" TEXT NOT NULL,
            "dateOfBirth" TEXT NOT NULL,
            "phone" TEXT NOT NULL,
            "district" TEXT NOT NULL,
            "mahalla" TEXT NOT NULL,
            "address" TEXT NOT NULL,
            "latitude" DOUBLE PRECISION,
            "longitude" DOUBLE PRECISION,
            "telegramChatId" TEXT,
            "bloodType" TEXT NOT NULL,
            "allergiesJson" TEXT NOT NULL DEFAULT '[]',
            "polyclinicId" TEXT NOT NULL,
            "polyclinicName" TEXT NOT NULL,
            "assignedFamilyDoctorId" TEXT,
            "emergencyContact" TEXT NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'INPATIENT',
            "bedNumber" TEXT,
            "subscriptionTier" TEXT NOT NULL DEFAULT 'FREE',
            "subscriptionStatus" TEXT NOT NULL DEFAULT 'NONE',
            "subscriptionExpiresAt" TIMESTAMP(3),
            "admittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "dischargedAt" TIMESTAMP(3),
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
          );
        `);
                await prisma.$executeRawUnsafe(`ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "userId" TEXT`);
                await prisma.$executeRawUnsafe(`ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION`);
                await prisma.$executeRawUnsafe(`ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION`);
                await prisma.$executeRawUnsafe(`ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "telegramChatId" TEXT`);
                await prisma.$executeRawUnsafe(`ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "subscriptionTier" TEXT NOT NULL DEFAULT 'FREE'`);
                await prisma.$executeRawUnsafe(`ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "subscriptionStatus" TEXT NOT NULL DEFAULT 'NONE'`);
                await prisma.$executeRawUnsafe(`ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "subscriptionExpiresAt" TIMESTAMP(3)`);
                await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "patients_userId_key" ON "patients"("userId")`);
                await prisma.$executeRawUnsafe(`
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'patients_userId_fkey') THEN
              ALTER TABLE "patients" ADD CONSTRAINT "patients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'patients_assignedFamilyDoctorId_fkey') THEN
              ALTER TABLE "patients" ADD CONSTRAINT "patients_assignedFamilyDoctorId_fkey" FOREIGN KEY ("assignedFamilyDoctorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
            END IF;
          END $$;
        `);
                await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "ehr_records" (
            "id" TEXT NOT NULL,
            "patientId" TEXT NOT NULL,
            "authorId" TEXT NOT NULL,
            "recordType" TEXT NOT NULL,
            "diagnosisIcd10" TEXT NOT NULL,
            "diagnosisText" TEXT NOT NULL,
            "severity" TEXT NOT NULL,
            "clinicalNotesEncrypted" TEXT NOT NULL,
            "vitalsJson" TEXT NOT NULL,
            "proceduresJson" TEXT NOT NULL DEFAULT '[]',
            "dischargeDocumentKey" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "ehr_records_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "ehr_records_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT "ehr_records_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
          );
        `);
                await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "lab_reports" (
            "id" TEXT NOT NULL,
            "patientId" TEXT NOT NULL,
            "orderedById" TEXT NOT NULL,
            "panelName" TEXT NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'COMPLETED',
            "resultsJson" TEXT NOT NULL,
            "attachmentKey" TEXT,
            "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "lab_reports_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "lab_reports_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT "lab_reports_orderedById_fkey" FOREIGN KEY ("orderedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
          );
        `);
                await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "prescriptions" (
            "id" TEXT NOT NULL,
            "patientId" TEXT NOT NULL,
            "prescribedById" TEXT NOT NULL,
            "medicationName" TEXT NOT NULL,
            "dosage" TEXT NOT NULL,
            "frequency" TEXT NOT NULL,
            "durationDays" INTEGER NOT NULL,
            "instructionsUz" TEXT NOT NULL,
            "instructionsRu" TEXT NOT NULL,
            "instructionsEn" TEXT NOT NULL,
            "pharmacyStockStatus" TEXT NOT NULL DEFAULT 'IN_STOCK',
            "polyclinicPharmacy" TEXT NOT NULL,
            "adherenceLogsJson" TEXT NOT NULL DEFAULT '[]',
            "active" BOOLEAN NOT NULL DEFAULT true,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "prescriptions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT "prescriptions_prescribedById_fkey" FOREIGN KEY ("prescribedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
          );
        `);
                await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "active_calls" (
            "id" TEXT NOT NULL,
            "patientId" TEXT NOT NULL,
            "dischargedById" TEXT NOT NULL,
            "assignedDoctorId" TEXT NOT NULL,
            "polyclinicName" TEXT NOT NULL,
            "district" TEXT NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
            "priority" TEXT NOT NULL DEFAULT 'HIGH',
            "riskScore" INTEGER NOT NULL,
            "redFlagsJson" TEXT NOT NULL,
            "checklistJson" TEXT NOT NULL,
            "patientGuideJson" TEXT NOT NULL,
            "scheduledWindowStart" TIMESTAMP(3) NOT NULL,
            "scheduledWindowEnd" TIMESTAMP(3) NOT NULL,
            "dischargedAt" TIMESTAMP(3) NOT NULL,
            "slaDeadlineAt" TIMESTAMP(3) NOT NULL,
            "escalationLevel" INTEGER NOT NULL DEFAULT 0,
            "symptomCheckinsJson" TEXT NOT NULL DEFAULT '[]',
            "doctorVitalsJson" TEXT,
            "visitNotes" TEXT,
            "patientOtpCode" TEXT NOT NULL,
            "visitVerifiedAt" TIMESTAMP(3),
            "verificationMethod" TEXT,
            "aiAgentTraceJson" TEXT NOT NULL DEFAULT '[]',
            "notificationLogJson" TEXT NOT NULL DEFAULT '[]',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "active_calls_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "active_calls_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT "active_calls_dischargedById_fkey" FOREIGN KEY ("dischargedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
            CONSTRAINT "active_calls_assignedDoctorId_fkey" FOREIGN KEY ("assignedDoctorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
          );
        `);
                await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "invoices" (
            "id" TEXT NOT NULL,
            "patientId" TEXT NOT NULL,
            "activeCallId" TEXT NOT NULL,
            "itemCode" TEXT NOT NULL,
            "description" TEXT NOT NULL,
            "category" TEXT NOT NULL,
            "amountUzs" INTEGER NOT NULL,
            "stateCoveredUzs" INTEGER NOT NULL,
            "patientPayableUzs" INTEGER NOT NULL,
            "packageName" TEXT NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'COVERED_BY_STATE',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "invoices_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "invoices_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT "invoices_activeCallId_fkey" FOREIGN KEY ("activeCallId") REFERENCES "active_calls"("id") ON DELETE CASCADE ON UPDATE CASCADE
          );
        `);
                await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "complaints" (
            "id" TEXT NOT NULL,
            "patientId" TEXT NOT NULL,
            "assignedDoctorId" TEXT,
            "title" TEXT NOT NULL,
            "description" TEXT NOT NULL,
            "category" TEXT NOT NULL DEFAULT 'POSTPARTUM',
            "severity" TEXT NOT NULL DEFAULT 'MODERATE',
            "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
            "visitDestination" TEXT NOT NULL DEFAULT 'HOME',
            "visitAddress" TEXT NOT NULL,
            "latitude" DOUBLE PRECISION,
            "longitude" DOUBLE PRECISION,
            "distanceKm" DOUBLE PRECISION,
            "preferredTimeWindow" TEXT,
            "sourceChannel" TEXT NOT NULL DEFAULT 'WEB',
            "doctorResponse" TEXT,
            "doctorRespondedAt" TIMESTAMP(3),
            "visitOtpCode" TEXT NOT NULL,
            "visitVerifiedAt" TIMESTAMP(3),
            "visitVerificationNote" TEXT,
            "verifiedVitalsJson" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "complaints_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "complaints_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT "complaints_assignedDoctorId_fkey" FOREIGN KEY ("assignedDoctorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
          );
        `);
                await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "direct_messages" (
            "id" TEXT NOT NULL,
            "complaintId" TEXT,
            "patientId" TEXT NOT NULL,
            "senderUserId" TEXT NOT NULL,
            "senderName" TEXT NOT NULL,
            "senderRole" TEXT NOT NULL,
            "recipientUserId" TEXT,
            "body" TEXT NOT NULL,
            "channel" TEXT NOT NULL DEFAULT 'WEB',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "direct_messages_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "direct_messages_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "complaints"("id") ON DELETE SET NULL ON UPDATE CASCADE,
            CONSTRAINT "direct_messages_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE
          );
        `);
                await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "subscriptions" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "targetRole" TEXT NOT NULL,
            "planCode" TEXT NOT NULL,
            "planName" TEXT NOT NULL,
            "priceUzs" INTEGER NOT NULL,
            "paymentMethod" TEXT NOT NULL DEFAULT 'PAYME',
            "status" TEXT NOT NULL DEFAULT 'ACTIVE',
            "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "expiresAt" TIMESTAMP(3) NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
          );
        `);
                await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "telegram_sessions" (
            "chatId" TEXT NOT NULL,
            "telegramUsername" TEXT,
            "telegramFirstName" TEXT,
            "userId" TEXT,
            "flowState" TEXT NOT NULL DEFAULT 'IDLE',
            "draftJson" TEXT NOT NULL DEFAULT '{}',
            "historyJson" TEXT NOT NULL DEFAULT '[]',
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "telegram_sessions_pkey" PRIMARY KEY ("chatId")
          );
        `);
                await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "audit_logs" (
            "id" TEXT NOT NULL,
            "actorId" TEXT NOT NULL,
            "actorName" TEXT NOT NULL,
            "actorRole" TEXT NOT NULL,
            "action" TEXT NOT NULL,
            "resourceType" TEXT NOT NULL,
            "resourceId" TEXT NOT NULL,
            "ipAddress" TEXT NOT NULL,
            "detailsJson" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
          );
        `);
                await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "system_sim_state" (
            "id" TEXT NOT NULL,
            "timeOffsetHours" INTEGER NOT NULL DEFAULT 0,
            "telegramBotTokenEnc" TEXT,
            "telegramBotUsername" TEXT,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "system_sim_state_pkey" PRIMARY KEY ("id")
          );
        `);
                await prisma.$executeRawUnsafe(`ALTER TABLE "system_sim_state" ADD COLUMN IF NOT EXISTS "telegramBotTokenEnc" TEXT`);
                await prisma.$executeRawUnsafe(`ALTER TABLE "system_sim_state" ADD COLUMN IF NOT EXISTS "telegramBotUsername" TEXT`);
                schemaChecked = true;
            }
            catch (err) {
                console.warn("ensureDatabaseSchema note:", err instanceof Error ? err.message : err);
                throw err;
            }
            finally {
                schemaPromise = null;
            }
        })();
    }
    await schemaPromise;
}
export async function ensureSeeded() {
    await ensureDatabaseSchema();
    const [userCount, patientCount] = await Promise.all([
        prisma.user.count(),
        prisma.patient.count(),
    ]);
    if (userCount > 0 && patientCount > 0) {
        if (!backfillChecked) {
            backfillChecked = true;
            const missingPassUsers = await prisma.user.findMany({
                where: { passwordHash: "" },
                select: { id: true },
            });
            if (missingPassUsers.length > 0) {
                const fallbackHash = hashPassword("Demo1234!");
                await prisma.user.updateMany({
                    where: { passwordHash: "" },
                    data: { passwordHash: fallbackHash },
                });
            }
            await prisma.patient.updateMany({
                where: { id: "pat-zulfiya", userId: null },
                data: { userId: "usr-patient-1" },
            });
            // Backfill GPS coordinates & doctor expertise on seeded accounts if missing
            await prisma.user.updateMany({
                where: { id: "usr-ovabmu-1", experienceYears: null },
                data: {
                    expertiseArea: "Akusherlik, og'ir preeklampsiya va tug'ruqdan keyingi reanimatsiya",
                    experienceYears: 12,
                    bioSummary: "Respublika Ona va Bola Markazi yetakchi akusher-ginekologi.",
                    latitude: 41.3266,
                    longitude: 69.3422,
                    subscriptionTier: "DOCTOR_PRO",
                    subscriptionStatus: "ACTIVE",
                    subscriptionExpiresAt: new Date(Date.now() + 30 * 86400000),
                },
            });
            await prisma.user.updateMany({
                where: { id: "usr-family-tashkent", experienceYears: null },
                data: {
                    expertiseArea: "Hududiy oilaviy shifokor, tug'ruqdan keyingi patronaj va anemiya nazorati",
                    experienceYears: 8,
                    bioSummary: "14-sonli Oilaviy Poliklinika patronaj shifokori, uyda tashriflar mutaxassisi.",
                    latitude: 41.331,
                    longitude: 69.254,
                    subscriptionTier: "DOCTOR_PRO",
                    subscriptionStatus: "ACTIVE",
                    subscriptionExpiresAt: new Date(Date.now() + 30 * 86400000),
                },
            });
            await prisma.user.updateMany({
                where: { id: "usr-family-namangan", experienceYears: null },
                data: {
                    expertiseArea: "Oilaviy tibbiyot, sepsis skriningi va chaqaloqlar parvarishi",
                    experienceYears: 6,
                    bioSummary: "Namangan Davlatobod tumani 3-sonli poliklinika oilaviy shifokori.",
                    latitude: 41.0085,
                    longitude: 71.6083,
                    subscriptionTier: "FREE",
                    subscriptionStatus: "NONE",
                },
            });
            await prisma.user.updateMany({
                where: { id: "usr-patient-1", latitude: null },
                data: {
                    latitude: 41.2753,
                    longitude: 69.2036,
                    subscriptionTier: "CARE_PLUS",
                    subscriptionStatus: "ACTIVE",
                    subscriptionExpiresAt: new Date(Date.now() + 30 * 86400000),
                },
            });
            await prisma.patient.updateMany({
                where: { id: "pat-zulfiya", latitude: null },
                data: {
                    latitude: 41.2753,
                    longitude: 69.2036,
                    subscriptionTier: "CARE_PLUS",
                    subscriptionStatus: "ACTIVE",
                    subscriptionExpiresAt: new Date(Date.now() + 30 * 86400000),
                },
            });
            await prisma.patient.updateMany({
                where: { id: "pat-malika", latitude: null },
                data: { latitude: 41.3667, longitude: 69.2869 },
            });
            await prisma.patient.updateMany({
                where: { id: "pat-dilfuza", latitude: null },
                data: { latitude: 41.012, longitude: 71.612 },
            });
            const existingComplaints = await prisma.complaint.count();
            if (existingComplaints === 0) {
                const patZulfiya = await prisma.patient.findUnique({ where: { id: "pat-zulfiya" } });
                const docTashkent = await prisma.user.findUnique({ where: { id: "usr-family-tashkent" } });
                if (patZulfiya && docTashkent) {
                    const comp = await prisma.complaint.create({
                        data: {
                            id: "cmp-zulfiya-1",
                            patientId: patZulfiya.id,
                            assignedDoctorId: docTashkent.id,
                            title: "Bosh aylanishi va holsizlik (turganimda ko'z oldi qorong'ilashyapti)",
                            description: "Ertalab o'rnimdan turganimda kuchli bosh aylanishi bo'ldi, qon bosimim 95/60 chiqdi. Sorbifer ichdim, uyga shifokor kelib ko'rsa yaxshi bo'lardi.",
                            category: "POSTPARTUM",
                            severity: "SEVERE",
                            status: "DOCTOR_RESPONDED",
                            visitDestination: "HOME",
                            visitAddress: "Chilonzor, Qatortol 7-mavze, 18-uy, 45-xonadon",
                            latitude: 41.2753,
                            longitude: 69.2036,
                            distanceKm: 7.5,
                            preferredTimeWindow: "Bugun 14:00 – 17:00",
                            sourceChannel: "TELEGRAM",
                            doctorResponse: "Salom Zulfiya! Yotgan joyingizdan keskin turmang va ko'proq iliq suv iching. Men bugun ko'rikka boraman va qon bosimingizni o'lchayman.",
                            doctorRespondedAt: new Date(Date.now() - 45 * 60000),
                            visitOtpCode: "7392",
                        },
                    });
                    await prisma.directMessage.createMany({
                        data: [
                            {
                                complaintId: comp.id,
                                patientId: patZulfiya.id,
                                senderUserId: "usr-patient-1",
                                senderName: patZulfiya.fullName,
                                senderRole: "PATIENT",
                                recipientUserId: docTashkent.id,
                                body: "Assalomu alaykum doktor! Bugun ertalab turganimda boshim aylandi, Sorbiferni ovqatdan keyin ichsam bo'ladimi?",
                                channel: "TELEGRAM",
                                createdAt: new Date(Date.now() - 55 * 60000),
                            },
                            {
                                complaintId: comp.id,
                                patientId: patZulfiya.id,
                                senderUserId: docTashkent.id,
                                senderName: docTashkent.fullName,
                                senderRole: "FAMILY_MD",
                                recipientUserId: "usr-patient-1",
                                body: "Vaalaykum assalom Zulfiya! Sorbiferni choy yoki sutsiz, oddiy suv bilan iching. Ko'rigimda gemoglobin va ortostatik bosimni tekshiramiz.",
                                channel: "WEB",
                                createdAt: new Date(Date.now() - 40 * 60000),
                            },
                        ],
                    });
                }
            }
        }
        return;
    }
    if (!seedingPromise) {
        seedingPromise = resetDemoDatabase().finally(() => {
            seedingPromise = null;
        });
    }
    await seedingPromise;
}
export async function resetDemoDatabase() {
    backfillChecked = true;
    slaMemoryQueue.clear();
    await prisma.$transaction([
        prisma.directMessage.deleteMany(),
        prisma.complaint.deleteMany(),
        prisma.subscriptionRecord.deleteMany(),
        prisma.telegramSession.deleteMany(),
        prisma.auditLog.deleteMany(),
        prisma.invoice.deleteMany(),
        prisma.activeCall.deleteMany(),
        prisma.prescription.deleteMany(),
        prisma.labReport.deleteMany(),
        prisma.ehrRecord.deleteMany(),
        prisma.patient.deleteMany(),
        prisma.user.deleteMany(),
        prisma.systemSimState.deleteMany(),
    ]);
    await seedDemoData();
}
async function seedDemoData() {
    const now = new Date();
    const hoursAgo = (h) => new Date(now.getTime() - h * 3600 * 1000);
    const hoursFrom = (base, h) => new Date(base.getTime() + h * 3600 * 1000);
    const defaultPasswordHash = hashPassword("Demo1234!");
    await prisma.systemSimState.upsert({
        where: { id: "singleton" },
        update: { timeOffsetHours: 0 },
        create: { id: "singleton", timeOffsetHours: 0 },
    });
    // 1. Users (4 distinct RBAC roles + second Family MD for Namangan, all pre-verified)
    const ovabmuDoc = await prisma.user.create({
        data: {
            id: "usr-ovabmu-1",
            email: "a.rahimova@ovabmu.uz",
            passwordHash: defaultPasswordHash,
            fullName: "Dr. Aziza Rahimova",
            role: "OVABMU_MD",
            verificationStatus: "VERIFIED",
            verifiedAt: now,
            polyclinicId: "OVABMU-TSH-01",
            polyclinicName: "Respublika Ona va Bola Salomatligi Markazi (OvaBMU)",
            district: "Toshkent shahri",
            specialty: "Oliy toifali akusher-ginekolog, reanimatsiya bo'limi",
            expertiseArea: "Akusherlik, og'ir preeklampsiya va tug'ruqdan keyingi reanimatsiya",
            experienceYears: 12,
            bioSummary: "Respublika Ona va Bola Markazi yetakchi akusher-ginekologi.",
            latitude: 41.3266,
            longitude: 69.3422,
            phone: "+998 90 311-45-10",
            telegramHandle: "@dr_aziza_ovabmu",
            subscriptionTier: "DOCTOR_PRO",
            subscriptionStatus: "ACTIVE",
            subscriptionExpiresAt: new Date(now.getTime() + 30 * 86400000),
            scheduleSlotsJson: "[]",
        },
    });
    const familyDocTashkent = await prisma.user.create({
        data: {
            id: "usr-family-tashkent",
            email: "d.toshmatova@op14.uz",
            passwordHash: defaultPasswordHash,
            fullName: "Dr. Dilnoza Toshmatova",
            role: "FAMILY_MD",
            verificationStatus: "VERIFIED",
            verifiedAt: now,
            polyclinicId: "OP-14-YUNUSOBOD",
            polyclinicName: "14-sonli Oilaviy Poliklinika (Yunusobod / Chilonzor)",
            district: "Yunusobod, Chilonzor",
            specialty: "Hududiy oilaviy shifokor (Patronaj guruhi)",
            expertiseArea: "Hududiy oilaviy shifokor, tug'ruqdan keyingi patronaj va anemiya nazorati",
            experienceYears: 8,
            bioSummary: "14-sonli Oilaviy Poliklinika patronaj shifokori, uyda tashriflar mutaxassisi.",
            latitude: 41.331,
            longitude: 69.254,
            phone: "+998 90 772-18-44",
            telegramHandle: "@dr_dilnoza_op14",
            subscriptionTier: "DOCTOR_PRO",
            subscriptionStatus: "ACTIVE",
            subscriptionExpiresAt: new Date(now.getTime() + 30 * 86400000),
            scheduleSlotsJson: JSON.stringify([
                { slotId: "slot-1", startHourOffset: 2, endHourOffset: 4, bookedPatientId: "pat-zulfiya" },
                { slotId: "slot-2", startHourOffset: 5, endHourOffset: 7, bookedPatientId: null },
                { slotId: "slot-3", startHourOffset: 9, endHourOffset: 11, bookedPatientId: null },
            ]),
        },
    });
    const familyDocNamangan = await prisma.user.create({
        data: {
            id: "usr-family-namangan",
            email: "s.mirzayev@op3-nam.uz",
            passwordHash: defaultPasswordHash,
            fullName: "Dr. Sardorbek Mirzayev",
            role: "FAMILY_MD",
            verificationStatus: "VERIFIED",
            verifiedAt: now,
            polyclinicId: "OP-03-NAMANGAN",
            polyclinicName: "3-sonli Oilaviy Poliklinika (Davlatobod, Namangan)",
            district: "Davlatobod, Namangan",
            specialty: "Hududiy oilaviy shifokor",
            expertiseArea: "Oilaviy tibbiyot, sepsis skriningi va chaqaloqlar parvarishi",
            experienceYears: 6,
            bioSummary: "Namangan Davlatobod tumani 3-sonli poliklinika oilaviy shifokori.",
            latitude: 41.0085,
            longitude: 71.6083,
            phone: "+998 93 412-90-12",
            telegramHandle: "@dr_sardor_namangan",
            subscriptionTier: "FREE",
            subscriptionStatus: "NONE",
            scheduleSlotsJson: JSON.stringify([
                { slotId: "slot-n1", startHourOffset: 14, endHourOffset: 16, bookedPatientId: "pat-dilfuza" },
                { slotId: "slot-n2", startHourOffset: 18, endHourOffset: 20, bookedPatientId: null },
            ]),
        },
    });
    const patientUser = await prisma.user.create({
        data: {
            id: "usr-patient-1",
            email: "zulfiya.rustamova@patient.uz",
            passwordHash: defaultPasswordHash,
            fullName: "Zulfiya Rustamova",
            role: "PATIENT",
            verificationStatus: "VERIFIED",
            verifiedAt: now,
            polyclinicId: "OP-14-YUNUSOBOD",
            polyclinicName: "14-sonli Oilaviy Poliklinika",
            district: "Chilonzor",
            specialty: "Bemor",
            latitude: 41.2753,
            longitude: 69.2036,
            phone: "+998 90 554-21-09",
            telegramHandle: "@zulfiya_r",
            subscriptionTier: "CARE_PLUS",
            subscriptionStatus: "ACTIVE",
            subscriptionExpiresAt: new Date(now.getTime() + 30 * 86400000),
        },
    });
    const adminUser = await prisma.user.create({
        data: {
            id: "usr-admin-1",
            email: "sh.alimov@ssv.uz",
            passwordHash: defaultPasswordHash,
            fullName: "Sherzod Alimov",
            role: "ADMIN_RECEPTION",
            verificationStatus: "VERIFIED",
            verifiedAt: now,
            polyclinicId: "TTB-ADMIN-01",
            polyclinicName: "Tuman Tibbiyot Birlashmasi — Qabulxona va SLA Nazorati",
            district: "Toshkent / Namangan",
            specialty: "Bosh koordinator / Qabulxona admini",
            phone: "+998 99 801-12-00",
            telegramHandle: "@ttb_admin_sla",
        },
    });
    // =========================================================================
    // CASE 1: Malika Karimova — INPATIENT in OvaBMU (Ready for Live Discharge Demo!)
    // =========================================================================
    const malikaJshshir = "49704185230024";
    const malika = await prisma.patient.create({
        data: {
            id: "pat-malika",
            fullName: "Malika Karimova",
            jshshirEncrypted: encryptField(malikaJshshir),
            jshshirMasked: maskJshshir(malikaJshshir),
            dateOfBirth: "1997-04-18",
            phone: "+998 90 441-88-32",
            district: "Yunusobod",
            mahalla: "Bog'ishamol MFY",
            address: "Bog'ishamol ko'chasi, 42-uy, 12-xonadon",
            bloodType: "A(II) Rh+",
            allergiesJson: JSON.stringify(["Penitsillin (toshma)", "Sulfanilamidlar"]),
            polyclinicId: "OP-14-YUNUSOBOD",
            polyclinicName: "14-sonli Oilaviy Poliklinika (Yunusobod)",
            assignedFamilyDoctorId: familyDocTashkent.id,
            emergencyContact: "Karimov Rustam (Turmush o'rtog'i) • +998 90 441-88-33",
            status: "INPATIENT",
            bedNumber: "Palata №204 (Akusherlik reanimatsiya)",
            admittedAt: hoursAgo(96),
        },
    });
    const malikaUziKey = "imaging/malika-uzi-doppler.svg";
    await putStorageObject(malikaUziKey, buildUltrasoundSvg(malika.fullName, "Bachadon involyutsiyasi 132mm • Chok sohasida gematoma yo'q • Doppler N"), "image/svg+xml");
    const malikaVitals = {
        systolicBp: 158,
        diastolicBp: 98,
        heartRate: 94,
        tempC: 37.1,
        spo2: 97,
        respRate: 20,
        recordedAt: hoursAgo(1).toISOString(),
        phase: "INPATIENT_PRE_DISCHARGE",
    };
    await prisma.ehrRecord.create({
        data: {
            id: "ehr-malika-1",
            patientId: malika.id,
            authorId: ovabmuDoc.id,
            recordType: "INPATIENT_SUMMARY",
            diagnosisIcd10: "O14.1",
            diagnosisText: "Og'ir preeklampsiya. Shoshilinch kesarcha kesishdan keyingi 4-sutka. Yengil darajadagi gipoproteinemiya va o'rta darajali anemiya.",
            severity: "SEVERE",
            clinicalNotesEncrypted: encryptField("Bemor og'ir preeklampsiya (AQB 175/110, proteinuriya 3.2 g/L) bilan qabul qilindi. Magneziya terapiyasi (MgSO4) va shoshilinch kesarcha kesish o'tkazildi. Hozirda ahvoli barqarorlashgan, lekin AQB 158/98 mmHg saqlanmoqda. Uy sharoitida qat'iy 24 soatlik oilaviy shifokor patronaji talab etiladi."),
            vitalsJson: JSON.stringify(malikaVitals),
            proceduresJson: JSON.stringify([
                "Shoshilinch kesarcha kesish (Pfannenshtil)",
                "Vena ichiga MgSO4 25% yuklama va tutib turuvchi terapiya",
                "Antigipertenziv kombinatsiyalangan terapiya",
            ]),
            dischargeDocumentKey: malikaUziKey,
        },
    });
    const malikaLabs = [
        { testName: "Hemoglobin (Hb)", value: "96", numericValue: 96, unit: "g/L", refRange: "120–145", flag: "LOW" },
        { testName: "Proteinuria (24h Urine)", value: "2.4", numericValue: 2.4, unit: "g/L", refRange: "< 0.15", flag: "CRITICAL" },
        { testName: "Platelets (PLT)", value: "138", numericValue: 138, unit: "×10⁹/L", refRange: "150–400", flag: "LOW" },
        { testName: "ALT (Alanine Transaminase)", value: "54", numericValue: 54, unit: "U/L", refRange: "7–35", flag: "HIGH" },
        { testName: "Creatinine", value: "88", numericValue: 88, unit: "µmol/L", refRange: "44–80", flag: "HIGH" },
    ];
    await prisma.labReport.create({
        data: {
            id: "lab-malika-1",
            patientId: malika.id,
            orderedById: ovabmuDoc.id,
            panelName: "OvaBMU Preeklampsiya & HELLP Skrining Paneli",
            status: "COMPLETED",
            resultsJson: JSON.stringify(malikaLabs),
            attachmentKey: malikaUziKey,
            reportedAt: hoursAgo(3),
        },
    });
    await prisma.prescription.createMany({
        data: [
            {
                id: "rx-malika-1",
                patientId: malika.id,
                prescribedById: ovabmuDoc.id,
                medicationName: "Nifedipin SR",
                dosage: "20 mg",
                frequency: "Kuniga 2 mahal (ertalab va kechqurun)",
                durationDays: 14,
                instructionsUz: "Qon bosimini o'lchab iching, chaynamasdan yuting.",
                instructionsRu: "Принимать 2 раза в день под контролем АД, не разжевывать.",
                instructionsEn: "Take twice daily with BP monitoring; swallow whole.",
                pharmacyStockStatus: "IN_STOCK",
                polyclinicPharmacy: "14-OP Ijtimoiy Dorixonasi",
                adherenceLogsJson: JSON.stringify([{ date: now.toISOString().slice(0, 10), taken: true }]),
            },
            {
                id: "rx-malika-2",
                patientId: malika.id,
                prescribedById: ovabmuDoc.id,
                medicationName: "Metildopa (Dopegit)",
                dosage: "250 mg",
                frequency: "Kuniga 3 mahal",
                durationDays: 14,
                instructionsUz: "Emizikli onalar uchun xavfsiz, muntazam qabul qiling.",
                instructionsRu: "Безопасно при лактации, принимать регулярно 3 раза в день.",
                instructionsEn: "Safe for breastfeeding; take 3 times daily regularly.",
                pharmacyStockStatus: "IN_STOCK",
                polyclinicPharmacy: "14-OP Ijtimoiy Dorixonasi",
                adherenceLogsJson: JSON.stringify([{ date: now.toISOString().slice(0, 10), taken: true }]),
            },
            {
                id: "rx-malika-3",
                patientId: malika.id,
                prescribedById: ovabmuDoc.id,
                medicationName: "Ferrum Lek (Temir III)",
                dosage: "100 mg",
                frequency: "Kuniga 1 mahal ovqat bilan",
                durationDays: 30,
                instructionsUz: "Gemoglobinni tiklash uchun choy va sutsiz iching.",
                instructionsRu: "Для восстановления гемоглобина, не запивать чаем или молоком.",
                instructionsEn: "Take once daily with food for anemia recovery; avoid tea.",
                pharmacyStockStatus: "RESERVED",
                polyclinicPharmacy: "14-OP Ijtimoiy Dorixonasi",
                adherenceLogsJson: JSON.stringify([]),
            },
        ],
    });
    // =========================================================================
    // CASE 2: Zulfiya Rustamova — PATRONAGE_ACTIVE (Discharged 9.5h ago -> Green, flips to Red on +12h!)
    // =========================================================================
    const zulfiyaJshshir = "49208116040057";
    const zulfiyaDischargeTime = hoursAgo(9.5);
    const zulfiya = await prisma.patient.create({
        data: {
            id: "pat-zulfiya",
            userId: patientUser.id,
            fullName: "Zulfiya Rustamova",
            jshshirEncrypted: encryptField(zulfiyaJshshir),
            jshshirMasked: maskJshshir(zulfiyaJshshir),
            dateOfBirth: "1992-08-11",
            phone: "+998 90 554-21-09",
            district: "Chilonzor",
            mahalla: "Qatortol MFY",
            address: "Qatortol 7-mavze, 18-uy, 45-xonadon",
            latitude: 41.2753,
            longitude: 69.2036,
            bloodType: "O(I) Rh-",
            allergiesJson: JSON.stringify(["Allergiya aniqlanmagan"]),
            polyclinicId: "OP-14-YUNUSOBOD",
            polyclinicName: "14-sonli Oilaviy Poliklinika (Chilonzor filiali)",
            assignedFamilyDoctorId: familyDocTashkent.id,
            emergencyContact: "Rustamov Bobur (Turmush o'rtog'i) • +998 90 554-21-10",
            status: "PATRONAGE_ACTIVE",
            bedNumber: null,
            subscriptionTier: "CARE_PLUS",
            subscriptionStatus: "ACTIVE",
            subscriptionExpiresAt: new Date(now.getTime() + 30 * 86400000),
            admittedAt: hoursAgo(120),
            dischargedAt: zulfiyaDischargeTime,
        },
    });
    const zulfiyaEpikrizKey = "ovabmu-epikriz/zulfiya-epikriz.html";
    const zulfiyaNotes = "Tug'ruqdan keyingi erta davrda atonik qon ketish (1100 ml). Uterotoniklar, B-Lynch chok va 2 birlik eritrotsitar massa quyildi. Chiqarish vaqtida Hb 78 g/L, ortostatik bosh aylanishi saqlanmoqda. 24 soatlik majburiy patronaj belgilandi.";
    await putStorageObject(zulfiyaEpikrizKey, buildEpikrizDocumentHtml({
        patientName: zulfiya.fullName,
        jshshirMasked: zulfiya.jshshirMasked,
        dob: zulfiya.dateOfBirth,
        district: zulfiya.district,
        mahalla: zulfiya.mahalla,
        diagnosisIcd10: "O72.1",
        diagnosisText: "Tug'ruqdan keyingi og'ir atonik qon ketish. Og'ir darajadagi postgemorragik temir tanqisligi anemiyasi.",
        severity: "SEVERE",
        clinicalNotes: zulfiyaNotes,
        polyclinicName: zulfiya.polyclinicName,
        doctorName: ovabmuDoc.fullName,
        dischargedAt: zulfiyaDischargeTime.toISOString(),
    }));
    await prisma.ehrRecord.create({
        data: {
            id: "ehr-zulfiya-1",
            patientId: zulfiya.id,
            authorId: ovabmuDoc.id,
            recordType: "DISCHARGE_EPIKRIZ",
            diagnosisIcd10: "O72.1",
            diagnosisText: "Tug'ruqdan keyingi og'ir atonik qon ketish va og'ir postgemorragik anemiya",
            severity: "SEVERE",
            clinicalNotesEncrypted: encryptField(zulfiyaNotes),
            vitalsJson: JSON.stringify({
                systolicBp: 98,
                diastolicBp: 62,
                heartRate: 104,
                tempC: 36.7,
                spo2: 96,
                respRate: 19,
                recordedAt: zulfiyaDischargeTime.toISOString(),
                phase: "INPATIENT_PRE_DISCHARGE",
            }),
            proceduresJson: JSON.stringify([
                "B-Lynch bachadon kompressiya choki",
                "Eritrotsitar massa transfuziyasi (2 dona)",
                "Vena ichiga Temir karboksimaltoza (Ferinject)",
            ]),
            dischargeDocumentKey: zulfiyaEpikrizKey,
            createdAt: zulfiyaDischargeTime,
        },
    });
    await prisma.labReport.create({
        data: {
            id: "lab-zulfiya-1",
            patientId: zulfiya.id,
            orderedById: ovabmuDoc.id,
            panelName: "Chiqarish Qon Umumiy Tahlili va Koagulogramma",
            status: "COMPLETED",
            resultsJson: JSON.stringify([
                { testName: "Hemoglobin (Hb)", value: "78", numericValue: 78, unit: "g/L", refRange: "120–145", flag: "CRITICAL" },
                { testName: "Hematocrit (HCT)", value: "24.2", numericValue: 24.2, unit: "%", refRange: "36–44", flag: "LOW" },
                { testName: "Fibrinogen", value: "2.1", numericValue: 2.1, unit: "g/L", refRange: "2.0–4.0", flag: "NORMAL" },
                { testName: "Ferritin", value: "11", numericValue: 11, unit: "ng/mL", refRange: "15–150", flag: "LOW" },
            ]),
            attachmentKey: zulfiyaEpikrizKey,
            reportedAt: hoursAgo(11),
        },
    });
    await prisma.prescription.createMany({
        data: [
            {
                id: "rx-zulfiya-1",
                patientId: zulfiya.id,
                prescribedById: ovabmuDoc.id,
                medicationName: "Sorbifer Durules",
                dosage: "320 mg + 60 mg",
                frequency: "Kuniga 2 mahal",
                durationDays: 45,
                instructionsUz: "Ovqatdan 30 daqiqa oldin 1 stakan suv bilan iching.",
                instructionsRu: "За 30 минут до еды, запивать стаканом воды.",
                instructionsEn: "Take 30 min before meals with a full glass of water.",
                pharmacyStockStatus: "IN_STOCK",
                polyclinicPharmacy: "14-OP Ijtimoiy Dorixonasi",
                adherenceLogsJson: JSON.stringify([{ date: now.toISOString().slice(0, 10), taken: true }]),
            },
            {
                id: "rx-zulfiya-2",
                patientId: zulfiya.id,
                prescribedById: ovabmuDoc.id,
                medicationName: "Foliy kislotasi",
                dosage: "5 mg",
                frequency: "Kuniga 1 mahal",
                durationDays: 30,
                instructionsUz: "Ertalab nonushtadan keyin iching.",
                instructionsRu: "Утром после завтрака 1 раз в день.",
                instructionsEn: "Take once daily after breakfast.",
                pharmacyStockStatus: "IN_STOCK",
                polyclinicPharmacy: "14-OP Ijtimoiy Dorixonasi",
                adherenceLogsJson: JSON.stringify([]),
            },
        ],
    });
    const zulfiyaChecklist = [
        {
            id: "chk-ortho",
            titleUz: "Ortostatik qon bosimi, puls va shilliq qavat rangparligini tekshirish",
            titleRu: "Проверка ортостатического АД, пульса и бледности",
            titleEn: "Assess orthostatic BP, pulse, and mucosal pallor",
            category: "VITALS",
            checked: false,
        },
        {
            id: "chk-uterus",
            titleUz: "Bachadon tubi balandligi, tonusi va loxiyalar hajmini baholash",
            titleRu: "Оценка высоты дна матки, тонуса и лохий",
            titleEn: "Assess uterine fundal height, tone, and lochia volume",
            category: "PHYSICAL_EXAM",
            checked: false,
        },
        {
            id: "chk-hb",
            titleUz: "Uyda qon umumiy tahlili (Gemoglobin/Gematokrit) qayta nazorati",
            titleRu: "Повторный контроль ОАК (Гемоглобин/Гематокрит)",
            titleEn: "Follow-up CBC (Hemoglobin/Hematocrit) blood test",
            category: "LAB_CHECK",
            checked: false,
        },
        {
            id: "chk-iron",
            titleUz: "Sorbifer Durules va Foliy kislotasi qabulini tekshirish",
            titleRu: "Контроль приема Сорбифер Дурулес и фолиевой кислоты",
            titleEn: "Verify Sorbifer & folic acid adherence",
            category: "MEDICATION",
            checked: false,
        },
        {
            id: "chk-faint",
            titleUz: "Bosh aylanishi, hushdan ketish xavfi va laktatsiya holatini baholash",
            titleRu: "Оценка головокружения и лактации",
            titleEn: "Screen for syncope risk and breastfeeding adequacy",
            category: "RED_FLAG",
            checked: false,
        },
    ];
    const zulfiyaGuide = {
        summaryUz: "Hurmatli Zulfiya, tug'ruqdan keyingi qon yo'qotish va kamqonlik (Hb 78 g/L) sababli sizga 24 soatlik majburiy uy patronaji tayinlandi.",
        summaryRu: "Уважаемая Зульфия, из-за послеродовой анемии (Hb 78 г/л) вам назначен обязательный 24-часовой домашний патронаж.",
        summaryEn: "Dear Zulfiya, due to postpartum hemorrhage and severe anemia (Hb 78 g/L), mandatory 24-hour home patronage has been scheduled.",
        dailyRulesUz: [
            "Temir dorilarini choy, kofe yoki sut bilan ichmang — faqat suv yoki sharbat bilan iching",
            "Yotoqdan keskin turmang — avval o'tirib, 1 daqiqa kuting",
            "Kuniga kamida 2 litr iliq suyuqlik va oqsilga boy taomlar iste'mol qiling",
        ],
        dailyRulesRu: [
            "Не запивайте железо чаем, кофе или молоком — только водой",
            "Не вставайте резко с кровати — сначала посидите 1 минуту",
            "Пейте достаточно воды и употребляйте богатую железом пищу",
        ],
        dailyRulesEn: [
            "Never take iron pills with tea or dairy — use plain water or juice",
            "Rise slowly from bed to prevent orthostatic dizziness",
            "Hydrate well and prioritize iron-rich protein meals",
        ],
        emergencySignsUz: [
            "1 soatda 1 tadan ortiq prokladka to'lib ketsa",
            "Kuchli bosh aylanishi yoki ko'z oldi qorong'ilashsa",
            "Yurak 115+ tezlikda urib nafas qisilsa",
        ],
        emergencySignsRu: [
            "Промокание более 1 прокладки за час",
            "Сильное головокружение или потемнение в глазах",
            "Учащенное сердцебиение (>115 уд/мин) и одышка",
        ],
        emergencySignsEn: [
            "Soaking >1 pad per hour",
            "Severe dizziness or near-fainting",
            "Heart rate >115 bpm with shortness of breath",
        ],
    };
    const zulfiyaTrace = [
        {
            step: 1,
            agentName: "EHR & Lab Synthesis Agent",
            toolCalled: "analyze_inpatient_ehr_and_labs",
            durationMs: 31,
            status: "COMPLETED",
            summary: "Computed Risk Score 86/100 due to Hb 78 g/L (CRITICAL) & tachycardia 104 bpm.",
            structuredOutput: { post_discharge_risk_score: 86, severity: "SEVERE" },
        },
        {
            step: 2,
            agentName: "Territorial Routing & Conflict Agent",
            toolCalled: "route_polyclinic_and_book_24h_slot",
            durationMs: 24,
            status: "COMPLETED",
            summary: "Routed Chilonzor (Qatortol MFY) -> Dr. Dilnoza Toshmatova (OP-14). Conflict-free slot booked.",
            structuredOutput: { doctor: "Dr. Dilnoza Toshmatova", polyclinic: "14-sonli OP" },
        },
        {
            step: 3,
            agentName: "Clinical Checklist & Patient Guide Agent",
            toolCalled: "generate_uz_checklist_and_patient_guide",
            durationMs: 28,
            status: "COMPLETED",
            summary: "Generated 5-item postpartum hemorrhage & anemia Uzbek checklist + multilingual patient guide.",
            structuredOutput: { checklist_items: 5 },
        },
        {
            step: 4,
            agentName: "Autonomous SLA Escalation & Triage Agent",
            toolCalled: "initialize_24h_sla_and_dispatch_alerts",
            durationMs: 19,
            status: "COMPLETED",
            summary: "24h SLA timer started; Telegram alert & Patient OTP 4829 sent.",
            structuredOutput: { priority: "CRITICAL", otp_issued: true },
        },
    ];
    const zulfiyaCall = await prisma.activeCall.create({
        data: {
            id: "call-zulfiya",
            patientId: zulfiya.id,
            dischargedById: ovabmuDoc.id,
            assignedDoctorId: familyDocTashkent.id,
            polyclinicName: "14-sonli Oilaviy Poliklinika (Chilonzor filiali)",
            district: "Chilonzor",
            status: "SCHEDULED",
            priority: "CRITICAL",
            riskScore: 86,
            redFlagsJson: JSON.stringify([
                "Og'ir anemiya: Gemoglobin 78 g/L (kritik past)",
                "Taxikardiya: Puls 104 zarb/daq (gipovolemik xavf)",
                "Postgemorragik ortostatik gipotenziya: AQB 98/62 mmHg",
            ]),
            checklistJson: JSON.stringify(zulfiyaChecklist),
            patientGuideJson: JSON.stringify(zulfiyaGuide),
            scheduledWindowStart: hoursFrom(zulfiyaDischargeTime, 11),
            scheduledWindowEnd: hoursFrom(zulfiyaDischargeTime, 13),
            dischargedAt: zulfiyaDischargeTime,
            slaDeadlineAt: hoursFrom(zulfiyaDischargeTime, 24),
            escalationLevel: 0,
            patientOtpCode: "4829",
            aiAgentTraceJson: JSON.stringify(zulfiyaTrace),
            notificationLogJson: JSON.stringify([
                {
                    id: "notif-zulfiya-1",
                    channel: "TELEGRAM",
                    recipientName: familyDocTashkent.fullName,
                    recipientRole: "FAMILY_MD",
                    recipientHandle: "@dr_dilnoza_op14",
                    message: "🩺 [YANGI AKTIV CHAQIRUV] Bemor: Zulfiya Rustamova (Chilonzor, Qatortol MFY). O72.1 Og'ir anemiya Hb 78 g/L. Xavf: 86/100.",
                    severity: "CRITICAL",
                    sentAt: zulfiyaDischargeTime.toISOString(),
                },
            ]),
        },
    });
    slaMemoryQueue.set(zulfiyaCall.id, {
        activeCallId: zulfiyaCall.id,
        patientId: zulfiya.id,
        assignedDoctorId: familyDocTashkent.id,
        slaDeadlineAtMs: zulfiyaCall.slaDeadlineAt.getTime(),
        dischargedAtMs: zulfiyaDischargeTime.getTime(),
        escalationLevel: 0,
        status: "SCHEDULED",
    });
    // =========================================================================
    // CASE 3: Dilfuza Xolmatova — ESCALATED_12H (Discharged 13.5h ago -> Yellow Warning!)
    // =========================================================================
    const dilfuzaJshshir = "40001257120083";
    const dilfuzaDischargeTime = hoursAgo(13.5);
    const dilfuza = await prisma.patient.create({
        data: {
            id: "pat-dilfuza",
            fullName: "Dilfuza Xolmatova",
            jshshirEncrypted: encryptField(dilfuzaJshshir),
            jshshirMasked: maskJshshir(dilfuzaJshshir),
            dateOfBirth: "2000-01-25",
            phone: "+998 93 611-77-40",
            district: "Davlatobod",
            mahalla: "Yuksalish MFY",
            address: "Yuksalish ko'chasi, 9-uy",
            bloodType: "B(III) Rh+",
            allergiesJson: JSON.stringify(["Novokain"]),
            polyclinicId: "OP-03-NAMANGAN",
            polyclinicName: "3-sonli Oilaviy Poliklinika (Davlatobod, Namangan)",
            assignedFamilyDoctorId: familyDocNamangan.id,
            emergencyContact: "Xolmatov Aziz (Turmush o'rtog'i) • +998 93 611-77-41",
            status: "PATRONAGE_ACTIVE",
            bedNumber: null,
            admittedAt: hoursAgo(110),
            dischargedAt: dilfuzaDischargeTime,
        },
    });
    const dilfuzaEpikrizKey = "ovabmu-epikriz/dilfuza-epikriz.html";
    const dilfuzaNotes = "Tug'ruqdan keyingi endometrit va sepsis xavfi (qabulda WBC 21.2, T 38.6°C). Keng spektrli antibiotik terapiyadan so'ng harorat 37.6°C ga tushdi. Uy sharoitida qat'iy sepsis monitoringi va antibiotik davomiyligi uchun patronaj zarur.";
    await putStorageObject(dilfuzaEpikrizKey, buildEpikrizDocumentHtml({
        patientName: dilfuza.fullName,
        jshshirMasked: dilfuza.jshshirMasked,
        dob: dilfuza.dateOfBirth,
        district: dilfuza.district,
        mahalla: dilfuza.mahalla,
        diagnosisIcd10: "O85.0",
        diagnosisText: "Tug'ruqdan keyingi endometrit / Sepsis nazorati",
        severity: "HIGH_RISK",
        clinicalNotes: dilfuzaNotes,
        polyclinicName: dilfuza.polyclinicName,
        doctorName: ovabmuDoc.fullName,
        dischargedAt: dilfuzaDischargeTime.toISOString(),
    }));
    await prisma.ehrRecord.create({
        data: {
            id: "ehr-dilfuza-1",
            patientId: dilfuza.id,
            authorId: ovabmuDoc.id,
            recordType: "DISCHARGE_EPIKRIZ",
            diagnosisIcd10: "O85.0",
            diagnosisText: "Tug'ruqdan keyingi endometrit (sepsis xavfi)",
            severity: "HIGH_RISK",
            clinicalNotesEncrypted: encryptField(dilfuzaNotes),
            vitalsJson: JSON.stringify({
                systolicBp: 112,
                diastolicBp: 72,
                heartRate: 96,
                tempC: 37.6,
                spo2: 98,
                respRate: 19,
                recordedAt: dilfuzaDischargeTime.toISOString(),
                phase: "INPATIENT_PRE_DISCHARGE",
            }),
            proceduresJson: JSON.stringify([
                "Vena ichiga Seftriakson + Metronidazol terapiyasi",
                "Bachadon bo'shlig'i sanatsiyasi va UZI nazorati",
            ]),
            dischargeDocumentKey: dilfuzaEpikrizKey,
            createdAt: dilfuzaDischargeTime,
        },
    });
    await prisma.labReport.create({
        data: {
            id: "lab-dilfuza-1",
            patientId: dilfuza.id,
            orderedById: ovabmuDoc.id,
            panelName: "Yallig'lanish va Sepsis Markerlar Paneli",
            status: "COMPLETED",
            resultsJson: JSON.stringify([
                { testName: "WBC (Leukocytes)", value: "16.8", numericValue: 16.8, unit: "×10⁹/L", refRange: "4.0–10.5", flag: "HIGH" },
                { testName: "C-Reactive Protein (CRP)", value: "68", numericValue: 68, unit: "mg/L", refRange: "< 10", flag: "CRITICAL" },
                { testName: "Hemoglobin (Hb)", value: "108", numericValue: 108, unit: "g/L", refRange: "120–145", flag: "LOW" },
                { testName: "Procalcitonin", value: "0.42", numericValue: 0.42, unit: "ng/mL", refRange: "< 0.10", flag: "HIGH" },
            ]),
            attachmentKey: dilfuzaEpikrizKey,
            reportedAt: hoursAgo(15),
        },
    });
    await prisma.prescription.create({
        data: {
            id: "rx-dilfuza-1",
            patientId: dilfuza.id,
            prescribedById: ovabmuDoc.id,
            medicationName: "Sefiksim + Metronidazol",
            dosage: "400 mg / 500 mg",
            frequency: "Kuniga 2 mahal",
            durationDays: 7,
            instructionsUz: "Antibiotik kursini to'liq 7 kun yakunlang.",
            instructionsRu: "Завершите полный 7-дневный курс антибиотиков.",
            instructionsEn: "Complete the full 7-day antibiotic regimen.",
            pharmacyStockStatus: "LOW_STOCK",
            polyclinicPharmacy: "3-OP Dorixonasi (Namangan)",
            adherenceLogsJson: JSON.stringify([{ date: now.toISOString().slice(0, 10), taken: true }]),
        },
    });
    const dilfuzaCall = await prisma.activeCall.create({
        data: {
            id: "call-dilfuza",
            patientId: dilfuza.id,
            dischargedById: ovabmuDoc.id,
            assignedDoctorId: familyDocNamangan.id,
            polyclinicName: "3-sonli Oilaviy Poliklinika (Davlatobod, Namangan)",
            district: "Davlatobod",
            status: "ESCALATED_12H",
            priority: "HIGH",
            riskScore: 76,
            redFlagsJson: JSON.stringify([
                "Subfebril isitma: 37.6°C (sepsis qaytalash xavfi)",
                "Leykotsitoz: WBC 16.8 ×10⁹/L va CRP 68 mg/L",
                "12 soatlik SLA chegarasidan oshgan — zudlik bilan ko'rik zarur",
            ]),
            checklistJson: JSON.stringify([
                {
                    id: "chk-temp",
                    titleUz: "Tana harorati, puls va AQB ni o'lchash (qSOFA sepsis skriningi)",
                    titleRu: "Измерение температуры, пульса и АД",
                    titleEn: "Measure temperature, HR, and BP (qSOFA screen)",
                    category: "VITALS",
                    checked: true,
                },
                {
                    id: "chk-palp",
                    titleUz: "Qorin palpatsiyasi, bachadon og'riqliligi va loxiya hidini tekshirish",
                    titleRu: "Пальпация живота и оценка лохий",
                    titleEn: "Abdominal palpation and lochia assessment",
                    category: "PHYSICAL_EXAM",
                    checked: false,
                },
                {
                    id: "chk-wound",
                    titleUz: "Tug'ruq yo'llari chokida qizarish/yiringlash borligini ko'rish",
                    titleRu: "Осмотр швов",
                    titleEn: "Inspect wound for erythema or purulence",
                    category: "RED_FLAG",
                    checked: false,
                },
                {
                    id: "chk-crp",
                    titleUz: "WBC va CRP dinamikasini qayta tekshirish",
                    titleRu: "Повторный контроль WBC и CRP",
                    titleEn: "Follow-up WBC and CRP test",
                    category: "LAB_CHECK",
                    checked: false,
                },
                {
                    id: "chk-abx",
                    titleUz: "Antibiotik terapiya kursini nazorat qilish",
                    titleRu: "Контроль курса антибиотиков",
                    titleEn: "Verify antibiotic course adherence",
                    category: "MEDICATION",
                    checked: false,
                },
            ]),
            patientGuideJson: JSON.stringify({
                summaryUz: "Hurmatli Dilfuza, yallig'lanish xavfini nazorat qilish uchun 24 soatlik shifokor ko'rigi tayinlangan.",
                summaryRu: "Уважаемая Дильфуза, назначен 24-часовой контроль для предотвращения инфекции.",
                summaryEn: "Dear Dilfuza, 24h follow-up scheduled for postpartum infection monitoring.",
                dailyRulesUz: ["Antibiotiklarni soatiga qarab iching", "Haroratni kuniga 2 marta o'lchang"],
                dailyRulesRu: ["Принимайте антибиотики по часам", "Измеряйте температуру 2 раза в день"],
                dailyRulesEn: ["Take antibiotics strictly on schedule", "Check temperature twice daily"],
                emergencySignsUz: ["Harorat 38.0°C dan oshsa", "Qorin pastida kuchli og'riq bo'lsa"],
                emergencySignsRu: ["Температура выше 38.0°C", "Сильная боль внизу живота"],
                emergencySignsEn: ["Fever >38.0°C", "Severe lower abdominal pain"],
            }),
            scheduledWindowStart: hoursFrom(dilfuzaDischargeTime, 14),
            scheduledWindowEnd: hoursFrom(dilfuzaDischargeTime, 16),
            dischargedAt: dilfuzaDischargeTime,
            slaDeadlineAt: hoursFrom(dilfuzaDischargeTime, 24),
            escalationLevel: 1,
            patientOtpCode: "7315",
            aiAgentTraceJson: JSON.stringify([
                {
                    step: 1,
                    agentName: "EHR & Lab Synthesis Agent",
                    toolCalled: "analyze_inpatient_ehr_and_labs",
                    durationMs: 29,
                    status: "COMPLETED",
                    summary: "Risk Score 76/100 (O85.0 Endometritis, WBC 16.8, CRP 68).",
                    structuredOutput: { post_discharge_risk_score: 76 },
                },
                {
                    step: 2,
                    agentName: "Territorial Routing & Conflict Agent",
                    toolCalled: "route_polyclinic_and_book_24h_slot",
                    durationMs: 21,
                    status: "COMPLETED",
                    summary: "Routed Davlatobod, Namangan -> Dr. Sardorbek Mirzayev (OP-03).",
                    structuredOutput: { doctor: "Dr. Sardorbek Mirzayev" },
                },
                {
                    step: 3,
                    agentName: "Clinical Checklist & Patient Guide Agent",
                    toolCalled: "generate_uz_checklist_and_patient_guide",
                    durationMs: 25,
                    status: "COMPLETED",
                    summary: "Generated sepsis & endometritis 5-item checklist in Uzbek.",
                    structuredOutput: { checklist_items: 5 },
                },
                {
                    step: 4,
                    agentName: "Autonomous SLA Escalation & Triage Agent",
                    toolCalled: "evaluate_12h_sla_threshold",
                    durationMs: 16,
                    status: "ESCALATED",
                    summary: "12h SLA threshold crossed (13.5h elapsed) -> Yellow warning dispatched to Dr. Sardorbek Mirzayev.",
                    structuredOutput: { escalation_level: 1, status: "ESCALATED_12H" },
                },
            ]),
            notificationLogJson: JSON.stringify([
                {
                    id: "notif-dilfuza-12h",
                    channel: "TELEGRAM",
                    recipientName: familyDocNamangan.fullName,
                    recipientRole: "FAMILY_MD",
                    recipientHandle: "@dr_sardor_namangan",
                    message: "⚠️ [12 SOAT OGOHLANTIRISH] Bemor Dilfuza Xolmatova (Namangan, Davlatobod) uchun 24 soatlik SLA muddati yarmidan oshdi (13.5 soat)!",
                    severity: "WARNING",
                    sentAt: hoursAgo(1.5).toISOString(),
                },
            ]),
        },
    });
    slaMemoryQueue.set(dilfuzaCall.id, {
        activeCallId: dilfuzaCall.id,
        patientId: dilfuza.id,
        assignedDoctorId: familyDocNamangan.id,
        slaDeadlineAtMs: dilfuzaCall.slaDeadlineAt.getTime(),
        dischargedAtMs: dilfuzaDischargeTime.getTime(),
        escalationLevel: 1,
        status: "ESCALATED_12H",
    });
    // Invoices for active calls (State Guaranteed Free Patronage Coverage + optional diagnostic)
    await prisma.invoice.createMany({
        data: [
            {
                patientId: zulfiya.id,
                activeCallId: zulfiyaCall.id,
                itemCode: "UZ-PATRONAJ-24H",
                description: "24 soatlik majburiy uy patronaji va oilaviy shifokor ko'rigi",
                category: "STATE_GRANT",
                amountUzs: 450000,
                stateCoveredUzs: 450000,
                patientPayableUzs: 0,
                packageName: "Davlat kafolatlangan tibbiy paket",
                status: "COVERED_BY_STATE",
            },
            {
                patientId: zulfiya.id,
                activeCallId: zulfiyaCall.id,
                itemCode: "UZ-LAB-PORTABLE",
                description: "Uyda ko'chma Gemoglobin va ekspress tahlil",
                category: "PAID_DIAGNOSTIC",
                amountUzs: 95000,
                stateCoveredUzs: 0,
                patientPayableUzs: 95000,
                packageName: "Qo'shimcha uy diagnostikasi",
                status: "PAID",
            },
            {
                patientId: dilfuza.id,
                activeCallId: dilfuzaCall.id,
                itemCode: "UZ-PATRONAJ-24H",
                description: "24 soatlik majburiy uy patronaji (Namangan hududi)",
                category: "STATE_GRANT",
                amountUzs: 450000,
                stateCoveredUzs: 450000,
                patientPayableUzs: 0,
                packageName: "Davlat kafolatlangan tibbiy paket",
                status: "COVERED_BY_STATE",
            },
        ],
    });
    // Initial Audit Logs
    await prisma.auditLog.createMany({
        data: [
            {
                actorId: ovabmuDoc.id,
                actorName: ovabmuDoc.fullName,
                actorRole: ovabmuDoc.role,
                action: "TRIGGER_DISCHARGE",
                resourceType: "Patient",
                resourceId: zulfiya.id,
                ipAddress: "10.14.22.108",
                detailsJson: JSON.stringify({ patientName: zulfiya.fullName, diagnosis: "O72.1" }),
                createdAt: zulfiyaDischargeTime,
            },
            {
                actorId: "agentic-coordinator",
                actorName: "Agentic AI Continuity Coordinator",
                actorRole: "AI_COORDINATOR",
                action: "AI_HANDOFF_CREATED",
                resourceType: "ActiveCall",
                resourceId: zulfiyaCall.id,
                ipAddress: "127.0.0.1",
                detailsJson: JSON.stringify({ riskScore: 86, assignedDoctor: familyDocTashkent.fullName }),
                createdAt: zulfiyaDischargeTime,
            },
            {
                actorId: "system-sla-agent",
                actorName: "Autonomous SLA Escalation Agent",
                actorRole: "SYSTEM_AGENT",
                action: "SLA_ESCALATED",
                resourceType: "ActiveCall",
                resourceId: dilfuzaCall.id,
                ipAddress: "127.0.0.1",
                detailsJson: JSON.stringify({
                    patientName: dilfuza.fullName,
                    elapsedHours: 13.5,
                    newStatus: "ESCALATED_12H",
                }),
                createdAt: hoursAgo(1.5),
            },
            {
                actorId: adminUser.id,
                actorName: adminUser.fullName,
                actorRole: adminUser.role,
                action: "VIEW_EHR",
                resourceType: "AdminComplianceBoard",
                resourceId: "sla-monitor",
                ipAddress: "10.14.22.50",
                detailsJson: JSON.stringify({ note: "Clinical notes redacted for ADMIN_RECEPTION role" }),
                createdAt: hoursAgo(0.5),
            },
        ],
    });
    const seededComplaint = await prisma.complaint.create({
        data: {
            id: "cmp-zulfiya-1",
            patientId: zulfiya.id,
            assignedDoctorId: familyDocTashkent.id,
            title: "Bosh aylanishi va holsizlik (turganimda ko'z oldi qorong'ilashyapti)",
            description: "Ertalab o'rnimdan turganimda kuchli bosh aylanishi bo'ldi, qon bosimim 95/60 chiqdi. Sorbifer ichdim, uyga shifokor kelib ko'rsa yaxshi bo'lardi.",
            category: "POSTPARTUM",
            severity: "SEVERE",
            status: "DOCTOR_RESPONDED",
            visitDestination: "HOME",
            visitAddress: "Chilonzor, Qatortol 7-mavze, 18-uy, 45-xonadon",
            latitude: 41.2753,
            longitude: 69.2036,
            distanceKm: 7.5,
            preferredTimeWindow: "Bugun 14:00 – 17:00",
            sourceChannel: "TELEGRAM",
            doctorResponse: "Salom Zulfiya! Yotgan joyingizdan keskin turmang va ko'proq iliq suv iching. Men bugun ko'rikka boraman va qon bosimingizni o'lchayman.",
            doctorRespondedAt: hoursAgo(0.8),
            visitOtpCode: "7392",
        },
    });
    await prisma.directMessage.createMany({
        data: [
            {
                complaintId: seededComplaint.id,
                patientId: zulfiya.id,
                senderUserId: patientUser.id,
                senderName: zulfiya.fullName,
                senderRole: "PATIENT",
                recipientUserId: familyDocTashkent.id,
                body: "Assalomu alaykum doktor! Bugun ertalab turganimda boshim aylandi, Sorbiferni ovqatdan keyin ichsam bo'ladimi?",
                channel: "TELEGRAM",
                createdAt: hoursAgo(0.9),
            },
            {
                complaintId: seededComplaint.id,
                patientId: zulfiya.id,
                senderUserId: familyDocTashkent.id,
                senderName: familyDocTashkent.fullName,
                senderRole: "FAMILY_MD",
                recipientUserId: patientUser.id,
                body: "Vaalaykum assalom Zulfiya! Sorbiferni choy yoki sutsiz, oddiy suv bilan iching. Ko'rigimda gemoglobin va ortostatik bosimni tekshiramiz.",
                channel: "WEB",
                createdAt: hoursAgo(0.7),
            },
        ],
    });
    await prisma.subscriptionRecord.createMany({
        data: [
            {
                userId: patientUser.id,
                targetRole: "PATIENT",
                planCode: "CARE_PLUS",
                planName: "OnaCare Plus (49,000 so'm / oy)",
                priceUzs: 49000,
                paymentMethod: "PAYME",
                status: "ACTIVE",
                startsAt: hoursAgo(48),
                expiresAt: new Date(now.getTime() + 28 * 86400000),
            },
            {
                userId: familyDocTashkent.id,
                targetRole: "DOCTOR",
                planCode: "DOCTOR_PRO",
                planName: "Shifokor GPS Radar PRO (149,000 so'm / oy)",
                priceUzs: 149000,
                paymentMethod: "CLICK",
                status: "ACTIVE",
                startsAt: hoursAgo(72),
                expiresAt: new Date(now.getTime() + 27 * 86400000),
            },
        ],
    });
}
