import { prisma } from "./db";
import { slaMemoryQueue } from "./sla-queue";

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
            "cleanSlateVersion" INTEGER NOT NULL DEFAULT 0,
            "telegramBotTokenEnc" TEXT,
            "telegramBotUsername" TEXT,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "system_sim_state_pkey" PRIMARY KEY ("id")
          );
        `);
                await prisma.$executeRawUnsafe(`ALTER TABLE "system_sim_state" ADD COLUMN IF NOT EXISTS "cleanSlateVersion" INTEGER NOT NULL DEFAULT 0`);
                await prisma.$executeRawUnsafe(`ALTER TABLE "system_sim_state" ADD COLUMN IF NOT EXISTS "telegramBotTokenEnc" TEXT`);
                await prisma.$executeRawUnsafe(`ALTER TABLE "system_sim_state" ADD COLUMN IF NOT EXISTS "telegramBotUsername" TEXT`);
                // One-time atomic clean-slate purge: remove all pre-existing demo & test accounts
                // so the database starts completely clean for real user testing.
                await prisma.$transaction(async (tx) => {
                    await tx.$executeRawUnsafe(`
            INSERT INTO "system_sim_state" ("id", "timeOffsetHours", "cleanSlateVersion", "updatedAt")
            VALUES ('singleton', 0, 0, CURRENT_TIMESTAMP)
            ON CONFLICT ("id") DO NOTHING
          `);
                    const claimed = await tx.$executeRawUnsafe(`
            UPDATE "system_sim_state"
            SET "cleanSlateVersion" = 1, "timeOffsetHours" = 0, "updatedAt" = CURRENT_TIMESTAMP
            WHERE "id" = 'singleton' AND "cleanSlateVersion" < 1
          `);
                    if (claimed > 0) {
                        slaMemoryQueue.clear();
                        await tx.directMessage.deleteMany();
                        await tx.complaint.deleteMany();
                        await tx.subscriptionRecord.deleteMany();
                        await tx.telegramSession.deleteMany();
                        await tx.auditLog.deleteMany();
                        await tx.invoice.deleteMany();
                        await tx.activeCall.deleteMany();
                        await tx.prescription.deleteMany();
                        await tx.labReport.deleteMany();
                        await tx.ehrRecord.deleteMany();
                        await tx.patient.deleteMany();
                        await tx.user.deleteMany();
                    }
                });
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
}

export async function resetDemoDatabase() {
    await ensureDatabaseSchema();
    slaMemoryQueue.clear();
    await prisma.systemSimState.upsert({
        where: { id: "singleton" },
        update: { timeOffsetHours: 0 },
        create: { id: "singleton", timeOffsetHours: 0, cleanSlateVersion: 1 },
    });
}
