import { NextRequest, NextResponse } from "next/server";
import { getStorageObject } from "@/lib/storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key } = await params;
    const objectKey = key.join("/");
    const result = await getStorageObject(objectKey);

    if (!result) {
      return NextResponse.json({ error: "Object not found" }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(result.content), {
      status: 200,
      headers: {
        "Content-Type": result.meta.contentType,
        "X-Storage-Bucket": result.meta.bucket,
        "X-Storage-ETag": result.meta.etag,
      },
    });
  } catch (error) {
    console.error("GET /api/storage error:", error);
    return NextResponse.json({ error: "Storage error" }, { status: 500 });
  }
}
