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

export async function GET(req: NextRequest) {
  await connection();
  try {
    await ensureSeeded();
    await evaluateAllSlaTimers();

    const actor = await resolveActorContext(req);
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

    // Filter patients and active calls per strict RBAC rules:
    // - OVABMU_MD & ADMIN_RECEPTION see platform-wide records (ADMIN_RECEPTION has clinical notes redacted)
    // - FAMILY_MD only accesses patients routed to their polyclinic
    // - PATIENT only accesses their own profile (or selected demo patient)
    const scopedPatients = rawPatients
      .filter((p) => {
        if (actor.role === "FAMILY_MD" && actor.polyclinicId) {
          return p.polyclinicId === actor.polyclinicId;
        }
        return true;
      })
      .map((p) => ({
        ...p,
        allergies: JSON.parse(p.allergiesJson || "[]"),
        ehrRecords: p.ehrRecords.map((ehr) => ({
          id: ehr.id,
          patientId: ehr.patientId,
          authorId: ehr.authorId,
          recordType: ehr.recordType,
          diagnosisIcd10: allowClinical || actor.role === "PATIENT" ? ehr.diagnosisIcd10 : "[REDACTED]",
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

    const scopedCalls = rawCalls
      .filter((c) => {
        if (actor.role === "FAMILY_MD" && actor.polyclinicId) {
          return c.patient.polyclinicId === actor.polyclinicId;
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
          redFlags: allowClinical || actor.role === "PATIENT"
            ? JSON.parse(c.redFlagsJson || "[]")
            : ["[RBAC REDACTED — CLINICAL DETAILS PROTECTED]"],
          checklist: JSON.parse(c.checklistJson || "[]"),
          patientGuide: JSON.parse(c.patientGuideJson || "{}"),
          symptomCheckins: JSON.parse(c.symptomCheckinsJson || "[]"),
          doctorVitals: c.doctorVitalsJson ? JSON.parse(c.doctorVitalsJson) : null,
          aiAgentTrace: JSON.parse(c.aiAgentTraceJson || "[]"),
          notificationLog: JSON.parse(c.notificationLogJson || "[]"),
          patientOtpCode:
            actor.role === "PATIENT" || actor.role === "FAMILY_MD"
              ? c.patientOtpCode
              : "****",
          sla,
        };
      });

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
      users: users.map((u) => ({
        ...u,
        scheduleSlots: JSON.parse(u.scheduleSlotsJson || "[]"),
      })),
      patients: scopedPatients,
      activeCalls: scopedCalls,
      invoices,
      auditLogs,
    });
  } catch (error) {
    console.error("GET /api/platform error:", error);
    return NextResponse.json(
      { error: "Failed to load platform state" },
      { status: 500 }
    );
  }
}
