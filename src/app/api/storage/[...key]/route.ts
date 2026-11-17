import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { decryptField } from "@/lib/crypto";
import {
  buildEpikrizDocumentHtml,
  buildUltrasoundSvg,
  getStorageObject,
} from "@/lib/storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key } = await params;
    const objectKey = key.join("/");
    const result = await getStorageObject(objectKey);

    if (result) {
      return new NextResponse(new Uint8Array(result.content), {
        status: 200,
        headers: {
          "Content-Type": result.meta.contentType,
          "X-Storage-Bucket": result.meta.bucket,
          "X-Storage-ETag": result.meta.etag,
        },
      });
    }

    // Serverless cold-start fallback: reconstruct document from PostgreSQL EHR record
    const ehr = await prisma.ehrRecord.findFirst({
      where: { dischargeDocumentKey: objectKey },
      include: { patient: true, author: true },
    });

    if (!ehr) {
      return NextResponse.json({ error: "Object not found" }, { status: 404 });
    }

    if (objectKey.endsWith(".svg")) {
      const svg = buildUltrasoundSvg(
        ehr.patient.fullName,
        `${ehr.diagnosisIcd10} • ${ehr.diagnosisText.slice(0, 68)}`
      );
      return new NextResponse(svg, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
          "X-Storage-Bucket": "ovabmu-patronaj-archive",
        },
      });
    }

    const html = buildEpikrizDocumentHtml({
      patientName: ehr.patient.fullName,
      jshshirMasked: ehr.patient.jshshirMasked,
      dob: ehr.patient.dateOfBirth,
      district: ehr.patient.district,
      mahalla: ehr.patient.mahalla,
      diagnosisIcd10: ehr.diagnosisIcd10,
      diagnosisText: ehr.diagnosisText,
      severity: ehr.severity,
      clinicalNotes: decryptField(ehr.clinicalNotesEncrypted),
      polyclinicName: ehr.patient.polyclinicName,
      doctorName: ehr.author.fullName,
      dischargedAt: (ehr.patient.dischargedAt ?? ehr.createdAt).toISOString(),
    });

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Storage-Bucket": "ovabmu-patronaj-archive",
      },
    });
  } catch (error) {
    console.error("GET /api/storage error:", error);
    return NextResponse.json({ error: "Storage error" }, { status: 500 });
  }
}
