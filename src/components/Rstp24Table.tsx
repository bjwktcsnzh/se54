import { useState } from "react";
import { RSTP_ORDERS } from "../util";
import Rstp24Item from "./Rstp24Item";

export default function Rstp24Table() {
  const [mode, setMode] = useState<"abcd" | "rstp">("abcd");

  return (
    <div>
      <div style={{ marginBottom: 12, display: "flex", gap: 8, alignItems: "center" }}>
        <button
          onClick={() => setMode(mode === "abcd" ? "rstp" : "abcd")}
          style={{
            padding: "4px 14px",
            fontSize: 13,
            fontFamily: "var(--sans)",
            fontWeight: 600,
            border: "1px solid var(--border)",
            borderRadius: 4,
            background: "var(--bg)",
            color: "var(--text)",
            cursor: "pointer",
          }}
        >
          {mode === "abcd" ? "RSTP 分类" : "ABCD 分类"}
        </button>
        <span style={{ fontSize: 12, color: "var(--text-secondary, #888)" }}>
          {mode === "abcd"
            ? "头行默认显示语义编号，悬停显示 RSTP"
            : "头行默认显示 RSTP，悬停显示语义编号"}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, auto)",
          gap: 12,
          justifyContent: "center",
        }}
      >
        {RSTP_ORDERS.map((order) => (
          <Rstp24Item key={order.join("")} order={order} mode={mode} />
        ))}
      </div>
    </div>
  );
}
