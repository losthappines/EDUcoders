import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/db";
import { decryptField } from "@/lib/crypto";
import { ensureSeeded } from "@/lib/seed-data";
import {
  canViewClinicalNotes,
  recordAuditLog,
  resolveActorContext,
} from "@/lib/rbac";
import {
  computeSlaMetrics,
  evaluateAllSlaTimers,
  getSimulatedNow,
  getSimulatedOffsetHours,
} from "@/lib/sla-queue";

function sanitizeUser<
  T extends {
    id: string;
    email: string;
    fullName: string;
    role: string;
    polyclinicId: string | null;
    polyclinicName: string | null;
    district: string | null;
    specialty: string | null;
    phone: string | null;
    telegramHandle: string | null;
    scheduleSlotsJson: string;
  },
>(u: T) {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    polyclinicId: u.polyclinicId,
    polyclinicName: u.polyclinicName,
    district: u.district,
    specialty: u.specialty,
    phone: u.phone,
    telegramHandle: u.telegramHandle,
    scheduleSlots: JSON.parse(u.scheduleSlotsJson || "[]"),
  };
}

export async function GET(req: NextRequest) {
  await connection();
  try {
    await ensureSeeded();
    const actor = await resolveActorContext(req);
    if (!actor) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await evaluateAllSlaTimers();

    const simulatedNow = await getSimulatedNow();
    const timeOffsetHours = await getSimulatedOffsetHours();

    const [users, rawPatients, rawCalls, invoices, auditLogs] = await Promise.all([
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
    ]);

    const allowClinical = canViewClinicalNotes(actor.role);

    // Strictly scope data by authenticated role and ownership:
    // - PATIENT: ONLY sees their own Patient record, ActiveCalls, and Invoices; zero AuditLogs
    // - FAMILY_MD: ONLY sees patients/calls routed to their polyclinic or assigned to them
    // - OVABMU_MD: Sees clinical inpatient & discharged patients
    // - ADMIN_RECEPTION: Sees platform-wide SLA, invoices & audit logs (clinical notes redacted)
    const scopedPatients = rawPatients
      .filter((p) => {
        if (p.status === "PENDING_VERIFICATION" || p.status === "REJECTED") {
          return false;
        }
        if (actor.role === "PATIENT") {
          return p.userId === actor.userId;
        }
        if (actor.role === "FAMILY_MD" && actor.polyclinicId) {
          return (
            p.polyclinicId === actor.polyclinicId ||
            p.assignedFamilyDoctorId === actor.userId
          );
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
          diagnosisIcd10:
            allowClinical || actor.role === "PATIENT"
              ? ehr.diagnosisIcd10
              : "[REDACTED]",
          diagnosisText:
            allowClinical || actor.role === "PATIENT"
              ? ehr.diagnosisText
              : "[RBAC REDACTED — CLINICAL ROLE ONLY]",
          severity: ehr.severity,
          clinicalNotes: allowClinical
            ? decryptField(ehr.clinicalNotesEncrypted)
            : "[RBAC REDACTED — AES-256 CLINICAL ACCESS ONLY]",
          encryptionCipherPreview:
            ehr.clinicalNotesEncrypted.slice(0, 34) + "...",
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
          return (
            c.patient.polyclinicId === actor.polyclinicId ||
            c.assignedDoctorId === actor.userId
          );
        }
        return true;
      })
      .map((c) => {
        const sla = computeSlaMetrics(
          c.dischargedAt,
          c.slaDeadlineAt,
          simulatedNow,
          c.status
        );
        return {
          ...c,
          patient: scopedPatientById.get(c.patientId)!,
          assignedDoctor: sanitizeUser(c.assignedDoctor),
          dischargedBy: sanitizeUser(c.dischargedBy),
          redFlags:
            allowClinical || actor.role === "PATIENT"
              ? JSON.parse(c.redFlagsJson || "[]")
              : ["[RBAC REDACTED — CLINICAL DETAILS PROTECTED]"],
          checklist: JSON.parse(c.checklistJson || "[]"),
          patientGuide: JSON.parse(c.patientGuideJson || "{}"),
          symptomCheckins: JSON.parse(c.symptomCheckinsJson || "[]"),
          doctorVitals: c.doctorVitalsJson
            ? JSON.parse(c.doctorVitalsJson)
            : null,
          aiAgentTrace:
            actor.role === "PATIENT"
              ? []
              : JSON.parse(c.aiAgentTraceJson || "[]"),
          notificationLog:
            actor.role === "PATIENT"
              ? []
              : JSON.parse(c.notificationLogJson || "[]"),
          patientOtpCode:
            actor.role === "PATIENT" || actor.role === "FAMILY_MD"
              ? c.patientOtpCode
              : "****",
          sla,
        };
      });

    const scopedInvoices =
      actor.role === "PATIENT"
        ? invoices.filter((inv) => scopedPatientIds.has(inv.patientId))
        : invoices;

    const verifiedUsers = users.filter((u) => u.verificationStatus === "VERIFIED");

    const scopedUsers =
      actor.role === "PATIENT"
        ? verifiedUsers
            .filter(
              (u) =>
                u.id === actor.userId ||
                scopedPatients.some((p) => p.assignedFamilyDoctorId === u.id)
            )
            .map(sanitizeUser)
        : verifiedUsers.map(sanitizeUser);

    const pendingVerificationsCount =
      actor.role === "ADMIN_RECEPTION"
        ? users.filter(
            (u) =>
              (u.role === "PATIENT" ||
                u.role === "OVABMU_MD" ||
                u.role === "FAMILY_MD") &&
              u.verificationStatus === "PENDING"
          ).length
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
      actor,
      simState: {
        timeOffsetHours,
        simulatedNow: simulatedNow.toISOString(),
      },
      pendingVerificationsCount,
      users: scopedUsers,
      patients: scopedPatients,
      activeCalls: scopedCalls,
      invoices: scopedInvoices,
      auditLogs: scopedAuditLogs,
    });
  } catch (error) {
    console.error("GET /api/platform error:", error);
    return NextResponse.json(
      { error: "Failed to load platform state" },
      { status: 500 }
    );
  }
}
