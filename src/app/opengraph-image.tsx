import { ImageResponse } from "next/og"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
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
          background: "#0a0a0a",
          color: "#faf6f0",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            fontSize: 80,
            letterSpacing: "0.28em",
            fontWeight: 700,
            color: "#c9a227",
          }}
        >
          YSI
        </div>
        <div
          style={{
            fontSize: 18,
            letterSpacing: "0.18em",
            marginTop: 12,
            color: "#8b8680",
            textTransform: "uppercase",
          }}
        >
          YUTY_STYLEDIT
        </div>
        <div
          style={{
            width: 60,
            height: 1,
            background: "#c9a227",
            marginTop: 24,
          }}
        />
        <div
          style={{
            fontSize: 14,
            letterSpacing: "0.18em",
            marginTop: 20,
            color: "#8b8680",
            textTransform: "uppercase",
          }}
        >
          Styling You With Finesse
        </div>
      </div>
    ),
    { ...size }
  )
}
