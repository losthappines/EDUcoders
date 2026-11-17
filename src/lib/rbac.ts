import { NextRequest } from "next/server";
import { prisma } from "./db";
import type { UserRole } from "./types";

export interface ActorContext {
  userId: string;
  fullName: string;
  role: UserRole;
  polyclinicId: string | null;
  district: string | null;
  ipAddress: string;
}

const VALID_ROLES: UserRole[] = [
  "OVABMU_MD",
  "FAMILY_MD",
  "PATIENT",
  "ADMIN_RECEPTION",
];

export async function resolveActorContext(
  req?: NextRequest | Request,
  overrideRole?: UserRole,
  overrideUserId?: string
): Promise<ActorContext> {
  let roleHeader: string | null = overrideRole ?? null;
  let userIdHeader: string | null = overrideUserId ?? null;
  let ipAddress = "10.14.22.108";

  if (req) {
    roleHeader = roleHeader || req.headers.get("x-demo-role");
    userIdHeader = userIdHeader || req.headers.get("x-demo-user-id");
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) ipAddress = forwarded.split(",")[0].trim();

    if ("cookies" in req && typeof req.cookies?.get === "function") {
      if (!roleHeader) roleHeader = req.cookies.get("patronaj_role")?.value ?? null;
      if (!userIdHeader) userIdHeader = req.cookies.get("patronaj_user_id")?.value ?? null;
    }
  }

  const targetRole: UserRole =
    roleHeader && VALID_ROLES.includes(roleHeader as UserRole)
      ? (roleHeader as UserRole)
      : "OVABMU_MD";

  let user = userIdHeader
    ? await prisma.user.findUnique({ where: { id: userIdHeader } })
    : null;

  if (!user || user.role !== targetRole) {
    user = await prisma.user.findFirst({ where: { role: targetRole } });
  }

  if (!user) {
    return {
      userId: `anon-${targetRole.toLowerCase()}`,
      fullName: `Demo ${targetRole}`,
      role: targetRole,
      polyclinicId: null,
      district: null,
      ipAddress,
    };
  }

  return {
    userId: user.id,
    fullName: user.fullName,
    role: user.role as UserRole,
    polyclinicId: user.polyclinicId,
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

export async function recordAuditLog(params: {
  actor: ActorContext;
  action:
    | "VIEW_EHR"
    | "TRIGGER_DISCHARGE"
    | "AI_HANDOFF_CREATED"
    | "SLA_ESCALATED"
    | "VISIT_VERIFIED"
    | "SYMPTOM_ALERT"
    | "LAB_FOLLOWUP_ORDERED"
    | "VIEW_FHIR_BUNDLE"
    | "RBAC_DENIED";
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
