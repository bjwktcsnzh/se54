import Rstp24Table from "../components/Rstp24Table";
import { CATEGORY_COLORS } from "../util";

export default function Rstp24View() {
  return (
    <div>
      <h1 style={{ fontSize: 32, margin: "16px 0 8px" }}>RSTP 语义化编号</h1>
      <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 520, marginBottom: 28, color: "var(--text)" }}>
        24 种 RSTP 收益顺序排列，按 Lehmer 码排序并赋予语义编号。
        每种排列用 <strong>C/D/A/B</strong> 分类，颜色编码标识类别。
        悬停头行可在语义编号与 RSTP 字符串间切换。
      </p>

      <div style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>
        <Rstp24Table />

        <div
          style={{
            flexShrink: 0,
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 16,
            fontSize: 13,
            fontFamily: "var(--sans)",
          }}
        >
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "var(--text-h)" }}>编号说明</h3>
          <table style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "4px 8px", textAlign: "left", fontWeight: 600, fontSize: 12 }}>类</th>
                <th style={{ padding: "4px 8px", textAlign: "left", fontWeight: 600, fontSize: 12 }}>编号</th>
              </tr>
            </thead>
            <tbody>
              {(["C", "D", "A", "B"] as const).map((cat) => (
                <tr key={cat}>
                  <td
                    style={{
                      padding: "4px 8px",
                      color: CATEGORY_COLORS[cat],
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    {cat === "C"
                      ? "C（严格合作）"
                      : cat === "D"
                        ? "D（严格背叛）"
                        : cat === "A"
                          ? "A（总有风险小的选项）"
                          : "B"}
                  </td>
                  <td style={{ padding: "4px 8px", fontSize: 12, fontFamily: "var(--mono)" }}>
                    {cat === "C"
                      ? "C1–C6（0,1,2,6,7,10）"
                      : cat === "D"
                        ? "D1–D6（23,22,21,17,16,13）"
                        : cat === "A"
                          ? "A1–A8（5,3,11,9,14,12,20,18）"
                          : "B1–B4（4,8,15,19）"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
