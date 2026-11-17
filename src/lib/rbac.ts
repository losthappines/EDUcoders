import { NextRequest } from "next/server";
import { getSessionFromRequest, VALID_ROLES } from "./auth";
import { prisma } from "./db";
import type { UserRole } from "./types";

export interface ActorContext {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  polyclinicId: string | null;
  polyclinicName: string | null;
  district: string | null;
  ipAddress: string;
}

export async function resolveActorContext(
  req?: NextRequest | Request
): Promise<ActorContext | null> {
  const session = getSessionFromRequest(req);
  if (!session) return null;

  let ipAddress = "10.14.22.108";
  if (req) {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) ipAddress = forwarded.split(",")[0].trim();
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (
    !user ||
    !VALID_ROLES.includes(user.role as UserRole) ||
    user.verificationStatus !== "VERIFIED"
  ) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role as UserRole,
    polyclinicId: user.polyclinicId,
    polyclinicName: user.polyclinicName,
    district: user.district,
    ipAddress,
  };
}

export function canViewClinicalNotes(role: UserRole): boolean {
  return role === "OVABMU_MD" || role === "FAMILY_MD";
}

export function canTriggerDischarge(role: UserRole): boolean {
  return role === "OVABMU_MD";
}

export function canVerifyVisitAsDoctor(role: UserRole): boolean {
  return role === "FAMILY_MD" || role === "OVABMU_MD";
}

export function isStaffRole(role: UserRole): boolean {
  return role === "OVABMU_MD" || role === "FAMILY_MD" || role === "ADMIN_RECEPTION";
}

export async function recordAuditLog(params: {
  actor: Pick<ActorContext, "userId" | "fullName" | "role" | "ipAddress">;
  action:
    | "VIEW_EHR"
    | "TRIGGER_DISCHARGE"
    | "AI_HANDOFF_CREATED"
    | "SLA_ESCALATED"
    | "VISIT_VERIFIED"
    | "SYMPTOM_ALERT"
    | "LAB_FOLLOWUP_ORDERED"
    | "VIEW_FHIR_BUNDLE"
    | "RBAC_DENIED"
    | "ACCOUNT_VERIFIED"
    | "ACCOUNT_REJECTED";
  resourceType: string;
  resourceId: string;
  details: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: params.actor.userId,
      actorName: params.actor.fullName,
      actorRole: params.actor.role,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      ipAddress: params.actor.ipAddress,
      detailsJson: JSON.stringify(params.details),
    },
  });
}
