import { ImageResponse } from "next/og";

export const alt = "Personna — your whole life, in one system";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 76, background: "#142030", color: "#E9D8C8", fontFamily: "Arial, sans-serif", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 650, height: 650, right: -40, top: -250, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,92,141,.55), rgba(115,37,83,.22) 45%, transparent 72%)" }}/>
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 26, fontWeight: 700 }}><span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 46, height: 46, borderRadius: 14, background: "#FF5C8D", color: "#142030" }}>P</span> PERSONNA</div>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 24, maxWidth: 950 }}><div style={{ color: "#FF8AAA", fontSize: 18, fontWeight: 700, letterSpacing: 4 }}>ONE SYSTEM. EVERY RESPONSIBILITY.</div><div style={{ fontSize: 66, lineHeight: 1.08, fontWeight: 700, letterSpacing: -3 }}>Run your whole life from one operating system.</div><div style={{ fontSize: 24, color: "#9DB5C2" }}>Tasks, projects, money, time, and meaningful progress.</div></div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 18, color: "#9DB5C2" }}><span style={{ width: 9, height: 9, borderRadius: "50%", background: "#FF5C8D" }}/> BUILT IN RWANDA · RWF + USD</div>
    </div>,
    size,
  );
}
