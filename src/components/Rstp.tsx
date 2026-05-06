import { findDominantRow, getPayoffColor } from "../util";
import type { RstpOrder, RstpLetter } from "../util";

interface Props {
  order: RstpOrder;
}

/** 固定 2×2 博弈矩阵: R S / T P，颜色随收益顺序变化 */
export default function Rstp({ order }: Props) {
  const dominant = findDominantRow(order);
  const rank: Record<string, number> = {};
  order.forEach((ch, i) => { rank[ch] = 3 - i; });

  const cells: { ch: RstpLetter; row: number }[] = [
    { ch: "R", row: 0 },
    { ch: "S", row: 0 },
    { ch: "T", row: 1 },
    { ch: "P", row: 1 },
  ];

  return (
    <div
      style={{
        display: "inline-grid",
        gridTemplateColumns: "1fr 1fr",
        borderRadius: 6,
        overflow: "hidden",
        border: "1px solid var(--border)",
      }}
    >
      {cells.map(({ ch, row }) => {
        const isDominant =
          (dominant === "top" && row === 0) ||
          (dominant === "bottom" && row === 1);
        return (
          <div
            key={ch}
            style={{
              padding: "10px 16px",
              fontWeight: 700,
              fontSize: 13,
              textAlign: "center",
              color: getPayoffColor(rank[ch]),
              background: isDominant ? "rgba(16,185,129,0.05)" : "transparent",
              border: isDominant
                ? "1.5px solid rgba(16,185,129,0.25)"
                : "1px solid var(--border)",
            }}
          >
            {ch}
          </div>
        );
      })}
    </div>
  );
}
