import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed-data";
import {
  canVerifyVisitAsDoctor,
  recordAuditLog,
  resolveActorContext,
} from "@/lib/rbac";
import { getSimulatedNow } from "@/lib/sla-queue";
import type { LabResultItem } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    await ensureSeeded();
    const actor = await resolveActorContext(req);
    if (!canVerifyVisitAsDoctor(actor.role)) {
      await recordAuditLog({
        actor,
        action: "RBAC_DENIED",
        resourceType: "ClinicalOrder",
        resourceId: actor.role,
        details: { reason: "Clinical role required to place lab/rx orders" },
      });
      return NextResponse.json({ error: "RBAC Denied" }, { status: 403 });
    }

    const simulatedNow = await getSimulatedNow();
    const body = (await req.json()) as {
      type: "FOLLOWUP_LAB" | "ADD_PRESCRIPTION";
      patientId: string;
      panelName?: string;
      medicationName?: string;
      dosage?: string;
      frequency?: string;
      durationDays?: number;
      instructionsUz?: string;
    };

    if (body.type === "FOLLOWUP_LAB") {
      const panelName = body.panelName || "Uy sharoitida Qayta Qon & Siydik Nazorati";
      const placeholderResults: LabResultItem[] = [
        {
          testName: "Hemoglobin (Hb) — Kutilmoqda",
          value: "Namuna olinadi",
          unit: "g/L",
          refRange: "120–145",
          flag: "NORMAL",
        },
        {
          testName: "CRP / Proteinuria — Kutilmoqda",
          value: "Rejalashtirilgan",
          unit: "mg/L",
          refRange: "< 10",
          flag: "NORMAL",
        },
      ];

      const lab = await prisma.labReport.create({
        data: {
          patientId: body.patientId,
          orderedById: actor.userId,
          panelName,
          status: "ORDERED_FOLLOWUP",
          resultsJson: JSON.stringify(placeholderResults),
          reportedAt: simulatedNow,
        },
      });

      await recordAuditLog({
        actor,
        action: "LAB_FOLLOWUP_ORDERED",
        resourceType: "LabReport",
        resourceId: lab.id,
        details: { patientId: body.patientId, panelName },
      });

      return NextResponse.json({ success: true, lab });
    }

    if (body.type === "ADD_PRESCRIPTION") {
      const rx = await prisma.prescription.create({
        data: {
          patientId: body.patientId,
          prescribedById: actor.userId,
          medicationName: body.medicationName || "Magne B6",
          dosage: body.dosage || "100 mg",
          frequency: body.frequency || "Kuniga 2 mahal",
          durationDays: Number(body.durationDays) || 14,
          instructionsUz: body.instructionsUz || "Ovqatdan keyin suv bilan iching.",
          instructionsRu: "Принимать после еды.",
          instructionsEn: "Take after meals with water.",
          pharmacyStockStatus: "IN_STOCK",
          polyclinicPharmacy: "Hududiy Ijtimoiy Dorixona",
          adherenceLogsJson: "[]",
        },
      });

      return NextResponse.json({ success: true, prescription: rx });
    }

    return NextResponse.json({ error: "Unsupported order type" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/clinical/orders error:", error);
    return NextResponse.json({ error: "Failed to create clinical order" }, { status: 500 });
  }
}
