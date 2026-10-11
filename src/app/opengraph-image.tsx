import { ImageResponse } from "next/og"
import { site } from "@/config/site"
export const alt = "LaunchKit"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: "#f7f7f2",
        padding: 90,
        color: "#182d23",
      }}
    >
      <div style={{ display: "flex", fontSize: 32, color: "#487259" }}>{site.name}</div>
      <div style={{ display: "flex", fontSize: 76, marginTop: 30 }}>From idea to launch.</div>
      <div style={{ display: "flex", fontSize: 28, marginTop: 30 }}>{site.description.en}</div>
    </div>,
    size
  )
}
