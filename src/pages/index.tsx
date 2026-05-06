import { RSTP_ORDERS, SEMANTIC_KEYS, CATEGORY_COLORS } from "../util";
import Rstp from "../components/Rstp";

const cats = [
  { id: "C", label: "严格合作", desc: "合作行严格优于背叛行，双方都选合作" },
  { id: "D", label: "严格背叛", desc: "背叛行严格优于合作行，双方都选背叛" },
  { id: "A", label: "总有风险小的选项", desc: "无严格优势，但存在风险较小的选项" },
  { id: "B", label: "其他", desc: "无严格优势，其他类型的博弈" },
] as const;

export default function Home() {
  const exampleOrder = RSTP_ORDERS[0];
  const exampleSk = SEMANTIC_KEYS[0];

  return (
    <div>
      <h1 style={{ fontSize: 40, margin: "24px 0 8px" }}>
        2×2 博弈论 RSTP 分类工具
      </h1>
      <p style={{ fontSize: 15, color: "var(--text)", marginBottom: 32, maxWidth: 560, lineHeight: 1.7 }}>
        探索 24 种收益顺序排列及其语义分类，浏览 300 种不重复的 2×2 博弈组合。
      </p>

      {/* ── RSTP 简介 ── */}
      <div style={{ display: "flex", gap: 32, marginBottom: 40, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{exampleSk}</div>
          <Rstp order={exampleOrder} />
        </div>

        <div style={{ maxWidth: 400, fontSize: 14, lineHeight: 1.8, color: "var(--text)" }}>
          <p style={{ marginBottom: 8 }}>
            在 2×2 囚徒困境博弈中，每位玩家的收益由四个值决定：
          </p>
          <table style={{ borderCollapse: "collapse", fontSize: 13 }}>
            <tbody>
              {[
                ["R", "Reward（双方合作）", "#22c55e"],
                ["S", "Sucker（合作 vs 背叛）", "#06b6d4"],
                ["T", "Temptation（背叛 vs 合作）", "#f97316"],
                ["P", "Punishment（双方背叛）", "#ef4444"],
              ].map(([ch, label, color]) => (
                <tr key={ch}>
                  <td style={{ fontWeight: 700, padding: "4px 8px 4px 0", color }}>{ch}</td>
                  <td style={{ padding: "4px 0" }}>{label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 分类说明卡片 ── */}
      <h2 style={{ fontSize: 20, marginBottom: 14 }}>收益顺序分类</h2>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 36 }}>
        {cats.map((c) => (
          <div
            key={c.id}
            style={{
              flex: "1 0 180px",
              border: `1px solid ${CATEGORY_COLORS[c.id]}40`,
              borderRadius: 8,
              padding: "12px 14px",
              background: `${CATEGORY_COLORS[c.id]}08`,
            }}
          >
            <div style={{ color: CATEGORY_COLORS[c.id], fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
              {c.id} — {c.label}
            </div>
            <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.5 }}>
              {c.desc}
            </div>
          </div>
        ))}
      </div>

      {/* ── 工具入口 ── */}
      <h2 style={{ fontSize: 20, marginBottom: 14 }}>工具</h2>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a
          href="/rstp24view"
          style={{
            display: "block",
            padding: "14px 20px",
            border: "1px solid var(--border)",
            borderRadius: 8,
            textDecoration: "none",
            color: "var(--text)",
            minWidth: 200,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-h)", marginBottom: 4 }}>RSTP24</div>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>
            查看全部 24 种收益顺序排列，颜色按排名编码，支持切换语义 / RSTP 显示。
          </div>
        </a>

        <a
          href="/abcd300view"
          style={{
            display: "block",
            padding: "14px 20px",
            border: "1px solid var(--border)",
            borderRadius: 8,
            textDecoration: "none",
            color: "var(--text)",
            minWidth: 200,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-h)", marginBottom: 4 }}>ABCD300</div>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>
            探索 300 种不重复的 2×2 博弈组合热力图，按 C→D→A→B 分组。
          </div>
        </a>
      </div>
    </div>
  );
}
