import type { RstpOrder, NashEq } from "../util";
import {
  gamePayoffs,
  findDominantRow,
  findDominantCol,
  findPureNash,
} from "../util";
import { getGameCommonInfo } from "../game_common_name";

const RANK_COLORS = ["#ef4444", "#f97316", "#06b6d4", "#22c55e"] as const;

function hexToRgba(hex: string, alpha: number): string {
  const v = parseInt(hex.slice(1), 16);
  return `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},${alpha})`;
}

interface Props {
  rowOrder: RstpOrder;
  colOrder: RstpOrder;
  rowSk: string;
  colSk: string;
}

export default function Abcd300DetailCompute({
  rowOrder,
  colOrder,
  rowSk,
  colSk,
}: Props) {
  const p = gamePayoffs(rowOrder, colOrder);
  const [[rR, cR], [rS, cT], [rT, cS], [rP, cP]] = p;

  const rowDom = findDominantRow(rowOrder);
  const colDom = findDominantCol(colOrder);
  const nashEq = findPureNash(p);

  /* 非对称博弈的角色名 */
  const gameInfo = getGameCommonInfo(`${rowSk}${colSk}`);
  const primaryKey = [rowSk.toLowerCase(), colSk.toLowerCase()].sort().join("");
  const isPrimary = `${rowSk}${colSk}`.toLowerCase() === primaryKey;
  const rowPlayer = isPrimary ? gameInfo?.rowPlayerName : gameInfo?.colPlayerName;
  const colPlayer = isPrimary ? gameInfo?.colPlayerName : gameInfo?.rowPlayerName;

  const rowPred =
    rowDom === "top" ? "C" : rowDom === "bottom" ? "D" : null;
  const colPred =
    colDom === "left" ? "C" : colDom === "right" ? "D" : null;
  const predCell =
    rowPred && colPred ? `${rowPred}${colPred}` : null;

  const cells = [
    { id: "CC", L: "R", rowRank: rR, colRank: cR, ra: "C" as const, ca: "C" as const },
    { id: "CD", L: "S", rowRank: rS, colRank: cT, ra: "C" as const, ca: "D" as const },
    { id: "DC", L: "T", rowRank: rT, colRank: cS, ra: "D" as const, ca: "C" as const },
    { id: "DD", L: "P", rowRank: rP, colRank: cP, ra: "D" as const, ca: "D" as const },
  ];

  const isNash = (ra: string, ca: string) =>
    nashEq.some((n) => n.row === ra && n.col === ca);

  return (
    <div style={{ marginTop: 32, fontFamily: "var(--sans)", maxWidth: 480 }}>
      <p
        style={{
          fontSize: 15,
          fontWeight: 600,
          marginBottom: 16,
          color: "var(--text-h)",
        }}
      >
        博弈分析
      </p>

      {/* ── 2×2 矩阵 ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr 1fr",
          gap: 0,
          fontSize: 13,
        }}
      >
        {/* ─── 列头行 ─── */}
        <div /> {/* 空角 */}
        <HeaderBox label="C（合作）" sk={colSk} />
        <HeaderBox label="D（背叛）" sk={colSk} />

        {/* ─── 行 C ─── */}
        <SideBox label="C（合作）" sk={rowSk} />
        <CellBox
          cell={cells[0]}
          isPred={predCell === "CC"}
          isNash={isNash("C", "C")}
        />
        <CellBox
          cell={cells[1]}
          isPred={predCell === "CD"}
          isNash={isNash("C", "D")}
        />

        {/* ─── 行 D ─── */}
        <SideBox label="D（背叛）" sk={rowSk} />
        <CellBox
          cell={cells[2]}
          isPred={predCell === "DC"}
          isNash={isNash("D", "C")}
        />
        <CellBox
          cell={cells[3]}
          isPred={predCell === "DD"}
          isNash={isNash("D", "D")}
        />
      </div>

      {/* ── 分析说明 ── */}
      <Analysis
        rowDom={rowDom}
        colDom={colDom}
        nashEq={nashEq}
        rowSk={rowSk}
        colSk={colSk}
        rowPlayer={rowPlayer}
        colPlayer={colPlayer}
      />

      {/* ── 纳什均衡推导 ── */}
      <NashDeviationTable cells={cells} nashEq={nashEq} />
    </div>
  );
}

/* ─── 子组件 ─── */

function HeaderBox({ label, sk }: { label: string; sk: string }) {
  return (
    <div
      style={{
        padding: "6px 10px",
        textAlign: "center",
        fontWeight: 600,
        fontSize: 12,
        borderBottom: "2px solid var(--border)",
        color: "var(--text)",
      }}
    >
      {label}
      <br />
      <span style={{ fontFamily: "var(--mono)", fontSize: 11, opacity: 0.5 }}>
        {sk}
      </span>
    </div>
  );
}

function SideBox({ label, sk }: { label: string; sk: string }) {
  return (
    <div
      style={{
        padding: "6px 10px",
        fontWeight: 600,
        fontSize: 12,
        borderRight: "2px solid var(--border)",
        color: "var(--text)",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      {label}
      <span style={{ fontFamily: "var(--mono)", fontSize: 11, opacity: 0.5 }}>
        {sk}
      </span>
    </div>
  );
}

function CellBox({
  cell,
  isPred,
  isNash,
}: {
  cell: { L: string; rowRank: number; colRank: number };
  isPred: boolean;
  isNash: boolean;
}) {
  const rc = RANK_COLORS[cell.rowRank] ?? "#000";
  const cc = RANK_COLORS[cell.colRank] ?? "#000";

  return (
    <div
      style={{
        position: "relative",
        height: 80,
        minWidth: 100,
        background: `linear-gradient(to top right, ${hexToRgba(rc, 0.25)} 50%, ${hexToRgba(cc, 0.25)} 50%)`,
        border: isPred
          ? "2.5px solid #111"
          : isNash
            ? "2px solid #d97706"
            : "1px solid var(--border)",
      }}
    >
      {/* 字母标签（右上角） */}
      <span
        style={{
          position: "absolute",
          top: 3,
          right: 5,
          fontSize: 10,
          fontWeight: 700,
          opacity: 0.35,
          color: "#000",
        }}
      >
        {cell.L}
      </span>

      {/* 列玩家收益（右上三角）— 表头在上方 */}
      <span
        style={{
          position: "absolute",
          top: 16,
          right: 10,
          fontSize: 22,
          fontWeight: 700,
          lineHeight: 1,
          color: cc,
        }}
      >
        {cell.colRank}
      </span>

      {/* 行玩家收益（左下三角）— 表头在左侧 */}
      <span
        style={{
          position: "absolute",
          bottom: 8,
          left: 10,
          fontSize: 22,
          fontWeight: 700,
          lineHeight: 1,
          color: rc,
        }}
      >
        {cell.rowRank}
      </span>

      {/* 预测结果标记 */}
      {isPred && (
        <span
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: 14,
            opacity: 0.5,
            color: "#000",
            pointerEvents: "none",
          }}
        >
          ★
        </span>
      )}

      {/* 纳什均衡标记（无预测时显示） */}
      {isNash && !isPred && (
        <span
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: 10,
            fontWeight: 700,
            color: "#92400e",
            background: "#fef3c7",
            padding: "1px 5px",
            borderRadius: 3,
            lineHeight: 1.4,
            pointerEvents: "none",
          }}
        >
          NE
        </span>
      )}
    </div>
  );
}

function Analysis({
  rowDom,
  colDom,
  nashEq,
  rowSk,
  colSk,
  rowPlayer,
  colPlayer,
}: {
  rowDom: "top" | "bottom" | null;
  colDom: "left" | "right" | null;
  nashEq: NashEq[];
  rowSk: string;
  colSk: string;
  rowPlayer?: string;
  colPlayer?: string;
}) {
  const rowAct = rowDom === "top" ? "C" : rowDom === "bottom" ? "D" : null;
  const colAct = colDom === "left" ? "C" : colDom === "right" ? "D" : null;
  const both = rowAct && colAct;

  return (
    <div
      style={{
        marginTop: 20,
        fontSize: 13,
        lineHeight: 1.8,
        color: "var(--text)",
      }}
    >
      {/* 行玩家 */}
      <p>
        <strong>行玩家 {rowSk}</strong>
        {rowPlayer && <span style={{ color: "#888" }}>（{rowPlayer}）</span>}
        {rowAct
          ? `：严格优势策略 → ${rowAct === "C" ? "合作" : "背叛"}（${rowAct}）`
          : "：无严格优势策略"}
      </p>

      {/* 列玩家 */}
      <p>
        <strong>列玩家 {colSk}</strong>
        {colPlayer && <span style={{ color: "#888" }}>（{colPlayer}）</span>}
        {colAct
          ? `：严格优势策略 → ${colAct === "C" ? "合作" : "背叛"}（${colAct}）`
          : "：无严格优势策略"}
      </p>

      {/* 预测结果 */}
      {both && (
        <p style={{ fontWeight: 600, color: "var(--text-h)", marginTop: 4 }}>
          预测结果：（{rowAct}, {colAct}）
          {rowAct === "C" && colAct === "C"
            ? " — 双方合作"
            : rowAct === "D" && colAct === "D"
              ? " — 双方背叛"
              : rowAct === "C" && colAct === "D"
                ? " — 行合作、列背叛"
                : " — 行背叛、列合作"}
        </p>
      )}

      {/* 纳什均衡（无双方严格优势时显示） */}
      {!both && nashEq.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <p style={{ fontWeight: 600, marginBottom: 2, color: "var(--text-h)" }}>
            纯策略纳什均衡
          </p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {nashEq.map((ne, i) => (
              <li key={i}>
                ({ne.row}, {ne.col})
                {ne.row === "C" && ne.col === "C"
                  ? " — 双方合作"
                  : ne.row === "D" && ne.col === "D"
                    ? " — 双方背叛"
                    : ne.row === "C" && ne.col === "D"
                      ? " — 行合作、列背叛"
                      : " — 行背叛、列合作"}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!both && nashEq.length === 0 && (
        <p style={{ marginTop: 8, fontStyle: "italic", opacity: 0.7 }}>
          无纯策略纳什均衡
        </p>
      )}
    </div>
  );
}

/* ─── 纳什均衡逐格推导 ─── */

const DEVIATION_MAP: Record<string, { rowTo: string; colTo: string }> = {
  CC: { rowTo: "DC", colTo: "CD" },
  CD: { rowTo: "DD", colTo: "CC" },
  DC: { rowTo: "CC", colTo: "DD" },
  DD: { rowTo: "CD", colTo: "DC" },
};

function NashDeviationTable({
  cells,
  nashEq,
}: {
  cells: { id: string; L: string; rowRank: number; colRank: number }[];
  nashEq: NashEq[];
}) {
  const cellById = Object.fromEntries(cells.map((c) => [c.id, c]));
  const isNashCell = (id: string) =>
    nashEq.some((ne) => `${ne.row}${ne.col}` === id);

  return (
    <div style={{ marginTop: 24, fontSize: 13, lineHeight: 1.8, color: "var(--text)" }}>
      <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: "var(--text-h)" }}>
        逐格推导
      </p>

      {cells.map((cell) => {
        const dev = DEVIATION_MAP[cell.id];
        const rowTarget = cellById[dev.rowTo];
        const colTarget = cellById[dev.colTo];
        const rowImprove = cell.rowRank < rowTarget.rowRank;
        const colImprove = cell.colRank < colTarget.colRank;
        const isNE = isNashCell(cell.id);

        return (
          <div
            key={cell.id}
            style={{
              marginBottom: 12,
              padding: "8px 12px",
              borderRadius: 6,
              border: isNE ? "1.5px solid #d97706" : "1px solid var(--border)",
              background: isNE ? "rgba(217,119,6,0.04)" : undefined,
            }}
          >
            <strong style={{ fontSize: 14 }}>
              {cell.id}
            </strong>
            <span style={{ color: "#888", marginLeft: 6 }}>
              ({cell.rowRank}, {cell.colRank})
            </span>
            {isNE && (
              <span style={{ marginLeft: 6, color: "#92400e" }}>★ 纳什均衡</span>
            )}

            <div style={{ marginTop: 2, paddingLeft: 16 }}>
              {/* 行玩家 */}
              <div>
                <span style={{ opacity: 0.8 }}>行→</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 12 }}>
                  {dev.rowTo}
                </span>
                <span style={{ opacity: 0.8 }}>
                  ：得 {rowTarget.rowRank}
                </span>
                <span style={{ marginLeft: 4 }}>
                  {cell.rowRank}
                  {cell.rowRank > rowTarget.rowRank ? " > " : " < "}
                  {rowTarget.rowRank}
                </span>
                <span style={{ marginLeft: 4, color: rowImprove ? "#dc2626" : "#166534" }}>
                  {rowImprove ? "偏离 ✗" : "不偏离 ✓"}
                </span>
              </div>

              {/* 列玩家 */}
              <div>
                <span style={{ opacity: 0.8 }}>列→</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 12 }}>
                  {dev.colTo}
                </span>
                <span style={{ opacity: 0.8 }}>
                  ：得 {colTarget.colRank}
                </span>
                <span style={{ marginLeft: 4 }}>
                  {cell.colRank}
                  {cell.colRank > colTarget.colRank ? " > " : " < "}
                  {colTarget.colRank}
                </span>
                <span style={{ marginLeft: 4, color: colImprove ? "#dc2626" : "#166534" }}>
                  {colImprove ? "偏离 ✗" : "不偏离 ✓"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
