import { useState } from "react";
import { useParams } from "react-router-dom";
import { orderFromSk, CATEGORY_COLORS } from "../../../util";
import { getGameCommonInfo } from "../../../game_common_name";
import Rstp24Item from "../../../components/Rstp24Item";
import Abcd300DetailCompute from "../../../components/Abcd300DetailCompute";

export default function Abcd300Detail() {
  const { game } = useParams<{ game: string }>();
  const [swapped, setSwapped] = useState(false);

  if (!game || game.length < 4) {
    return <p style={{ color: "#c00" }}>无效参数：{game}</p>;
  }

  const skRaw1 = game.slice(0, 2).toUpperCase();
  const skRaw2 = game.slice(2, 4).toUpperCase();
  const orderRaw1 = orderFromSk(skRaw1);
  const orderRaw2 = orderFromSk(skRaw2);

  if (!orderRaw1 || !orderRaw2) {
    return (
      <div style={{ padding: 24 }}>
        <h1>未找到</h1>
        <p>无法解析 <code>{game}</code>，请确认格式如 <code>c1d1</code>。</p>
      </div>
    );
  }

  const sk1 = swapped ? skRaw2 : skRaw1;
  const sk2 = swapped ? skRaw1 : skRaw2;
  const order1 = swapped ? orderRaw2 : orderRaw1;
  const order2 = swapped ? orderRaw1 : orderRaw2;
  const swappedKey = `${skRaw2}${skRaw1}`.toLowerCase();
  const displayKey = swapped ? swappedKey : game.toLowerCase();
  const isAsymmetric = skRaw1 !== skRaw2;

  const cat1 = sk1[0];
  const cat2 = sk2[0];
  const gameInfo = getGameCommonInfo(displayKey);

  return (
    <div style={{ padding: "24px 0" }}>
      <h1>
        <span style={{ color: CATEGORY_COLORS[cat1] }}>{sk1}</span>
        ×
        <span style={{ color: CATEGORY_COLORS[cat2] }}>{sk2}</span>
        {" "}博弈详情
      </h1>

      {isAsymmetric && (
        <button
          onClick={() => setSwapped((s) => !s)}
          style={{
            marginTop: 8,
            padding: "6px 14px",
            fontSize: 12,
            fontWeight: 600,
            border: "1px solid var(--border)",
            borderRadius: 6,
            background: "var(--bg)",
            color: "var(--text)",
            cursor: "pointer",
            fontFamily: "var(--sans)",
          }}
        >
          切换玩家视角（{swapped ? `${skRaw1}×${skRaw2}` : `${skRaw2}×${skRaw1}`}）
        </button>
      )}

      {gameInfo && (
        <div
          style={{
            marginTop: 16,
            padding: "12px 16px",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 13,
            lineHeight: 1.7,
            color: "var(--text)",
          }}
        >
          <strong style={{ fontSize: 15, color: "var(--text-h)" }}>
            {gameInfo.name}
          </strong>
          {gameInfo.rowPlayerName && (
            <p style={{ marginTop: 2, fontSize: 12, color: "#888" }}>
              行 {swapped ? gameInfo.colPlayerName : gameInfo.rowPlayerName}
              {" vs "}列 {swapped ? gameInfo.rowPlayerName : gameInfo.colPlayerName}
            </p>
          )}
          <p style={{ marginTop: 6 }}>{gameInfo.desc}</p>
        </div>
      )}

      <div style={{ display: "flex", gap: 32, marginTop: 24, alignItems: "flex-start" }}>
        <div>
          <p style={{ fontWeight: 600, marginBottom: 6, fontSize: 14 }}>
            行玩家 <span style={{ color: CATEGORY_COLORS[cat1] }}>{sk1}</span>
          </p>
          <Rstp24Item order={order1} mode="abcd" />
        </div>

        <div>
          <p style={{ fontWeight: 600, marginBottom: 6, fontSize: 14 }}>
            列玩家 <span style={{ color: CATEGORY_COLORS[cat2] }}>{sk2}</span>
          </p>
          <Rstp24Item order={order2} mode="abcd" />
        </div>
      </div>

      <Abcd300DetailCompute
        rowOrder={order1}
        colOrder={order2}
        rowSk={sk1}
        colSk={sk2}
      />
    </div>
  );
}
