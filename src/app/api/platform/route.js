import { NextResponse, connection } from "next/server";
import { prisma } from "@/lib/db";
import { decryptField } from "@/lib/crypto";
import { ensureSeeded } from "@/lib/seed-data";
import { canViewClinicalNotes, recordAuditLog, resolveActorContext, } from "@/lib/rbac";
import { computeSlaMetrics, evaluateAllSlaTimers, getSimulatedNow, getSimulatedOffsetHours, } from "@/lib/sla-queue";
import { haversineDistanceKm, resolveCoordinatesForLocation } from "@/lib/geo";
function sanitizeUser(u) {
    return {
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        role: u.role,
        polyclinicId: u.polyclinicId,
        polyclinicName: u.polyclinicName,
        district: u.district,
        specialty: u.specialty,
        expertiseArea: u.expertiseArea,
        experienceYears: u.experienceYears,
        bioSummary: u.bioSummary,
        latitude: u.latitude,
        longitude: u.longitude,
        phone: u.phone,
        telegramHandle: u.telegramHandle,
        telegramLinked: Boolean(u.telegramChatId),
        subscriptionTier: u.subscriptionTier,
        subscriptionStatus: u.subscriptionStatus,
        subscriptionExpiresAt: u.subscriptionExpiresAt,
        scheduleSlots: JSON.parse(u.scheduleSlotsJson || "[]"),
    };
}
export async function GET(req) {
    await connection();
    try {
        await ensureSeeded();
        const actor = await resolveActorContext(req);
        if (!actor) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        await evaluateAllSlaTimers();
        const simulatedNow = await getSimulatedNow();
        const timeOffsetHours = await getSimulatedOffsetHours();
        const [users, rawPatients, rawCalls, invoices, auditLogs, rawComplaints, rawMessages, rawSubscriptions] = await Promise.all([
            prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
            prisma.patient.findMany({
                orderBy: { createdAt: "asc" },
                include: {
                    assignedFamilyDoctor: true,
                    ehrRecords: { orderBy: { createdAt: "asc" } },
                    labReports: { orderBy: { reportedAt: "desc" } },
                    prescriptions: { orderBy: { createdAt: "asc" } },
                },
            }),
            prisma.activeCall.findMany({
                orderBy: { slaDeadlineAt: "asc" },
                include: {
                    patient: true,
                    assignedDoctor: true,
                    dischargedBy: true,
                },
            }),
            prisma.invoice.findMany({
                orderBy: { createdAt: "desc" },
                include: { patient: { select: { id: true, fullName: true, district: true } } },
            }),
            prisma.auditLog.findMany({
                orderBy: { createdAt: "desc" },
                take: 40,
            }),
            prisma.complaint.findMany({
                orderBy: { createdAt: "desc" },
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
                            latitude: true,
                            longitude: true,
                        },
                    },
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
            }),
            prisma.directMessage.findMany({
                orderBy: { createdAt: "asc" },
                take: 120,
            }),
            prisma.subscriptionRecord.findMany({
                orderBy: { createdAt: "desc" },
                include: { user: { select: { id: true, fullName: true, role: true } } },
                take: 40,
            }),
        ]);
        const currentUserRow = users.find((u) => u.id === actor.userId);
        const allowClinical = canViewClinicalNotes(actor.role);
        const scopedPatients = rawPatients
            .filter((p) => {
            if (p.status === "PENDING_VERIFICATION" || p.status === "REJECTED") {
                return false;
            }
            if (actor.role === "PATIENT") {
                return p.userId === actor.userId;
            }
            if (actor.role === "FAMILY_MD" && actor.polyclinicId) {
                return (p.polyclinicId === actor.polyclinicId ||
                    p.assignedFamilyDoctorId === actor.userId);
            }
            return true;
        })
            .map((p) => ({
            ...p,
            assignedFamilyDoctor: p.assignedFamilyDoctor
                ? sanitizeUser(p.assignedFamilyDoctor)
                : null,
            allergies: JSON.parse(p.allergiesJson || "[]"),
            ehrRecords: p.ehrRecords.map((ehr) => ({
                id: ehr.id,
                patientId: ehr.patientId,
                authorId: ehr.authorId,
                recordType: ehr.recordType,
                diagnosisIcd10: allowClinical || actor.role === "PATIENT"
                    ? ehr.diagnosisIcd10
                    : "[REDACTED]",
                diagnosisText: allowClinical || actor.role === "PATIENT"
                    ? ehr.diagnosisText
                    : "[RBAC REDACTED — CLINICAL ROLE ONLY]",
                severity: ehr.severity,
                clinicalNotes: allowClinical
                    ? decryptField(ehr.clinicalNotesEncrypted)
                    : "[RBAC REDACTED — AES-256 CLINICAL ACCESS ONLY]",
                encryptionCipherPreview: ehr.clinicalNotesEncrypted.slice(0, 34) + "...",
                vitals: JSON.parse(ehr.vitalsJson || "{}"),
                procedures: allowClinical ? JSON.parse(ehr.proceduresJson || "[]") : [],
                dischargeDocumentKey: allowClinical ? ehr.dischargeDocumentKey : null,
                createdAt: ehr.createdAt,
            })),
            labReports: p.labReports.map((lr) => ({
                ...lr,
                results: JSON.parse(lr.resultsJson || "[]"),
            })),
            prescriptions: p.prescriptions.map((rx) => ({
                ...rx,
                adherenceLogs: JSON.parse(rx.adherenceLogsJson || "[]"),
            })),
        }));
        const scopedPatientIds = new Set(scopedPatients.map((p) => p.id));
        const scopedPatientById = new Map(scopedPatients.map((p) => [p.id, p]));
        const scopedCalls = rawCalls
            .filter((c) => {
            if (!scopedPatientById.has(c.patientId)) {
                return false;
            }
            if (actor.role === "PATIENT") {
                return scopedPatientIds.has(c.patientId);
            }
            if (actor.role === "FAMILY_MD" && actor.polyclinicId) {
                return (c.patient.polyclinicId === actor.polyclinicId ||
                    c.assignedDoctorId === actor.userId);
            }
            return true;
        })
            .map((c) => {
            const sla = computeSlaMetrics(c.dischargedAt, c.slaDeadlineAt, simulatedNow, c.status);
            return {
                ...c,
                patient: scopedPatientById.get(c.patientId),
                assignedDoctor: sanitizeUser(c.assignedDoctor),
                dischargedBy: sanitizeUser(c.dischargedBy),
                redFlags: allowClinical || actor.role === "PATIENT"
                    ? JSON.parse(c.redFlagsJson || "[]")
                    : ["[RBAC REDACTED — CLINICAL DETAILS PROTECTED]"],
                checklist: JSON.parse(c.checklistJson || "[]"),
                patientGuide: JSON.parse(c.patientGuideJson || "{}"),
                symptomCheckins: JSON.parse(c.symptomCheckinsJson || "[]"),
                doctorVitals: c.doctorVitalsJson
                    ? JSON.parse(c.doctorVitalsJson)
                    : null,
                aiAgentTrace: actor.role === "PATIENT"
                    ? []
                    : JSON.parse(c.aiAgentTraceJson || "[]"),
                notificationLog: actor.role === "PATIENT"
                    ? []
                    : JSON.parse(c.notificationLogJson || "[]"),
                patientOtpCode: actor.role === "PATIENT" || actor.role === "FAMILY_MD"
                    ? c.patientOtpCode
                    : "****",
                sla,
            };
        });

        // Scope & distance-rank complaints
        const docLat = currentUserRow?.latitude ?? resolveCoordinatesForLocation(currentUserRow?.district || "", "").latitude;
        const docLng = currentUserRow?.longitude ?? resolveCoordinatesForLocation(currentUserRow?.district || "", "").longitude;
        let scopedComplaints = rawComplaints
            .filter((c) => {
            if (actor.role === "PATIENT") {
                return scopedPatientIds.has(c.patientId);
            }
            return true;
        })
            .map((c) => {
            const liveDistanceKm = (actor.role === "FAMILY_MD" || actor.role === "OVABMU_MD") &&
                typeof c.latitude === "number" &&
                typeof c.longitude === "number"
                ? haversineDistanceKm(docLat, docLng, c.latitude, c.longitude)
                : c.distanceKm;
            return {
                ...c,
                distanceKm: liveDistanceKm,
                verifiedVitals: c.verifiedVitalsJson ? JSON.parse(c.verifiedVitalsJson) : null,
            };
        });
        if (actor.role === "FAMILY_MD" || actor.role === "OVABMU_MD") {
            scopedComplaints = scopedComplaints.sort((a, b) => {
                const aDone = a.status === "VERIFIED_COMPLETED" ? 1 : 0;
                const bDone = b.status === "VERIFIED_COMPLETED" ? 1 : 0;
                if (aDone !== bDone)
                    return aDone - bDone;
                return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
            });
        }

        const scopedMessages = actor.role === "PATIENT"
            ? rawMessages.filter((m) => scopedPatientIds.has(m.patientId))
            : rawMessages;

        const scopedSubscriptions = actor.role === "ADMIN_RECEPTION"
            ? rawSubscriptions
            : rawSubscriptions.filter((s) => s.userId === actor.userId);

        const scopedInvoices = actor.role === "PATIENT"
            ? invoices.filter((inv) => scopedPatientIds.has(inv.patientId))
            : invoices;
        const verifiedUsers = users.filter((u) => u.verificationStatus === "VERIFIED");
        const scopedUsers = actor.role === "PATIENT"
            ? verifiedUsers
                .filter((u) => u.id === actor.userId ||
                u.role === "FAMILY_MD" ||
                scopedPatients.some((p) => p.assignedFamilyDoctorId === u.id))
                .map(sanitizeUser)
            : verifiedUsers.map(sanitizeUser);
        const pendingVerificationsCount = actor.role === "ADMIN_RECEPTION"
            ? users.filter((u) => (u.role === "PATIENT" ||
                u.role === "OVABMU_MD" ||
                u.role === "FAMILY_MD") &&
                u.verificationStatus === "PENDING").length
            : 0;
        const scopedAuditLogs = actor.role === "PATIENT" ? [] : auditLogs;
        if (req.nextUrl.searchParams.get("auditView") === "1") {
            await recordAuditLog({
                actor,
                action: "VIEW_EHR",
                resourceType: "PlatformWorkspace",
                resourceId: actor.role,
                details: {
                    patientCount: scopedPatients.length,
                    clinicalNotesRedacted: !allowClinical,
                },
            });
        }
        return NextResponse.json({
            actor: currentUserRow ? { ...actor, ...sanitizeUser(currentUserRow) } : actor,
            simState: {
                timeOffsetHours,
                simulatedNow: simulatedNow.toISOString(),
            },
            pendingVerificationsCount,
            users: scopedUsers,
            patients: scopedPatients,
            activeCalls: scopedCalls,
            complaints: scopedComplaints,
            directMessages: scopedMessages,
            subscriptions: scopedSubscriptions,
            invoices: scopedInvoices,
            auditLogs: scopedAuditLogs,
        });
    }
    catch (error) {
        console.error("GET /api/platform error:", error);
        return NextResponse.json({ error: "Failed to load platform state" }, { status: 500 });
    }
}
