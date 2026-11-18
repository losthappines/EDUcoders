import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { encryptField } from "@/lib/crypto";
import { canAccessPsychologistPortal, recordAuditLog, resolveActorAfterSeed } from "@/lib/rbac";

const VALID_RISKS = new Set(["LOW", "MODERATE", "HIGH", "CRITICAL"]);

export async function POST(req) {
  try {
    const actor = await resolveActorAfterSeed(req);
    if (!actor || !canAccessPsychologistPortal(actor.role)) {
      return NextResponse.json({ error: "Forbidden — psychologist access only" }, { status: 403 });
    }

    const body = await req.json();
    const patientId = (body.patientId || "").trim();
    const rawNotes = (body.notes || "").trim().slice(0, 4000);
    const riskAssessment = VALID_RISKS.has(body.riskAssessment) ? body.riskAssessment : "LOW";
    const sessionId = body.sessionId ? String(body.sessionId) : null;

    if (!patientId || !rawNotes) {
      return NextResponse.json({ error: "patientId and notes are required" }, { status: 400 });
    }

    const [consent, highRiskCheckin] = await Promise.all([
      prisma.psychConsent.findUnique({
        where: {
          patientId_psychologistId: {
            patientId,
            psychologistId: actor.userId,
          },
        },
      }),
      prisma.wellbeingCheckin.findFirst({
        where: {
          patientId,
          riskFlag: { in: ["SELF_HARM_CRITICAL", "PSYCH_RISK"] },
        },
      }),
    ]);

    if ((!consent || consent.status !== "ACTIVE") && !highRiskCheckin) {
      return NextResponse.json({ error: "Active patient consent is required to save notes" }, { status: 403 });
    }

    const note = await prisma.psychNote.create({
      data: {
        patientId,
        psychologistId: actor.userId,
        sessionId,
        notesEncrypted: encryptField(rawNotes),
        riskAssessment,
      },
    });

    await recordAuditLog({
      actor,
      action: "PSYCH_NOTE_CREATED",
      resourceType: "PsychNote",
      resourceId: note.id,
      details: { patientId, riskAssessment },
    });

    return NextResponse.json(
      {
        success: true,
        note: {
          id: note.id,
          patientId: note.patientId,
          sessionId: note.sessionId,
          riskAssessment: note.riskAssessment,
          notes: rawNotes,
          createdAt: note.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/psychologist/notes error:", error);
    return NextResponse.json({ error: "Failed to save encrypted session note" }, { status: 500 });
  }
}
