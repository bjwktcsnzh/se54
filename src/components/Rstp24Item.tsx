import { permutationIndex, SEMANTIC_KEYS, CATEGORY_COLORS } from "../util";
import type { RstpOrder } from "../util";
import Rstp from "./Rstp";

interface Props {
  order: RstpOrder;
  mode: "abcd" | "rstp";
}

export default function Rstp24Item({ order, mode }: Props) {
  const pi = permutationIndex(order);
  const sk = SEMANTIC_KEYS[pi];
  const cat = sk[0];
  const bg = CATEGORY_COLORS[cat];
  const defaultText = mode === "abcd" ? sk : order.join("");
  const hoverText = mode === "abcd" ? order.join("") : sk;

  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          background: bg,
          color: "#fff",
          fontSize: 12,
          fontFamily: "var(--mono)",
          fontWeight: 700,
          padding: "2px 0",
          borderRadius: "4px 4px 0 0",
          cursor: "default",
        }}
        onMouseEnter={(e) => { e.currentTarget.textContent = hoverText; }}
        onMouseLeave={(e) => { e.currentTarget.textContent = defaultText; }}
      >
        {defaultText}
      </div>
      <Rstp order={order} />
    </div>
  );
}
