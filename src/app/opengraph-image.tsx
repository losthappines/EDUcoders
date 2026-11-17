import { ImageResponse } from "next/og";

export const alt =
  "OnaCare AI — Automated Maternal Patronage & 24h Continuity of Care";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background:
            "linear-gradient(135deg, #0f172a 0%, #0f3d3e 55%, #0d9488 100%)",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "#14b8a6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: 800,
              color: "#042f2e",
            }}
          >
            OC
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span style={{ fontSize: "28px", fontWeight: 700 }}>OnaCare AI</span>
            <span style={{ fontSize: "16px", color: "#99f6e4" }}>
              Automated Maternal Patronage System • Uzbekistan
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "960px",
          }}
        >
          <div
            style={{
              fontSize: "58px",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Zero-Gap 24-Hour Hospital-to-Polyclinic Continuity of Care
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#cbd5e1",
              lineHeight: 1.4,
            }}
          >
            Role-isolated portals for Patients, OvaBMU Doctors, Family Doctors,
            and District Admins with HL7 FHIR R4 handoffs and AI triage.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            fontSize: "18px",
            color: "#ccfbf1",
          }}
        >
          <span
            style={{
              padding: "10px 18px",
              borderRadius: "999px",
              background: "rgba(20, 184, 166, 0.22)",
              border: "1px solid rgba(94, 234, 212, 0.4)",
            }}
          >
            24h SLA Dispatch
          </span>
          <span
            style={{
              padding: "10px 18px",
              borderRadius: "999px",
              background: "rgba(20, 184, 166, 0.22)",
              border: "1px solid rgba(94, 234, 212, 0.4)",
            }}
          >
            UZ / RU / EN Guides
          </span>
          <span
            style={{
              padding: "10px 18px",
              borderRadius: "999px",
              background: "rgba(20, 184, 166, 0.22)",
              border: "1px solid rgba(94, 234, 212, 0.4)",
            }}
          >
            OTP Visit Verification
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
