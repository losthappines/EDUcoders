import { NextResponse, connection } from "next/server";
import { prisma } from "@/lib/db";
import { recordAuditLog, resolveActorAfterSeed } from "@/lib/rbac";
import { DOCTOR_PLANS, getPlanByCode, PATIENT_PLANS } from "@/lib/subscriptions";
import { notifyUserViaTelegram } from "@/lib/telegram-bot";

const VALID_METHODS = new Set(["PAYME", "CLICK", "UZCARD", "HUMO", "CARD_DEMO"]);

export async function GET(req) {
  await connection();
  try {
    const actor = await resolveActorAfterSeed(req);
    if (!actor) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const [user, records] = await Promise.all([
      prisma.user.findUnique({
        where: { id: actor.userId },
        select: {
          subscriptionTier: true,
          subscriptionStatus: true,
          subscriptionExpiresAt: true,
        },
      }),
      actor.role === "ADMIN_RECEPTION"
        ? prisma.subscriptionRecord.findMany({
            include: { user: { select: { id: true, fullName: true, role: true, email: true } } },
            orderBy: { createdAt: "desc" },
            take: 40,
          })
        : prisma.subscriptionRecord.findMany({
            where: { userId: actor.userId },
            orderBy: { createdAt: "desc" },
            take: 20,
          }),
    ]);

    return NextResponse.json({
      currentSubscription: user,
      plans: actor.role === "PATIENT" ? PATIENT_PLANS : DOCTOR_PLANS,
      history: records,
    });
  } catch (error) {
    console.error("GET /api/subscriptions error:", error);
    return NextResponse.json({ error: "Failed to load subscriptions" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const actor = await resolveActorAfterSeed(req);
    if (!actor) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const plan = getPlanByCode(body.planCode);
    if (!plan) {
      return NextResponse.json({ error: "Invalid subscription plan." }, { status: 400 });
    }

    const expectedTarget = actor.role === "PATIENT" ? "PATIENT" : "DOCTOR";
    if (plan.targetRole !== expectedTarget) {
      return NextResponse.json(
        { error: "Selected plan does not match your account role." },
        { status: 403 }
      );
    }

    const paymentMethod = VALID_METHODS.has(body.paymentMethod) ? body.paymentMethod : "PAYME";
    const expiresAt = new Date(Date.now() + 30 * 86400000);
    const isActive = plan.priceUzs > 0;

    const record = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: actor.userId },
        data: {
          subscriptionTier: plan.code,
          subscriptionStatus: isActive ? "ACTIVE" : "NONE",
          subscriptionExpiresAt: isActive ? expiresAt : null,
        },
      });
      if (actor.role === "PATIENT") {
        await tx.patient.updateMany({
          where: { userId: actor.userId },
          data: {
            subscriptionTier: plan.code,
            subscriptionStatus: isActive ? "ACTIVE" : "NONE",
            subscriptionExpiresAt: isActive ? expiresAt : null,
          },
        });
      }
      return tx.subscriptionRecord.create({
        data: {
          userId: actor.userId,
          targetRole: expectedTarget,
          planCode: plan.code,
          planName: plan.nameUz,
          priceUzs: plan.priceUzs,
          paymentMethod,
          status: isActive ? "ACTIVE" : "FREE",
          expiresAt,
        },
      });
    });

    await notifyUserViaTelegram(
      actor.userId,
      `💎 <b>Obuna muvaffaqiyatli faollashtirildi!</b>\nReja: <b>${plan.nameUz}</b>\nTo'lov usuli: ${paymentMethod}\nMuddat: ${expiresAt.toISOString().slice(0, 10)}`
    );

    await recordAuditLog({
      actor,
      action: "SUBSCRIPTION_PURCHASED",
      resourceType: "SubscriptionRecord",
      resourceId: record.id,
      details: { planCode: plan.code, priceUzs: plan.priceUzs, paymentMethod },
    });

    return NextResponse.json({
      success: true,
      subscription: {
        subscriptionTier: plan.code,
        subscriptionStatus: isActive ? "ACTIVE" : "NONE",
        subscriptionExpiresAt: isActive ? expiresAt : null,
      },
      record,
    });
  } catch (error) {
    console.error("POST /api/subscriptions error:", error);
    return NextResponse.json({ error: "Failed to activate subscription" }, { status: 500 });
  }
}
