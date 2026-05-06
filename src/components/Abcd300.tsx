import { useState } from "react";
import { RSTP_ORDERS, CATEGORY_SORT, SEMANTIC_KEYS, CATEGORY_COLORS, orderFromSk } from "../util";
import { getGameCommonInfo } from "../game_common_name";
import Abcd300DetailCompute from "./Abcd300DetailCompute";
import Abcd300Cell from "./Abcd300Cell";
import Rstp24Item from "./Rstp24Item";

const BASE_W = 80;
const BASE_H = 32;

const items = CATEGORY_SORT.map((i) => ({
  order: RSTP_ORDERS[i],
  sk: SEMANTIC_KEYS[i],
  cat: SEMANTIC_KEYS[i][0] as string,
}));

export default function Abcd300() {
  const [zoom, setZoom] = useState(1);
  const [showName, setShowName] = useState(true);
  const [drawerGame, setDrawerGame] = useState<string | null>(null);
  const [eqFilter, setEqFilter] = useState<Set<string>>(new Set(["CC", "CD", "DC", "DD"]));
  const CW = Math.round(BASE_W * zoom);
  const CH = Math.round(BASE_H * zoom);
  const FZ = Math.max(7, Math.round(10 * zoom));
  const FZH = Math.max(8, Math.round(11 * zoom));
  const FZS = Math.max(6, Math.round(9 * zoom));

  const cellBox: Record<string, string | number> = {
    width: CW,
    minWidth: CW,
    height: CH,
    minHeight: CH,
    boxSizing: "border-box",
    border: "1px solid var(--border)",
  };

  return (
    <div>
      {/* ── 缩放控件 ── */}
      <div style={{ marginBottom: 8, display: "flex", gap: 6, alignItems: "center" }}>
        <button onClick={() => setZoom((z) => Math.max(0.3, Math.round((z - 0.1) * 10) / 10))} style={btnStyle}>−</button>
        <span style={{ fontSize: 13, fontFamily: "var(--mono)", minWidth: 40, textAlign: "center" }}>
          {Math.round(zoom * 100)}%
        </span>
        <button onClick={() => setZoom((z) => Math.min(3, Math.round((z + 0.1) * 10) / 10))} style={btnStyle}>+</button>
        <span style={{ marginLeft: 12 }} />
        <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", color: "var(--text)", userSelect: "none" }}>
          <input type="checkbox" checked={showName} onChange={(e) => setShowName(e.target.checked)} />
          显示名称
        </label>
        <span style={{ fontSize: 12, color: "#888", marginLeft: 8 }}>点击格子查看详情</span>
      </div>

      {/* ── 均衡筛选 ── */}
      <div style={{ marginBottom: 8, display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "var(--text)", marginRight: 4 }}>均衡筛选</span>
        {["CC", "CD", "DC", "DD"].map((o) => {
          const on = eqFilter.has(o);
          return (
            <button
              key={o}
              onClick={() => {
                const next = new Set(eqFilter);
                on ? next.delete(o) : next.add(o);
                setEqFilter(next);
              }}
              style={{
                ...btnStyle,
                fontSize: 11,
                fontWeight: on ? 700 : 400,
                background: on ? "var(--text-h)" : "var(--bg)",
                color: on ? "var(--bg)" : "var(--text)",
                opacity: on ? 1 : 0.5,
              }}
            >
              {o}
            </button>
          );
        })}
        {eqFilter.size < 4 && (
          <button
            onClick={() => setEqFilter(new Set(["CC", "CD", "DC", "DD"]))}
            style={{
              ...btnStyle,
              fontSize: 10,
              padding: "0 8px",
              width: "auto",
              background: "var(--bg)",
              color: "var(--text)",
              opacity: 0.5,
            }}
          >
            重置
          </button>
        )}
      </div>

      {/* ── 可滚动容器 ── */}
      <div style={{ overflow: "auto", maxHeight: "75vh", border: "1px solid var(--border)", borderRadius: 6 }}>
        <div style={{ display: "inline-flex", flexDirection: "column" }}>
          {/* ── 列头行 ── */}
          <div style={{ display: "flex", position: "sticky", top: 0, zIndex: 10 }}>
            <div style={{ ...cellBox, position: "sticky", left: 0, zIndex: 11, background: "var(--bg)" }} />
            {items.map((col) => (
              <div
                key={`ch-${col.sk}`}
                title={col.order.join("")}
                style={{
                  ...cellBox,
                  fontSize: FZ,
                  fontFamily: "var(--mono)",
                  fontWeight: 700,
                  textAlign: "center",
                  lineHeight: `${CH}px`,
                  color: CATEGORY_COLORS[col.cat] ?? "#666",
                  borderBottom: "1px solid var(--border)",
                  background: "var(--bg)",
                }}
              >
                {col.sk}
              </div>
            ))}
          </div>

          {/* ── 数据行 ── */}
          {items.map((row, ri) => (
            <div key={`row-${row.sk}`} style={{ display: "flex" }}>
              {/* 行头（sticky left） */}
              <div
                title={row.order.join("")}
                style={{
                  ...cellBox,
                  position: "sticky",
                  left: 0,
                  zIndex: 5,
                  background: "var(--bg)",
                  fontSize: FZH,
                  fontFamily: "var(--mono)",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingRight: 4,
                  borderRight: "1px solid var(--border)",
                  color: CATEGORY_COLORS[row.cat] ?? "#000",
                  gap: 2,
                }}
              >
                <span>{row.sk}</span>
                <span style={{ color: "#bbb", fontSize: FZS }}>{row.order.join("")}</span>
              </div>

              {/* 所有 24 格 */}
              {items.map((col, ci) => {
                const show = ci <= ri;
                const gameKey = `${row.sk}${col.sk}`.toLowerCase();
                return show ? (
                  <Abcd300Cell
                    key={`c-${ri}-${ci}`}
                    rowOrder={row.order}
                    colOrder={col.order}
                    label={`${row.sk}${col.sk}`}
                    width={CW}
                    height={CH}
                    fontSize={FZ}
                    showName={showName}
                    onClick={() => setDrawerGame(gameKey)}
                    eqFilter={eqFilter}
                  />
                ) : (
                  <div
                    key={`c-${ri}-${ci}`}
                    style={{
                      width: CW,
                      minWidth: CW,
                      height: CH,
                      minHeight: CH,
                      boxSizing: "border-box",
                      border: "none",
                      background: "transparent",
                      visibility: "hidden",
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── 抽屉 ── */}
      {drawerGame && (
        <Drawer
          gameKey={drawerGame}
          onClose={() => setDrawerGame(null)}
        />
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   弹出式抽屉（在 Abcd300 外部定义，避免每次渲染重建引用）
   ──────────────────────────────────────────────────────── */

function Drawer({ gameKey, onClose }: { gameKey: string; onClose: () => void }) {
  const [swapped, setSwapped] = useState(false);
  const skRaw1 = gameKey.slice(0, 2).toUpperCase();
  const skRaw2 = gameKey.slice(2, 4).toUpperCase();
  const orderRaw1 = orderFromSk(skRaw1);
  const orderRaw2 = orderFromSk(skRaw2);
  const isAsymmetric = skRaw1 !== skRaw2;

  const sk1 = swapped ? skRaw2 : skRaw1;
  const sk2 = swapped ? skRaw1 : skRaw2;
  const order1 = swapped ? orderRaw2 : orderRaw1;
  const order2 = swapped ? orderRaw1 : orderRaw2;
  const displayKey = swapped
    ? `${skRaw2}${skRaw1}`.toLowerCase()
    : gameKey.toLowerCase();
  const gameInfo = getGameCommonInfo(displayKey);

  return (
    <>
      {/* 遮罩 */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.3)",
          zIndex: 100,
        }}
      />
      {/* 抽屉面板 */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: 320,
          height: "100vh",
          background: "var(--bg)",
          borderLeft: "1px solid var(--border)",
          zIndex: 101,
          boxShadow: "-4px 0 12px rgba(0,0,0,0.1)",
          padding: 24,
          fontFamily: "var(--sans)",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>
            <span style={{ color: CATEGORY_COLORS[sk1[0]] }}>{sk1}</span>
            ×
            <span style={{ color: CATEGORY_COLORS[sk2[0]] }}>{sk2}</span>
          </h3>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {isAsymmetric && (
              <button
                onClick={() => setSwapped((s) => !s)}
                title="切换玩家视角"
                style={{
                  width: "auto",
                  height: 26,
                  fontSize: 11,
                  fontWeight: 600,
                  lineHeight: "22px",
                  textAlign: "center",
                  cursor: "pointer",
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontFamily: "var(--sans)",
                  padding: "0 6px",
                }}
              >
                {swapped ? skRaw1+skRaw2 : skRaw2+skRaw1}
              </button>
            )}
            <button onClick={onClose} style={closeBtnStyle}>✕</button>
          </div>
        </div>

        {gameInfo && (
          <div style={{ marginBottom: 16, fontSize: 13, lineHeight: 1.6, color: "var(--text)" }}>
            <strong style={{ fontSize: 14, color: "var(--text-h)" }}>{gameInfo.name}</strong>
            {gameInfo.rowPlayerName && (
              <p style={{ marginTop: 2, fontSize: 12, color: "#888" }}>
                行 {swapped ? gameInfo.colPlayerName : gameInfo.rowPlayerName}
                {" vs "}列 {swapped ? gameInfo.rowPlayerName : gameInfo.colPlayerName}
              </p>
            )}
            <p style={{ marginTop: 4 }}>{gameInfo.desc}</p>
          </div>
        )}

        <a
          href={`/abcd300/detail/${displayKey}`}
          target="_blank"
          rel="noopener noreferrer"
          style={actionBtnStyle}
        >
          新标签页查看 {sk1}{sk2}
        </a>

        {order1 && order2 ? (
          <Abcd300DetailCompute
            rowOrder={order1}
            colOrder={order2}
            rowSk={sk1}
            colSk={sk2}
          />
        ) : (
          <p style={{ fontSize: 12, color: "#c00" }}>无效游戏组合</p>
        )}

        {/* ── RSTP 排序 ── */}
        <div style={{ marginTop: 20, borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, marginBottom: 4, fontSize: 12, color: "var(--text)" }}>
              行 <span style={{ color: CATEGORY_COLORS[sk1[0]] }}>{sk1}</span>
            </p>
            <Rstp24Item order={order1!} mode="abcd" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, marginBottom: 4, fontSize: 12, color: "var(--text)" }}>
              列 <span style={{ color: CATEGORY_COLORS[sk2[0]] }}>{sk2}</span>
            </p>
            <Rstp24Item order={order2!} mode="abcd" />
          </div>
        </div>
      </div>
    </>
  );
}

/* ── 共用样式 ── */

const btnStyle: Record<string, string | number> = {
  width: 28,
  height: 26,
  fontSize: 16,
  fontWeight: 700,
  lineHeight: "22px",
  textAlign: "center",
  cursor: "pointer",
  border: "1px solid var(--border)",
  borderRadius: 4,
  background: "var(--bg)",
  color: "var(--text)",
  fontFamily: "var(--sans)",
};

const actionBtnStyle: Record<string, string | number> = {
  display: "block",
  width: "100%",
  padding: "10px 16px",
  marginBottom: 10,
  fontSize: 13,
  fontWeight: 600,
  textAlign: "center",
  textDecoration: "none",
  border: "1px solid var(--border)",
  borderRadius: 6,
  background: "var(--bg)",
  color: "var(--text)",
  cursor: "pointer",
  fontFamily: "var(--sans)",
  boxSizing: "border-box",
};

const closeBtnStyle: Record<string, string | number> = {
  width: 32,
  height: 32,
  fontSize: 16,
  lineHeight: "28px",
  textAlign: "center",
  cursor: "pointer",
  border: "none",
  borderRadius: 4,
  background: "transparent",
  color: "var(--text)",
};
