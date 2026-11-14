import { ImageResponse } from "next/og";

export const alt = "Freemans Universal Organization — Ten orbits. One world.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const rings = [0.34, -0.52, 0.92, -0.22, 0.58, 1.18, -0.78, 0.16, -1.06, 0.72];
  const hues = ["#e8b84b", "#86c66b", "#3ed598", "#38d6e0", "#5b8cff", "#9d7bff", "#ff5a6e", "#f06bd8", "#ffb224", "#2dd4bf"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0b0a08 0%, #171410 55%, #1e1a14 100%)",
          padding: "0 90px",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 560 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <svg width="64" height="64" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="22" fill="none" stroke="#e8b84b" strokeWidth="2.5" />
              <path d="M22 44 L32 18 L42 44" fill="none" stroke="#e8b84b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M25.5 37 Q32 33 38.5 37" fill="none" stroke="#e8b84b" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="32" cy="14" r="2.6" fill="#ffd98a" />
            </svg>
            <span style={{ color: "#e8b84b", fontSize: 22, letterSpacing: 6 }}>FUO</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 36 }}>
            <span style={{ color: "#f6f0e1", fontSize: 58, fontWeight: 700, lineHeight: 1.15 }}>
              Freemans Universal
            </span>
            <span style={{ color: "#f6f0e1", fontSize: 58, fontWeight: 700, lineHeight: 1.15 }}>
              Organization
            </span>
          </div>
          <span style={{ color: "#e8b84b", fontSize: 30, marginTop: 28 }}>
            Ten orbits. One world.
          </span>
          <span style={{ color: "#a79e8b", fontSize: 20, marginTop: 16 }}>
            Talent · Peace · Sustainability · AI · Security · Rights
          </span>
        </div>

        <svg width="460" height="460" viewBox="0 0 460 460">
          <circle cx="230" cy="230" r="210" fill="none" stroke="#e8b84b" strokeOpacity="0.25" strokeWidth="1.5" />
          {rings.map((incl, i) => (
            <ellipse
              key={i}
              cx="230"
              cy="230"
              rx={95 + i * 12}
              ry={Math.max((95 + i * 12) * Math.abs(Math.cos(incl)), 24)}
              fill="none"
              stroke={hues[i]}
              strokeOpacity="0.75"
              strokeWidth="1.8"
              transform={`rotate(${(i * 36) % 180} 230 230)`}
            />
          ))}
          <circle cx="230" cy="230" r="34" fill="none" stroke="#e8b84b" strokeWidth="2.5" />
          <path d="M218 244 L230 212 L242 244" fill="none" stroke="#e8b84b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="230" cy="230" r="60" fill="#e8b84b" fillOpacity="0.08" />
        </svg>
      </div>
    ),
    { ...size },
  );
}