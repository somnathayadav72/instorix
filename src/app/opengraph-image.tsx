import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Instorix — Free Instagram Downloader";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#030712", // Very dark background (gray-950)
          backgroundImage: "linear-gradient(to bottom right, rgba(247, 119, 55, 0.15), rgba(225, 48, 108, 0.15), rgba(131, 58, 180, 0.15))",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle glowing orbs for background texture */}
        <div style={{ position: "absolute", top: -100, left: -100, width: 400, height: 400, background: "#E1306C", opacity: 0.2, filter: "blur(100px)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: -100, right: -100, width: 400, height: 400, background: "#833AB4", opacity: 0.2, filter: "blur(100px)", borderRadius: "50%" }} />

        {/* Content Container */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
          {/* Logo Section */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: "40px" }}>
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: 28,
                background: "linear-gradient(to top right, #F77737, #E1306C, #833AB4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 4,
                boxShadow: "0 20px 40px rgba(225, 48, 108, 0.3)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Simplified Arrow Icon (Download shape) */}
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </div>
            </div>
            
            <h1
              style={{
                fontSize: 90,
                fontWeight: 900,
                color: "#ffffff",
                marginLeft: 32,
                letterSpacing: "-0.04em",
                margin: 0, // override default margin
              }}
            >
              Instorix
            </h1>
          </div>

          {/* Subtitle / Tagline */}
          <h2
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#f3f4f6", // gray-100
              textAlign: "center",
              marginBottom: 16,
              maxWidth: "1000px",
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            The Ultimate Instagram Downloader
          </h2>

          <p
            style={{
              fontSize: 32,
              fontWeight: 500,
              color: "#9ca3af", // gray-400
              textAlign: "center",
              maxWidth: "800px",
              lineHeight: 1.4,
              margin: 0,
            }}
          >
            Download HD Reels, Stories, Posts, Audio & Profile Pics. 100% Free. No Login Required.
          </p>

          {/* Feature Badges */}
          <div style={{ display: "flex", gap: "20px", marginTop: "40px" }}>
            {[
              { text: "Video Trimmer", color: "#F77737" },
              { text: "PWA Support", color: "#E1306C" },
              { text: "HD Quality", color: "#833AB4" }
            ].map((badge, i) => (
              <div
                key={i}
                style={{
                  padding: "12px 24px",
                  borderRadius: "100px",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: `2px solid ${badge.color}40`, // 40 hex is 25% opacity
                  color: "#e5e7eb",
                  fontSize: 24,
                  fontWeight: 600,
                  display: "flex",
                }}
              >
                {badge.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
