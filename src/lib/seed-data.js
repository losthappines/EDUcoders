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
                await prisma.$executeRawUnsafe(`ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "deliveryDate" TIMESTAMP(3)`);
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
            "reminderTimesJson" TEXT NOT NULL DEFAULT '[]',
            "remindersEnabled" BOOLEAN NOT NULL DEFAULT true,
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
                await prisma.$executeRawUnsafe(`ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "reminderTimesJson" TEXT NOT NULL DEFAULT '[]'`);
                await prisma.$executeRawUnsafe(`ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "remindersEnabled" BOOLEAN NOT NULL DEFAULT true`);
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
                await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "wellbeing_checkins" (
            "id" TEXT NOT NULL,
            "patientId" TEXT NOT NULL,
            "date" TEXT NOT NULL,
            "mood" INTEGER NOT NULL,
            "answersJson" TEXT NOT NULL DEFAULT '{}',
            "epdsScore" INTEGER,
            "epdsSelfHarmFlag" BOOLEAN NOT NULL DEFAULT false,
            "riskFlag" TEXT NOT NULL DEFAULT 'GREEN',
            "source" TEXT NOT NULL DEFAULT 'WEB',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "wellbeing_checkins_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "wellbeing_checkins_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE
          );
        `);
                await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "wellbeing_checkins_patientId_date_idx" ON "wellbeing_checkins"("patientId", "date")`);
                await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "med_reminder_logs" (
            "id" TEXT NOT NULL,
            "prescriptionId" TEXT NOT NULL,
            "patientId" TEXT NOT NULL,
            "doseAt" TIMESTAMP(3) NOT NULL,
            "preSentAt" TIMESTAMP(3),
            "atDoseSentAt" TIMESTAMP(3),
            "status" TEXT NOT NULL DEFAULT 'PENDING',
            "snoozeCount" INTEGER NOT NULL DEFAULT 0,
            "nextRemindAt" TIMESTAMP(3),
            "telegramMessageId" TEXT,
            "respondedAt" TIMESTAMP(3),
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "med_reminder_logs_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "med_reminder_logs_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "prescriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE
          );
        `);
                await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "med_reminder_logs_prescriptionId_doseAt_key" ON "med_reminder_logs"("prescriptionId", "doseAt")`);
                await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "med_reminder_logs_patientId_status_idx" ON "med_reminder_logs"("patientId", "status")`);
                await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "psych_consents" (
            "id" TEXT NOT NULL,
            "patientId" TEXT NOT NULL,
            "psychologistId" TEXT NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'ACTIVE',
            "shareWellbeing" BOOLEAN NOT NULL DEFAULT true,
            "shareAssistantTopics" BOOLEAN NOT NULL DEFAULT true,
            "selfHarmAlertAt" TIMESTAMP(3),
            "selfHarmAckAt" TIMESTAMP(3),
            "consentedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "withdrawnAt" TIMESTAMP(3),
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "psych_consents_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "psych_consents_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT "psych_consents_psychologistId_fkey" FOREIGN KEY ("psychologistId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
          );
        `);
                await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "psych_consents_patientId_psychologistId_key" ON "psych_consents"("patientId", "psychologistId")`);
                await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "psych_sessions" (
            "id" TEXT NOT NULL,
            "patientId" TEXT NOT NULL,
            "psychologistId" TEXT NOT NULL,
            "sessionType" TEXT NOT NULL DEFAULT 'CHAT',
            "scheduledAt" TIMESTAMP(3) NOT NULL,
            "durationMin" INTEGER NOT NULL DEFAULT 45,
            "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
            "meetingUrl" TEXT,
            "topic" TEXT,
            "reminder10mSentAt" TIMESTAMP(3),
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "psych_sessions_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "psych_sessions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT "psych_sessions_psychologistId_fkey" FOREIGN KEY ("psychologistId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
          );
        `);
                await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "psych_sessions_psychologistId_scheduledAt_idx" ON "psych_sessions"("psychologistId", "scheduledAt")`);
                await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "psych_sessions_patientId_scheduledAt_idx" ON "psych_sessions"("patientId", "scheduledAt")`);
                await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "psych_notes" (
            "id" TEXT NOT NULL,
            "patientId" TEXT NOT NULL,
            "psychologistId" TEXT NOT NULL,
            "sessionId" TEXT,
            "notesEncrypted" TEXT NOT NULL,
            "riskAssessment" TEXT NOT NULL DEFAULT 'LOW',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "psych_notes_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "psych_notes_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT "psych_notes_psychologistId_fkey" FOREIGN KEY ("psychologistId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
          );
        `);
                await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "psych_notes_patientId_psychologistId_idx" ON "psych_notes"("patientId", "psychologistId")`);
                await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "mother_events" (
            "id" TEXT NOT NULL,
            "titleUz" TEXT NOT NULL,
            "titleRu" TEXT NOT NULL,
            "titleEn" TEXT NOT NULL,
            "descriptionUz" TEXT NOT NULL,
            "descriptionRu" TEXT NOT NULL,
            "descriptionEn" TEXT NOT NULL,
            "category" TEXT NOT NULL DEFAULT 'WORKSHOP',
            "status" TEXT NOT NULL DEFAULT 'UPCOMING',
            "format" TEXT NOT NULL DEFAULT 'ONLINE',
            "district" TEXT,
            "locationText" TEXT,
            "hostName" TEXT NOT NULL,
            "hostRole" TEXT NOT NULL DEFAULT 'Perinatal mutaxassis',
            "startsAt" TIMESTAMP(3),
            "endsAt" TIMESTAMP(3),
            "meetingUrl" TEXT,
            "capacity" INTEGER NOT NULL DEFAULT 60,
            "createdById" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "mother_events_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "mother_events_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
          );
        `);
                await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "mother_events_status_startsAt_idx" ON "mother_events"("status", "startsAt")`);
                await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "event_rsvps" (
            "id" TEXT NOT NULL,
            "eventId" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'GOING',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "event_rsvps_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "event_rsvps_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "mother_events"("id") ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT "event_rsvps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
          );
        `);
                await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "event_rsvps_eventId_userId_key" ON "event_rsvps"("eventId", "userId")`);
                await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "event_rsvps_userId_idx" ON "event_rsvps"("userId")`);
                await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "community_posts" (
            "id" TEXT NOT NULL,
            "cohortKey" TEXT NOT NULL DEFAULT 'all',
            "topicTag" TEXT NOT NULL DEFAULT 'BABY_CARE',
            "authorId" TEXT,
            "authorDisplayName" TEXT NOT NULL,
            "authorRole" TEXT NOT NULL DEFAULT 'PATIENT',
            "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
            "title" TEXT NOT NULL,
            "body" TEXT NOT NULL,
            "likesCount" INTEGER NOT NULL DEFAULT 0,
            "likedByJson" TEXT NOT NULL DEFAULT '[]',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "community_posts_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "community_posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
          );
        `);
                await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "community_posts_cohortKey_createdAt_idx" ON "community_posts"("cohortKey", "createdAt")`);
                await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "community_replies" (
            "id" TEXT NOT NULL,
            "postId" TEXT NOT NULL,
            "authorId" TEXT,
            "authorDisplayName" TEXT NOT NULL,
            "authorRole" TEXT NOT NULL DEFAULT 'PATIENT',
            "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
            "body" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "community_replies_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "community_replies_postId_fkey" FOREIGN KEY ("postId") REFERENCES "community_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT "community_replies_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
          );
        `);
                await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "community_replies_postId_createdAt_idx" ON "community_replies"("postId", "createdAt")`);
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
                await prisma.$executeRawUnsafe(`
                  UPDATE "users"
                  SET "subscriptionTier" = 'FREE', "subscriptionStatus" = 'NONE', "subscriptionExpiresAt" = NULL
                  WHERE "role" <> 'PATIENT'
                    AND ("subscriptionTier" <> 'FREE' OR "subscriptionStatus" <> 'NONE' OR "subscriptionExpiresAt" IS NOT NULL)
                `);
                const existingEventsCount = await prisma.motherEvent.count();
                if (existingEventsCount === 0) {
                    const now = Date.now();
                    await prisma.motherEvent.createMany({
                        data: [
                            {
                                id: "evt-live-circle-40d",
                                titleUz: "Ilk 40 kun: uyqusizlik va xavotir bilan kelishish (Jonli audio davra)",
                                titleRu: "Первые 40 дней: бессонница и тревога (Живой аудио-круг)",
                                titleEn: "First 40 Days: Navigating Sleeplessness & Anxiety (Live Audio Circle)",
                                descriptionUz: "Kamerasiz sokin audio davra hozir davom etmoqda. Yangi onalar bilan tajriba almashing va perinatal psixologga savol bering.",
                                descriptionRu: "Сейчас идет спокойный аудио-круг без видеокамер. Обменяйтесь опытом с мамами и задайте вопрос перинатальному психологу.",
                                descriptionEn: "Calm camera-free audio circle currently in progress. Connect with fellow mothers and ask a perinatal psychologist live.",
                                category: "AUDIO_CIRCLE",
                                status: "IN_PROGRESS",
                                format: "TELEGRAM",
                                district: "Toshkent",
                                locationText: "OnaCare Telegram Audio Room",
                                hostName: "Dr. Dilnoza Karimova",
                                hostRole: "Perinatal psixolog",
                                startsAt: new Date(now - 25 * 60000),
                                endsAt: new Date(now + 65 * 60000),
                                meetingUrl: "https://t.me/OnaCarePatronajBot?start=community",
                                capacity: 80,
                            },
                            {
                                id: "evt-live-newborn-care",
                                titleUz: "Chaqaloqni to'g'ri emizish va kekirtirish — Shifokor savol-javobi",
                                titleRu: "Грудное вскармливание и правильное прикладывание — Ответы врача",
                                titleEn: "Newborn Latch, Feeding & Soothing — Pediatrician Q&A",
                                descriptionUz: "Pediatr va patronaj hamshiralar ishtirokida jonli amaliy uchrashuv hozirda o'tkazilmoqda. Istalgan savolni yozishingiz mumkin.",
                                descriptionRu: "Прямой эфир с педиатром и патронажной командой прямо сейчас. Задавайте вопросы по кормлению и уходу за новорожденным.",
                                descriptionEn: "Live interactive Q&A in progress with OnaCare family pediatric nurses covering feeding cues, burping, and milk supply.",
                                category: "WORKSHOP",
                                status: "IN_PROGRESS",
                                format: "ONLINE",
                                district: "Toshkent",
                                locationText: "OnaCare Live Stream",
                                hostName: "Dr. Madina Azizova",
                                hostRole: "Oilaviy shifokor va pediatr",
                                startsAt: new Date(now - 15 * 60000),
                                endsAt: new Date(now + 45 * 60000),
                                meetingUrl: "/hamjamiyat",
                                capacity: 120,
                            },
                            {
                                id: "evt-adding-postpartum-physio",
                                titleUz: "Tug'ruqdan keyingi yumshoq tiklanish va chanoq mushaklari mashqlari",
                                titleRu: "Бережное восстановление после родов и упражнения для тазового дна",
                                titleEn: "Gentle Postpartum Recovery & Pelvic Floor Clinic",
                                descriptionUz: "Yangi seminar qo'shilmoqda: mutaxassis vaqti va video havola tasdiqlanmoqda. Oldindan qiziqish bildirib joy band qiling!",
                                descriptionRu: "Мероприятие добавляется: согласовывается точное время со специалистом. Отметьте участие, чтобы получить уведомление!",
                                descriptionEn: "Event currently being added by clinic coordinators — final schedule and specialist stream link are being confirmed. Reserve early!",
                                category: "WORKSHOP",
                                status: "BEING_ADDED",
                                format: "ONLINE",
                                district: "Yunusobod",
                                locationText: "Online • Vaqti aniqlanmoqda",
                                hostName: "OnaCare Reabilitatsiya Jamoasi",
                                hostRole: "Fizioterapevt va akusher-ginekolog",
                                startsAt: new Date(now + 3 * 86400000),
                                endsAt: new Date(now + 3 * 86400000 + 60 * 60000),
                                capacity: 100,
                            },
                            {
                                id: "evt-adding-clinic-day",
                                titleUz: "Onalar va chaqaloqlar uchun poliklinika ochiq eshiklar kuni",
                                titleRu: "День открытых дверей для мам и малышей в поликлинике",
                                titleEn: "Mothers & Newborn Polyclinic Support Meetup",
                                descriptionUz: "Hududiy poliklinikada oflayn uchrashuv va chaqaloq vazni/sarg'ayish tekshiruvi qo'shilmoqda. Ro'yxatga yozilib qo'ying.",
                                descriptionRu: "Добавляется очная встреча в районной поликлинике: осмотр малыша, взвешивание и советы по уходу. Запишитесь заранее.",
                                descriptionEn: "Local polyclinic offline meetup is being added to the calendar: gentle newborn weight/jaundice check and peer tea circle.",
                                category: "CLINIC_DAY",
                                status: "BEING_ADDED",
                                format: "OFFLINE",
                                district: "Chilonzor",
                                locationText: "Chilonzor 12-Oilaviy poliklinika (aniqlanmoqda)",
                                hostName: "12-Oilaviy Poliklinika Patronaj Jamoasi",
                                hostRole: "Oilaviy shifokor va hamshiralar",
                                startsAt: new Date(now + 5 * 86400000),
                                endsAt: new Date(now + 5 * 86400000 + 120 * 60000),
                                capacity: 45,
                            },
                            {
                                id: "evt-upcoming-sat-bf",
                                titleUz: "Shanba onalar davrasi: Emizish, charchoq va yaqinlardan yordam so'rash",
                                titleRu: "Субботний круг мам: ГВ, усталость и поддержка семьи",
                                titleEn: "Saturday Mothers Circle: Breastfeeding, Fatigue & Family Boundaries",
                                descriptionUz: "Haftalik iliq suhbat: charchoqni qanday kamaytirish va oila a'zolari bilan vazifalarni bo'lishish haqida ochiq muloqot.",
                                descriptionRu: "Еженедельная теплая встреча: как снижать усталость и договариваться о помощи с близкими.",
                                descriptionEn: "Weekly supportive group session focused on balancing feeding routines, maternal rest, and asking family for practical help.",
                                category: "SUPPORT_GROUP",
                                status: "UPCOMING",
                                format: "TELEGRAM",
                                district: "Barcha hududlar",
                                locationText: "Telegram Mini App & Audio",
                                hostName: "Dr. Nargiza Tursunova",
                                hostRole: "Perinatal psixolog",
                                startsAt: new Date(now + 2 * 86400000),
                                endsAt: new Date(now + 2 * 86400000 + 60 * 60000),
                                meetingUrl: "https://t.me/OnaCarePatronajBot?start=community",
                                capacity: 70,
                            },
                            {
                                id: "evt-upcoming-sleep-webinar",
                                titleUz: "Chaqaloq xavfsiz uyqusi va kolika davrini yengil o'tkazish",
                                titleRu: "Безопасный сон малыша и мягкая помощь при коликах",
                                titleEn: "Safe Infant Sleep & Colic Relief Workshop",
                                descriptionUz: "Pediatr bilan amaliy vebinar: chaqaloqni to'g'ri yo'rgaklash, xavfsiz yotqizish (ABCD qoidalari) va gaz chiqarish usullari.",
                                descriptionRu: "Практический вебинар с педиатром: безопасный сон (правила ABCD), пеленание и мягкие приемы при коликах.",
                                descriptionEn: "Practical pediatrician-led session on safe newborn sleep posture, swaddling safety, and gentle evening colic soothing.",
                                category: "WEBINAR",
                                status: "UPCOMING",
                                format: "ONLINE",
                                district: "Barcha hududlar",
                                locationText: "OnaCare Video Webinar",
                                hostName: "Dr. Jasur Abdullayev",
                                hostRole: "Neonatolog",
                                startsAt: new Date(now + 4 * 86400000),
                                endsAt: new Date(now + 4 * 86400000 + 50 * 60000),
                                capacity: 150,
                            },
                        ],
                    });
                }
                const existingPostsCount = await prisma.communityPost.count();
                if (existingPostsCount === 0) {
                    const p1 = await prisma.communityPost.create({
                        data: {
                            id: "post-0-30d-sleep",
                            cohortKey: "d0_30",
                            topicTag: "SLEEP",
                            authorDisplayName: "Anonim ona (Toshkent)",
                            authorRole: "PATIENT",
                            isAnonymous: true,
                            title: "Ilk 2 haftada kechasi har 2 soatda uyg'onyapmiz — bu me'yormi?",
                            body: "Chaqalog'im 12 kunlik. Kechasi har 1.5–2 soatda emish uchun uyg'onadi, o'zim juda charchayapman. Boshqa onalarda ham shunday bo'lganmi?",
                            likesCount: 14,
                            likedByJson: "[]",
                        },
                    });
                    const p2 = await prisma.communityPost.create({
                        data: {
                            id: "post-1-3m-feeding",
                            cohortKey: "m1_3",
                            topicTag: "FEEDING",
                            authorDisplayName: "Malika R. (Yunusobod)",
                            authorRole: "PATIENT",
                            isAnonymous: false,
                            title: "Chaqaloqni to'g'ri kekirtirish (burping) usuli juda yordam berdi",
                            body: "Onalik darslari bo'limidagi yelka va tizzada o'tirg'izib kekirtirish videosini ko'rib sinab ko'rdim — kechki gaz og'riqlari ancha kamaydi!",
                            likesCount: 19,
                            likedByJson: "[]",
                        },
                    });
                    const p3 = await prisma.communityPost.create({
                        data: {
                            id: "post-mental-care",
                            cohortKey: "d0_30",
                            topicTag: "MENTAL_HEALTH",
                            authorDisplayName: "Dr. Dilnoza Karimova",
                            authorRole: "PSYCHOLOGIST",
                            isAnonymous: false,
                            title: "Tug'ruqdan keyingi dastlabki haftalarda ko'z yoshlar va charchoq haqida",
                            body: "Aziz onalar, tug'ruqdan keyingi 3–14 kunlarda gormonal o'zgarishlar sababli kayfiyat tushishi ko'p uchraydi. Agar xavotir 2 haftadan uzoq davom etsa, shaxsiy Psixolog seanslari bo'limida bepul suhbatga yoziling.",
                            likesCount: 27,
                            likedByJson: "[]",
                        },
                    });
                    await prisma.communityReply.createMany({
                        data: [
                            {
                                id: "rep-1",
                                postId: p1.id,
                                authorDisplayName: "OnaCare Patronaj Shifokori",
                                authorRole: "FAMILY_MD",
                                body: "Ha, ilk 2–4 haftada yangi tug'ilgan chaqaloq oshqozoni kichik bo'lgani uchun har 2 soatda emishi tabiiy. Kun davomida chaqaloq uxlaganda siz ham 20–30 daqiqa dam olishga harakat qiling.",
                            },
                            {
                                id: "rep-2",
                                postId: p2.id,
                                authorDisplayName: "Anonim ona",
                                authorRole: "PATIENT",
                                isAnonymous: true,
                                body: "Bizga ham emizishdan keyin 10 daqiqa tik ushlab turish juda foyda berdi, rahmat bo'lishganingiz uchun!",
                            },
                            {
                                id: "rep-3",
                                postId: p3.id,
                                authorDisplayName: "Zilola M.",
                                authorRole: "PATIENT",
                                body: "Shunday iliq qo'llab-quvvatlash uchun katta rahmat, o'qib ancha yengil tortdim.",
                            },
                        ],
                    });
                }
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
