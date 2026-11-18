import { prisma } from "@/lib/db";

/**
 * Permanently deletes a user account and all associated records from PostgreSQL.
 * Cleans up patient medical records, complaints, messages, subscriptions,
 * audit logs, and linked Telegram sessions without leaving foreign key errors.
 */
export async function permanentlyDeleteUserAccount({ userId }) {
  if (!userId || typeof userId !== "string") {
    return { deleted: false, reason: "missing_user_id" };
  }

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      include: { patientProfile: { select: { id: true } } },
    });

    if (!user) {
      return { deleted: false, reason: "not_found" };
    }

    const sessions = await tx.telegramSession.findMany({
      where: {
        OR: [
          { userId: user.id },
          ...(user.telegramChatId ? [{ chatId: user.telegramChatId }] : []),
        ],
      },
      select: { chatId: true },
    });
    const chatIds = Array.from(
      new Set([
        ...(user.telegramChatId ? [user.telegramChatId] : []),
        ...sessions.map((s) => s.chatId),
      ])
    );

    const pid = user.patientProfile?.id || null;

    // 1. Delete patient profile & all patient-owned medical/visit records
    if (pid) {
      await tx.directMessage.deleteMany({
        where: {
          OR: [
            { patientId: pid },
            { senderUserId: user.id },
            { recipientUserId: user.id },
          ],
        },
      });
      await tx.invoice.deleteMany({ where: { patientId: pid } });
      await tx.complaint.deleteMany({ where: { patientId: pid } });
      await tx.activeCall.deleteMany({ where: { patientId: pid } });
      await tx.prescription.deleteMany({ where: { patientId: pid } });
      await tx.labReport.deleteMany({ where: { patientId: pid } });
      await tx.ehrRecord.deleteMany({ where: { patientId: pid } });
      await tx.patient.delete({ where: { id: pid } });
    } else {
      await tx.directMessage.deleteMany({
        where: {
          OR: [{ senderUserId: user.id }, { recipientUserId: user.id }],
        },
      });
    }

    // 2. Nullify nullable references pointing to this user (e.g. if doctor/admin)
    await tx.patient.updateMany({
      where: { assignedFamilyDoctorId: user.id },
      data: { assignedFamilyDoctorId: null },
    });
    await tx.complaint.updateMany({
      where: { assignedDoctorId: user.id },
      data: { assignedDoctorId: null },
    });
    await tx.user.updateMany({
      where: { verifiedById: user.id },
      data: { verifiedById: null },
    });

    // 3. Reassign or remove remaining non-nullable clinician references on other patients
    const remainingClinician =
      (await tx.user.findFirst({
        where: {
          id: { not: user.id },
          role: { in: ["FAMILY_MD", "OVABMU_MD"] },
        },
        select: { id: true },
      })) ||
      (await tx.user.findFirst({
        where: { id: { not: user.id } },
        select: { id: true },
      }));

    if (remainingClinician) {
      await tx.ehrRecord.updateMany({
        where: { authorId: user.id },
        data: { authorId: remainingClinician.id },
      });
      await tx.labReport.updateMany({
        where: { orderedById: user.id },
        data: { orderedById: remainingClinician.id },
      });
      await tx.prescription.updateMany({
        where: { prescribedById: user.id },
        data: { prescribedById: remainingClinician.id },
      });
      await tx.activeCall.updateMany({
        where: { dischargedById: user.id },
        data: { dischargedById: remainingClinician.id },
      });
      await tx.activeCall.updateMany({
        where: { assignedDoctorId: user.id },
        data: { assignedDoctorId: remainingClinician.id },
      });
    } else {
      const orphanedCalls = await tx.activeCall.findMany({
        where: {
          OR: [{ dischargedById: user.id }, { assignedDoctorId: user.id }],
        },
        select: { id: true },
      });
      if (orphanedCalls.length > 0) {
        await tx.invoice.deleteMany({
          where: { activeCallId: { in: orphanedCalls.map((c) => c.id) } },
        });
        await tx.activeCall.deleteMany({
          where: { id: { in: orphanedCalls.map((c) => c.id) } },
        });
      }
      await tx.prescription.deleteMany({ where: { prescribedById: user.id } });
      await tx.labReport.deleteMany({ where: { orderedById: user.id } });
      await tx.ehrRecord.deleteMany({ where: { authorId: user.id } });
    }

    // 4. Delete subscriptions, Telegram sessions, audit logs, and user row
    await tx.subscriptionRecord.deleteMany({ where: { userId: user.id } });
    if (chatIds.length > 0) {
      await tx.telegramSession.deleteMany({
        where: {
          OR: [{ userId: user.id }, { chatId: { in: chatIds } }],
        },
      });
    } else {
      await tx.telegramSession.deleteMany({ where: { userId: user.id } });
    }
    await tx.auditLog.deleteMany({
      where: {
        OR: [
          { actorId: user.id },
          { resourceId: user.id },
          ...(pid ? [{ resourceId: pid }] : []),
        ],
      },
    });
    await tx.user.delete({ where: { id: user.id } });

    return {
      deleted: true,
      deletedUserId: user.id,
      deletedEmail: user.email,
      deletedPatientId: pid,
      clearedChatIds: chatIds,
    };
  });
}
