import { prisma } from "./db";
import type { DoctorScheduleSlot, NotificationLogEntry } from "./types";

interface SlaCacheEntry {
  activeCallId: string;
  patientId: string;
  assignedDoctorId: string;
  slaDeadlineAtMs: number;
  dischargedAtMs: number;
  escalationLevel: number;
  status: string;
}

const globalForSla = globalThis as unknown as {
  __slaQueue?: Map<string, SlaCacheEntry>;
};

export const slaMemoryQueue: Map<string, SlaCacheEntry> =
  globalForSla.__slaQueue ?? new Map<string, SlaCacheEntry>();

if (process.env.NODE_ENV !== "production") {
  globalForSla.__slaQueue = slaMemoryQueue;
}

export async function getSimulatedOffsetHours(): Promise<number> {
  const sim = await prisma.systemSimState.findUnique({
    where: { id: "singleton" },
  });
  return sim?.timeOffsetHours ?? 0;
}

export async function getSimulatedNow(): Promise<Date> {
  const offsetHours = await getSimulatedOffsetHours();
  return new Date(Date.now() + offsetHours * 3600 * 1000);
}

export function computeSlaMetrics(
  dischargedAt: Date,
  slaDeadlineAt: Date,
  simulatedNow: Date,
  status: string
) {
  const totalWindowMs = slaDeadlineAt.getTime() - dischargedAt.getTime();
  const elapsedMs = Math.max(0, simulatedNow.getTime() - dischargedAt.getTime());
  const remainingMs = Math.max(0, slaDeadlineAt.getTime() - simulatedNow.getTime());
  const elapsedHours = elapsedMs / (3600 * 1000);
  const isOverdue = simulatedNow.getTime() > slaDeadlineAt.getTime();

  let zone: "GREEN" | "YELLOW" | "RED" | "COMPLETED" = "GREEN";
  if (status === "COMPLETED") {
    zone = "COMPLETED";
  } else if (elapsedHours >= 18 || isOverdue) {
    zone = "RED";
  } else if (elapsedHours >= 12) {
    zone = "YELLOW";
  }

  return {
    elapsedMs,
    elapsedHours: Number(elapsedHours.toFixed(2)),
    remainingMs,
    totalWindowMs,
    isOverdue,
    zone,
  };
}

export async function findAndBookOptimalDoctorSlot(params: {
  district: string;
  patientId: string;
  simulatedNow: Date;
}) {
  const doctors = await prisma.user.findMany({
    where: { role: "FAMILY_MD", verificationStatus: "VERIFIED" },
  });

  // Prefer district match, fallback to first Family MD
  const matchedDoctor =
    doctors.find((d) =>
      d.district?.toLowerCase().includes(params.district.toLowerCase())
    ) ?? doctors[0];

  if (!matchedDoctor) {
    throw new Error("No Regional Family Doctor available in directory");
  }

  const slots: DoctorScheduleSlot[] = JSON.parse(
    matchedDoctor.scheduleSlotsJson || "[]"
  );

  // Check existing active calls to prevent booking conflicts
  const existingCalls = await prisma.activeCall.findMany({
    where: {
      assignedDoctorId: matchedDoctor.id,
      status: { not: "COMPLETED" },
    },
    select: { scheduledWindowStart: true, scheduledWindowEnd: true, patientId: true },
  });

  let chosenSlot = slots.find((slot) => !slot.bookedPatientId);
  if (!chosenSlot) {
    // Generate next conflict-free 2-hour window inside 24h
    const baseHourOffset = 2 + existingCalls.length * 3;
    chosenSlot = {
      slotId: `slot-auto-${Date.now()}`,
      startHourOffset: Math.min(baseHourOffset, 18),
      endHourOffset: Math.min(baseHourOffset + 2, 20),
      bookedPatientId: params.patientId,
    };
    slots.push(chosenSlot);
  } else {
    chosenSlot.bookedPatientId = params.patientId;
  }

  await prisma.user.update({
    where: { id: matchedDoctor.id },
    data: { scheduleSlotsJson: JSON.stringify(slots) },
  });

  const windowStart = new Date(
    params.simulatedNow.getTime() + chosenSlot.startHourOffset * 3600 * 1000
  );
  const windowEnd = new Date(
    params.simulatedNow.getTime() + chosenSlot.endHourOffset * 3600 * 1000
  );

  return {
    doctor: matchedDoctor,
    chosenSlot,
    windowStart,
    windowEnd,
    conflictsChecked: existingCalls.length,
  };
}

export async function evaluateAllSlaTimers(): Promise<{
  evaluatedCount: number;
  escalatedCount: number;
  simulatedNow: string;
}> {
  const simulatedNow = await getSimulatedNow();
  const openCalls = await prisma.activeCall.findMany({
    where: { status: { not: "COMPLETED" } },
    include: { patient: true, assignedDoctor: true },
  });

  let escalatedCount = 0;

  for (const call of openCalls) {
    const metrics = computeSlaMetrics(
      call.dischargedAt,
      call.slaDeadlineAt,
      simulatedNow,
      call.status
    );

    slaMemoryQueue.set(call.id, {
      activeCallId: call.id,
      patientId: call.patientId,
      assignedDoctorId: call.assignedDoctorId,
      slaDeadlineAtMs: call.slaDeadlineAt.getTime(),
      dischargedAtMs: call.dischargedAt.getTime(),
      escalationLevel: call.escalationLevel,
      status: call.status,
    });

    const targetLevel =
      metrics.zone === "RED" ? 2 : metrics.zone === "YELLOW" ? 1 : 0;

    if (targetLevel > call.escalationLevel) {
      escalatedCount++;
      const existingLogs: NotificationLogEntry[] = JSON.parse(
        call.notificationLogJson || "[]"
      );

      const newNotifications: NotificationLogEntry[] = [];
      if (targetLevel >= 1 && call.escalationLevel < 1) {
        newNotifications.push({
          id: `notif-12h-${Date.now()}-${call.id.slice(-4)}`,
          channel: "TELEGRAM",
          recipientName: call.assignedDoctor.fullName,
          recipientRole: "FAMILY_MD",
          recipientHandle: call.assignedDoctor.telegramHandle || "@family_md",
          message: `⚠️ [12 SOAT OGOHLANTIRISH] Bemor ${call.patient.fullName} uchun 24 soatlik patronaj muddati yarmidan oshdi (${metrics.elapsedHours} soat). Zudlik bilan tashrif buyuring!`,
          severity: "WARNING",
          sentAt: simulatedNow.toISOString(),
        });
      }

      if (targetLevel >= 2 && call.escalationLevel < 2) {
        newNotifications.push({
          id: `notif-18h-${Date.now()}-${call.id.slice(-4)}`,
          channel: "SMS",
          recipientName: "Bosh Shifokor (Poliklinika Mudiri)",
          recipientRole: "CHIEF_DOCTOR",
          recipientHandle: "+998 90 100-00-01",
          message: `🚨 [KRITIK 18+ SOAT ESKALATSIYA] ${call.polyclinicName}: ${call.assignedDoctor.fullName} tomonidan bemor ${call.patient.fullName} (Xavf: ${call.riskScore}/100) bo'yicha uy patronaji bajarilmagan! Bosh shifokor nazoratiga olindi.`,
          severity: "CRITICAL",
          sentAt: simulatedNow.toISOString(),
        });
      }

      const nextStatus =
        targetLevel === 2 ? "CRITICAL_18H" : "ESCALATED_12H";
      const nextPriority = targetLevel === 2 ? "CRITICAL" : call.priority;

      await prisma.$transaction([
        prisma.activeCall.update({
          where: { id: call.id },
          data: {
            escalationLevel: targetLevel,
            status: nextStatus,
            priority: nextPriority,
            notificationLogJson: JSON.stringify([
              ...newNotifications,
              ...existingLogs,
            ]),
          },
        }),
        prisma.auditLog.create({
          data: {
            actorId: "system-sla-agent",
            actorName: "Autonomous SLA Escalation Agent",
            actorRole: "SYSTEM_AGENT",
            action: "SLA_ESCALATED",
            resourceType: "ActiveCall",
            resourceId: call.id,
            ipAddress: "127.0.0.1",
            detailsJson: JSON.stringify({
              patientName: call.patient.fullName,
              elapsedHours: metrics.elapsedHours,
              previousLevel: call.escalationLevel,
              newLevel: targetLevel,
              newStatus: nextStatus,
            }),
          },
        }),
      ]);
    }
  }

  return {
    evaluatedCount: openCalls.length,
    escalatedCount,
    simulatedNow: simulatedNow.toISOString(),
  };
}
