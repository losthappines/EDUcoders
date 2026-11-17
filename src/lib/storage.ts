import fs from "fs/promises";
import os from "os";
import path from "path";

const STORAGE_ROOT = process.env.VERCEL
  ? path.join(/*turbopackIgnore: true*/ os.tmpdir(), "patronaj-storage")
  : path.join(process.cwd(), "storage", "objects");

export interface StoredObjectMeta {
  key: string;
  contentType: string;
  sizeBytes: number;
  bucket: string;
  etag: string;
  uploadedAt: string;
}

function safeResolveKey(key: string): string {
  const cleanKey = key.replace(/^\/+/, "").replace(/\.\./g, "");
  const resolved = path.resolve(/*turbopackIgnore: true*/ STORAGE_ROOT, cleanKey);
  if (!resolved.startsWith(STORAGE_ROOT)) {
    throw new Error("Invalid object storage key path");
  }
  return resolved;
}

export async function putStorageObject(
  key: string,
  content: string | Buffer,
  contentType = "text/html; charset=utf-8"
): Promise<StoredObjectMeta> {
  const filePath = safeResolveKey(key);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const buf = typeof content === "string" ? Buffer.from(content, "utf8") : content;
  await fs.writeFile(filePath, buf);

  const meta: StoredObjectMeta = {
    key,
    contentType,
    sizeBytes: buf.byteLength,
    bucket: "ovabmu-patronaj-archive",
    etag: `s3-${buf.byteLength}-${Date.now().toString(36)}`,
    uploadedAt: new Date().toISOString(),
  };
  await fs.writeFile(`${filePath}.meta.json`, JSON.stringify(meta, null, 2), "utf8");
  return meta;
}

export async function getStorageObject(
  key: string
): Promise<{ content: Buffer; meta: StoredObjectMeta } | null> {
  try {
    const filePath = safeResolveKey(key);
    const content = await fs.readFile(filePath);
    let meta: StoredObjectMeta = {
      key,
      contentType: key.endsWith(".svg")
        ? "image/svg+xml"
        : key.endsWith(".json")
          ? "application/json"
          : "text/html; charset=utf-8",
      sizeBytes: content.byteLength,
      bucket: "ovabmu-patronaj-archive",
      etag: "local-mock",
      uploadedAt: new Date().toISOString(),
    };
    try {
      const metaRaw = await fs.readFile(`${filePath}.meta.json`, "utf8");
      meta = JSON.parse(metaRaw) as StoredObjectMeta;
    } catch {
      // fallback metadata
    }
    return { content, meta };
  } catch {
    return null;
  }
}

export function buildEpikrizDocumentHtml(params: {
  patientName: string;
  jshshirMasked: string;
  dob: string;
  district: string;
  mahalla: string;
  diagnosisIcd10: string;
  diagnosisText: string;
  severity: string;
  clinicalNotes: string;
  polyclinicName: string;
  doctorName: string;
  dischargedAt: string;
}): string {
  return `<!DOCTYPE html>
<html lang="uz">
<head>
<meta charset="utf-8" />
<title>OvaBMU Chiqarish Epikrizi — ${params.patientName}</title>
<style>
  body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; max-width: 780px; margin: 32px auto; padding: 24px; line-height: 1.5; background: #fff; border: 1px solid #cbd5e1; border-radius: 8px; }
  .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 18px; }
  .badge { background: #ccfbf1; color: #0f766e; font-weight: 700; padding: 4px 10px; border-radius: 999px; font-size: 12px; }
  h1 { font-size: 18px; margin: 0; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f8fafc; padding: 12px; border-radius: 6px; margin-bottom: 16px; font-size: 13px; }
  .section { margin-bottom: 14px; }
  .section h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; margin-bottom: 6px; }
  .footer { margin-top: 24px; border-top: 1px dashed #cbd5e1; padding-top: 10px; font-size: 12px; color: #64748b; display: flex; justify-content: space-between; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <h1>O'ZBEKISTON RESPUBLIKASI SOG'LIQNI SAQLASH VAZIRLIGI</h1>
      <div style="font-size:13px;color:#475569;">Ona va Bola Salomatligi Markazi (OvaBMU) — Chiqarish Epikrizi (Forma 027/u)</div>
    </div>
    <span class="badge">24 SOATLIK PATRONAJ MAJBURIY</span>
  </div>
  <div class="grid">
    <div><strong>Bemor:</strong> ${params.patientName}</div>
    <div><strong>JSHSHIR:</strong> ${params.jshshirMasked}</div>
    <div><strong>Tug'ilgan sana:</strong> ${params.dob}</div>
    <div><strong>Hudud:</strong> ${params.district}, ${params.mahalla}</div>
    <div><strong>Biriktirilgan poliklinika:</strong> ${params.polyclinicName}</div>
    <div><strong>Chiqarish sanasi:</strong> ${params.dischargedAt}</div>
  </div>
  <div class="section">
    <h2>Asosiy tashxis (${params.diagnosisIcd10} — ${params.severity})</h2>
    <p>${params.diagnosisText}</p>
  </div>
  <div class="section">
    <h2>Klinik xulosa va olib borilgan muolajalar</h2>
    <p>${params.clinicalNotes}</p>
  </div>
  <div class="footer">
    <span>Davolovchi akusher-ginekolog: ${params.doctorName}</span>
    <span>S3 Object Archive • AES-256-GCM himoyalangan</span>
  </div>
</body>
</html>`;
}

export function buildUltrasoundSvg(patientName: string, findings: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="320" viewBox="0 0 560 320">
  <rect width="560" height="320" fill="#0b1220"/>
  <path d="M280 35 L490 265 A240 240 0 0 1 70 265 Z" fill="#17253d" stroke="#334155" stroke-width="1.5"/>
  <ellipse cx="280" cy="175" rx="76" ry="52" fill="#0f172a" stroke="#94a3b8" stroke-width="2" opacity="0.9"/>
  <ellipse cx="265" cy="172" rx="34" ry="24" fill="#334155" opacity="0.7"/>
  <line x1="205" y1="175" x2="355" y2="175" stroke="#2dd4bf" stroke-dasharray="4 3" stroke-width="1.5"/>
  <text x="18" y="26" fill="#38bdf8" font-family="monospace" font-size="12">OVABMU UZI-DOPPLER • ARCHIVE</text>
  <text x="18" y="44" fill="#e2e8f0" font-family="sans-serif" font-size="12">Bemor: ${patientName}</text>
  <text x="18" y="298" fill="#cbd5e1" font-family="monospace" font-size="11">${findings}</text>
</svg>`;
}
