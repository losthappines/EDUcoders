import { getSessionFromRequest, VALID_ROLES } from "./auth";
import { prisma } from "./db";
import { ensureSeeded } from "./seed-data";
export async function resolveActorAfterSeed(req) {
    const session = getSessionFromRequest(req);
    if (!session)
        return null;
    await ensureSeeded();
    return resolveActorContext(req);
}
export async function resolveActorContext(req) {
    const session = getSessionFromRequest(req);
    if (!session)
        return null;
    let ipAddress = "10.14.22.108";
    if (req) {
        const forwarded = req.headers.get("x-forwarded-for");
        if (forwarded)
            ipAddress = forwarded.split(",")[0].trim();
    }
    const user = await prisma.user.findUnique({
        where: { id: session.userId },
    });
    if (!user ||
        !VALID_ROLES.includes(user.role) ||
        user.verificationStatus !== "VERIFIED") {
        return null;
    }
    return {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        polyclinicId: user.polyclinicId,
        polyclinicName: user.polyclinicName,
        district: user.district,
        avatarUrl: user.avatarUrl || null,
        ipAddress,
    };
}
export function canViewClinicalNotes(role) {
    return role === "OVABMU_MD" || role === "FAMILY_MD";
}
export function canTriggerDischarge(role) {
    return role === "OVABMU_MD";
}
export function canVerifyVisitAsDoctor(role) {
    return role === "FAMILY_MD" || role === "OVABMU_MD";
}
export function canAccessPsychologistPortal(role) {
    return role === "PSYCHOLOGIST";
}
export function isStaffRole(role) {
    return role === "OVABMU_MD" || role === "FAMILY_MD" || role === "ADMIN_RECEPTION" || role === "PSYCHOLOGIST";
}
export async function recordAuditLog(params) {
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
