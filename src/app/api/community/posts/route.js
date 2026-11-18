import { NextResponse, connection } from "next/server";
import { prisma } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed-data";
import { getSessionFromRequest } from "@/lib/auth";
import { resolveActorAfterSeed } from "@/lib/rbac";

const VALID_COHORTS = ["all", "d0_30", "m1_3", "m3_6", "m6_12"];
const VALID_TOPICS = ["FEEDING", "SLEEP", "RECOVERY", "MENTAL_HEALTH", "BABY_CARE"];

function formatPostForClient(post, currentUserId) {
  let likedBy = [];
  try {
    likedBy = JSON.parse(post.likedByJson || "[]");
    if (!Array.isArray(likedBy)) likedBy = [];
  } catch {
    likedBy = [];
  }
  return {
    id: post.id,
    cohortKey: post.cohortKey,
    topicTag: post.topicTag,
    authorDisplayName: post.isAnonymous ? "Anonim ona" : post.authorDisplayName,
    authorRole: post.authorRole,
    isAnonymous: post.isAnonymous,
    title: post.title,
    body: post.body,
    likesCount: post.likesCount,
    likedByMe: Boolean(currentUserId && likedBy.includes(currentUserId)),
    createdAt: post.createdAt,
    replies: (post.replies || []).map((r) => ({
      id: r.id,
      postId: r.postId,
      authorDisplayName: r.isAnonymous ? "Anonim ona" : r.authorDisplayName,
      authorRole: r.authorRole,
      isAnonymous: r.isAnonymous,
      body: r.body,
      createdAt: r.createdAt,
    })),
  };
}

export async function GET(req) {
  await connection();
  try {
    await ensureSeeded();
    const session = getSessionFromRequest(req);
    const currentUserId = session?.userId || null;

    const { searchParams } = new URL(req.url);
    const cohort = searchParams.get("cohort") || "all";

    const posts = await prisma.communityPost.findMany({
      where: cohort && cohort !== "all" && VALID_COHORTS.includes(cohort) ? { cohortKey: cohort } : undefined,
      include: {
        replies: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 40,
    });

    return NextResponse.json({
      posts: posts.map((p) => formatPostForClient(p, currentUserId)),
    });
  } catch (error) {
    console.error("GET /api/community/posts error:", error);
    return NextResponse.json({ error: "Failed to load community discussions" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const actor = await resolveActorAfterSeed(req);
    if (!actor) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const action = String(body.action || "CREATE_POST");

    if (action === "CREATE_POST") {
      const title = String(body.title || "").trim().slice(0, 160);
      const content = String(body.body || "").trim().slice(0, 1500);
      if (!title || !content) {
        return NextResponse.json({ error: "Title and message body are required" }, { status: 400 });
      }
      const cohortKey = VALID_COHORTS.includes(body.cohortKey) ? body.cohortKey : "all";
      const topicTag = VALID_TOPICS.includes(body.topicTag) ? body.topicTag : "BABY_CARE";
      const isAnonymous = actor.role === "PATIENT" && Boolean(body.isAnonymous);
      const displayName = isAnonymous
        ? "Anonim ona"
        : actor.district
          ? `${actor.fullName} (${actor.district})`
          : actor.fullName;

      const created = await prisma.communityPost.create({
        data: {
          cohortKey,
          topicTag,
          authorId: actor.userId,
          authorDisplayName: displayName,
          authorRole: actor.role,
          isAnonymous,
          title,
          body: content,
        },
        include: { replies: true },
      });

      return NextResponse.json(
        { success: true, post: formatPostForClient(created, actor.userId) },
        { status: 201 }
      );
    }

    if (action === "ADD_REPLY") {
      const postId = String(body.postId || "").trim();
      const content = String(body.body || "").trim().slice(0, 1000);
      if (!postId || !content) {
        return NextResponse.json({ error: "postId and reply text are required" }, { status: 400 });
      }
      const parent = await prisma.communityPost.findUnique({ where: { id: postId } });
      if (!parent) {
        return NextResponse.json({ error: "Discussion post not found" }, { status: 404 });
      }
      const isAnonymous = actor.role === "PATIENT" && Boolean(body.isAnonymous);
      const reply = await prisma.communityReply.create({
        data: {
          postId,
          authorId: actor.userId,
          authorDisplayName: isAnonymous ? "Anonim ona" : actor.fullName,
          authorRole: actor.role,
          isAnonymous,
          body: content,
        },
      });
      return NextResponse.json(
        {
          success: true,
          reply: {
            id: reply.id,
            postId: reply.postId,
            authorDisplayName: reply.authorDisplayName,
            authorRole: reply.authorRole,
            isAnonymous: reply.isAnonymous,
            body: reply.body,
            createdAt: reply.createdAt,
          },
        },
        { status: 201 }
      );
    }

    if (action === "LIKE_POST") {
      const postId = String(body.postId || "").trim();
      if (!postId) {
        return NextResponse.json({ error: "postId is required" }, { status: 400 });
      }
      const post = await prisma.communityPost.findUnique({ where: { id: postId } });
      if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
      let likedBy = [];
      try {
        likedBy = JSON.parse(post.likedByJson || "[]");
        if (!Array.isArray(likedBy)) likedBy = [];
      } catch {
        likedBy = [];
      }
      const already = likedBy.includes(actor.userId);
      const nextLikedBy = already
        ? likedBy.filter((id) => id !== actor.userId)
        : [...likedBy, actor.userId];
      const delta = already ? -1 : 1;
      const nextCount = Math.max(0, post.likesCount + delta);

      const updated = await prisma.communityPost.update({
        where: { id: postId },
        data: {
          likedByJson: JSON.stringify(nextLikedBy),
          likesCount: nextCount,
        },
      });

      return NextResponse.json({
        success: true,
        postId: updated.id,
        likesCount: updated.likesCount,
        likedByMe: !already,
      });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/community/posts error:", error);
    return NextResponse.json({ error: "Failed to save community interaction" }, { status: 500 });
  }
}
