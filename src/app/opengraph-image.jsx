import { ImageResponse } from "next/og";
export const alt = "OnaCare — Tug'ruqdan keyingi 24 soatlik uy patronaji va onalarga g'amxo'rlik";
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = "image/png";
export default function OpenGraphImage() {
    return new ImageResponse((<div style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px",
            background: "linear-gradient(135deg, #0f172a 0%, #0f3d3e 55%, #0d9488 100%)",
            color: "#f8fafc",
            fontFamily: "sans-serif",
        }}>
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
        }}>
          <div style={{
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
        }}>
            OC
          </div>
          <div style={{
            display: "flex",
            flexDirection: "column",
        }}>
            <span style={{ fontSize: "28px", fontWeight: 700 }}>OnaCare</span>
            <span style={{ fontSize: "16px", color: "#99f6e4" }}>
              Onalar va chaqaloqlar uchun uyda tibbiy g&apos;amxo&apos;rlik • O&apos;zbekiston
            </span>
          </div>
        </div>

        <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "960px",
        }}>
          <div style={{
            fontSize: "52px",
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
        }}>
            Tug&apos;ruqdan keyin uyga qaytyapsizmi? 24 soat ichida shifokor sizni ko&apos;radi.
          </div>
          <div style={{
            fontSize: "24px",
            color: "#cbd5e1",
            lineHeight: 1.4,
        }}>
            Tug&apos;ruqxona natijalaringiz oilaviy shifokoringizga yuboriladi, uyga tashrif belgilanadi va kunlik holatingiz nazorat qilinadi.
          </div>
        </div>

        <div style={{
            display: "flex",
            gap: "16px",
            fontSize: "18px",
            color: "#ccfbf1",
        }}>
          <span style={{
            padding: "10px 18px",
            borderRadius: "999px",
            background: "rgba(20, 184, 166, 0.22)",
            border: "1px solid rgba(94, 234, 212, 0.4)",
        }}>
            24 soatda uyga tashrif
          </span>
          <span style={{
            padding: "10px 18px",
            borderRadius: "999px",
            background: "rgba(20, 184, 166, 0.22)",
            border: "1px solid rgba(94, 234, 212, 0.4)",
        }}>
            O&apos;zbekcha / Ruscha / Inglizcha
          </span>
          <span style={{
            padding: "10px 18px",
            borderRadius: "999px",
            background: "rgba(20, 184, 166, 0.22)",
            border: "1px solid rgba(94, 234, 212, 0.4)",
        }}>
            Maxfiy va shifrlangan
          </span>
        </div>
      </div>), {
        ...size,
    });
}
