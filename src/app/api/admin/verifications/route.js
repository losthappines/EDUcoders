import { NextResponse, connection } from "next/server";
import { prisma } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed-data";
import { recordAuditLog, resolveActorContext } from "@/lib/rbac";
import { activateVerifiedPatientOnboardingTx } from "@/lib/patient-onboarding";
export async function GET(req) {
    await connection();
    try {
        await ensureSeeded();
        const actor = await resolveActorContext(req);
        if (!actor) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        if (actor.role !== "ADMIN_RECEPTION") {
            await recordAuditLog({
                actor,
                action: "RBAC_DENIED",
                resourceType: "AdminVerifications",
                resourceId: "list",
                details: { reason: "Only ADMIN_RECEPTION can access account verifications" },
            });
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        const users = await prisma.user.findMany({
            where: {
                role: { in: ["PATIENT", "OVABMU_MD", "FAMILY_MD"] },
            },
            orderBy: { createdAt: "desc" },
            include: {
                patientProfile: {
                    select: {
                        id: true,
                        dateOfBirth: true,
                        mahalla: true,
                        bloodType: true,
                        status: true,
                    },
                },
            },
        });
        const accounts = users.map((u) => ({
            id: u.id,
            email: u.email,
            fullName: u.fullName,
            role: u.role,
            verificationStatus: u.verificationStatus,
            verificationNote: u.verificationNote,
            verifiedAt: u.verifiedAt,
            polyclinicId: u.polyclinicId,
            polyclinicName: u.polyclinicName,
            district: u.district,
            specialty: u.specialty,
            phone: u.phone,
            createdAt: u.createdAt,
            patientProfile: u.patientProfile,
        }));
        const pendingCount = accounts.filter((a) => a.verificationStatus === "PENDING").length;
        const verifiedCount = accounts.filter((a) => a.verificationStatus === "VERIFIED").length;
        const rejectedCount = accounts.filter((a) => a.verificationStatus === "REJECTED").length;
        return NextResponse.json({
            accounts,
            counts: {
                total: accounts.length,
                pending: pendingCount,
                verified: verifiedCount,
                rejected: rejectedCount,
            },
        });
    }
    catch (error) {
        console.error("GET /api/admin/verifications error:", error);
        return NextResponse.json({ error: "Failed to load verification queue" }, { status: 500 });
    }
}
export async function POST(req) {
    try {
        await ensureSeeded();
        const actor = await resolveActorContext(req);
        if (!actor) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        if (actor.role !== "ADMIN_RECEPTION") {
            await recordAuditLog({
                actor,
                action: "RBAC_DENIED",
                resourceType: "AdminVerifications",
                resourceId: "decision",
                details: { reason: "Only ADMIN_RECEPTION can verify or decline accounts" },
            });
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        const body = (await req.json());
        const userId = (body.userId || "").trim();
        const decision = body.decision;
        const note = (body.note || "").trim();
        if (!userId || (decision !== "APPROVE" && decision !== "REJECT")) {
            return NextResponse.json({ error: "userId and decision (APPROVE or REJECT) are required." }, { status: 400 });
        }
        if (userId === actor.userId) {
            return NextResponse.json({ error: "You cannot change verification status of your own active admin account." }, { status: 400 });
        }
        const target = await prisma.user.findUnique({ where: { id: userId } });
        if (!target) {
            return NextResponse.json({ error: "Account not found." }, { status: 404 });
        }
        const nextStatus = decision === "APPROVE" ? "VERIFIED" : "REJECTED";
        const now = new Date();
        const updated = await prisma.$transaction(async (tx) => {
            const user = await tx.user.update({
                where: { id: target.id },
                data: {
                    verificationStatus: nextStatus,
                    verificationNote: note || null,
                    verifiedAt: now,
                    verifiedById: actor.userId,
                },
            });
            if (decision === "APPROVE" && user.role === "PATIENT") {
                await activateVerifiedPatientOnboardingTx(tx, {
                    userId: user.id,
                    fullName: user.fullName,
                    polyclinicId: user.polyclinicId || "OP-14-YUNUSOBOD",
                    polyclinicName: user.polyclinicName || "14-sonli Oilaviy Poliklinika",
                    district: user.district || "Yunusobod",
                });
            }
            else if (decision === "REJECT" && user.role === "PATIENT") {
                await tx.patient.updateMany({
                    where: { userId: user.id, status: "PENDING_VERIFICATION" },
                    data: { status: "REJECTED" },
                });
            }
            return user;
        });
        await recordAuditLog({
            actor,
            action: decision === "APPROVE" ? "ACCOUNT_VERIFIED" : "ACCOUNT_REJECTED",
            resourceType: "User",
            resourceId: updated.id,
            details: {
                targetEmail: updated.email,
                targetName: updated.fullName,
                targetRole: updated.role,
                decision,
                note: note || null,
            },
        });
        return NextResponse.json({
            success: true,
            user: {
                id: updated.id,
                email: updated.email,
                fullName: updated.fullName,
                role: updated.role,
                verificationStatus: updated.verificationStatus,
                verificationNote: updated.verificationNote,
                verifiedAt: updated.verifiedAt,
            },
        });
    }
    catch (error) {
        console.error("POST /api/admin/verifications error:", error);
        return NextResponse.json({ error: "Failed to update verification status" }, { status: 500 });
    }
}
