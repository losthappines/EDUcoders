import { NextResponse, connection } from "next/server";
import { prisma } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed-data";
import { getSessionFromRequest } from "@/lib/auth";
import { isStaffRole, recordAuditLog, resolveActorAfterSeed } from "@/lib/rbac";

const STATUS_ORDER = {
  IN_PROGRESS: 0,
  BEING_ADDED: 1,
  UPCOMING: 2,
  COMPLETED: 3,
};

export async function GET(req) {
  await connection();
  try {
    await ensureSeeded();
    const session = getSessionFromRequest(req);
    const userId = session?.userId || null;

    const events = await prisma.motherEvent.findMany({
      include: {
        rsvps: {
          select: {
            userId: true,
            status: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    const formatted = events
      .map((ev) => {
        const goingCount = ev.rsvps.filter((r) => r.status === "GOING").length;
        const interestedCount = ev.rsvps.filter((r) => r.status === "INTERESTED").length;
        const myRsvp = userId ? ev.rsvps.find((r) => r.userId === userId)?.status || null : null;
        return {
          id: ev.id,
          titleUz: ev.titleUz,
          titleRu: ev.titleRu,
          titleEn: ev.titleEn,
          descriptionUz: ev.descriptionUz,
          descriptionRu: ev.descriptionRu,
          descriptionEn: ev.descriptionEn,
          category: ev.category,
          status: ev.status,
          format: ev.format,
          district: ev.district,
          locationText: ev.locationText,
          hostName: ev.hostName,
          hostRole: ev.hostRole,
          startsAt: ev.startsAt,
          endsAt: ev.endsAt,
          meetingUrl: ev.meetingUrl,
          capacity: ev.capacity,
          goingCount,
          interestedCount,
          totalRsvpCount: ev.rsvps.length,
          myRsvp,
        };
      })
      .sort((a, b) => {
        const oa = STATUS_ORDER[a.status] ?? 9;
        const ob = STATUS_ORDER[b.status] ?? 9;
        if (oa !== ob) return oa - ob;
        const ta = a.startsAt ? new Date(a.startsAt).getTime() : Number.MAX_SAFE_INTEGER;
        const tb = b.startsAt ? new Date(b.startsAt).getTime() : Number.MAX_SAFE_INTEGER;
        return ta - tb;
      });

    return NextResponse.json({
      events: formatted,
      counts: {
        total: formatted.length,
        inProgress: formatted.filter((e) => e.status === "IN_PROGRESS").length,
        beingAdded: formatted.filter((e) => e.status === "BEING_ADDED").length,
        upcoming: formatted.filter((e) => e.status === "UPCOMING").length,
      },
    });
  } catch (error) {
    console.error("GET /api/community/events error:", error);
    return NextResponse.json({ error: "Failed to load events" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const actor = await resolveActorAfterSeed(req);
    if (!actor) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const action = String(body.action || "TOGGLE_RSVP");

    if (action === "TOGGLE_RSVP") {
      const eventId = String(body.eventId || "").trim();
      const desiredStatus = body.status === "INTERESTED" ? "INTERESTED" : "GOING";
      if (!eventId) {
        return NextResponse.json({ error: "eventId is required" }, { status: 400 });
      }

      const event = await prisma.motherEvent.findUnique({ where: { id: eventId } });
      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }

      const existing = await prisma.eventRsvp.findUnique({
        where: { eventId_userId: { eventId, userId: actor.userId } },
      });

      let myRsvp = null;
      if (existing && (body.remove === true || existing.status === desiredStatus)) {
        await prisma.eventRsvp.delete({ where: { id: existing.id } });
        myRsvp = null;
      } else if (existing) {
        const updated = await prisma.eventRsvp.update({
          where: { id: existing.id },
          data: { status: desiredStatus },
        });
        myRsvp = updated.status;
      } else {
        const created = await prisma.eventRsvp.create({
          data: {
            eventId,
            userId: actor.userId,
            status: desiredStatus,
          },
        });
        myRsvp = created.status;
      }

      return NextResponse.json({ success: true, eventId, myRsvp });
    }

    if (action === "CREATE_EVENT") {
      if (!isStaffRole(actor.role)) {
        return NextResponse.json({ error: "Only verified specialists or coordinators can add events" }, { status: 403 });
      }
      const title = String(body.title || body.titleUz || "").trim().slice(0, 140);
      const description = String(body.description || body.descriptionUz || "").trim().slice(0, 600);
      if (!title || !description) {
        return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
      }

      const validStatuses = ["IN_PROGRESS", "BEING_ADDED", "UPCOMING", "COMPLETED"];
      const validFormats = ["ONLINE", "OFFLINE", "TELEGRAM"];
      const validCategories = ["AUDIO_CIRCLE", "WORKSHOP", "CLINIC_DAY", "SUPPORT_GROUP", "WEBINAR"];

      const status = validStatuses.includes(body.status) ? body.status : "BEING_ADDED";
      const format = validFormats.includes(body.format) ? body.format : "ONLINE";
      const category = validCategories.includes(body.category) ? body.category : "WORKSHOP";
      const startsAt = body.startsAt ? new Date(body.startsAt) : null;
      const validStartsAt = startsAt && !Number.isNaN(startsAt.getTime()) ? startsAt : null;

      const created = await prisma.motherEvent.create({
        data: {
          titleUz: String(body.titleUz || title).slice(0, 160),
          titleRu: String(body.titleRu || title).slice(0, 160),
          titleEn: String(body.titleEn || title).slice(0, 160),
          descriptionUz: String(body.descriptionUz || description).slice(0, 700),
          descriptionRu: String(body.descriptionRu || description).slice(0, 700),
          descriptionEn: String(body.descriptionEn || description).slice(0, 700),
          category,
          status,
          format,
          district: body.district ? String(body.district).trim().slice(0, 80) : actor.district || "Toshkent",
          locationText: body.locationText ? String(body.locationText).trim().slice(0, 160) : format,
          hostName: String(body.hostName || actor.fullName).trim().slice(0, 100),
          hostRole: String(body.hostRole || actor.role).trim().slice(0, 80),
          startsAt: validStartsAt,
          meetingUrl: body.meetingUrl ? String(body.meetingUrl).trim().slice(0, 300) : null,
          capacity: Math.max(10, Math.min(500, Number(body.capacity) || 80)),
          createdById: actor.userId,
        },
      });

      await recordAuditLog({
        actor,
        action: "MOTHER_EVENT_CREATED",
        resourceType: "MotherEvent",
        resourceId: created.id,
        details: { status: created.status, category: created.category },
      });

      return NextResponse.json({ success: true, event: created }, { status: 201 });
    }

    if (action === "UPDATE_STATUS") {
      if (!isStaffRole(actor.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const eventId = String(body.eventId || "").trim();
      const validStatuses = ["IN_PROGRESS", "BEING_ADDED", "UPCOMING", "COMPLETED"];
      if (!eventId || !validStatuses.includes(body.status)) {
        return NextResponse.json({ error: "Valid eventId and status required" }, { status: 400 });
      }
      const updated = await prisma.motherEvent.update({
        where: { id: eventId },
        data: { status: body.status },
      });
      return NextResponse.json({ success: true, event: updated });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/community/events error:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}
