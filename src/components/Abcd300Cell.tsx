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

function cellAnalysis(rowOrder: RstpOrder, colOrder: RstpOrder) {
  const p = gamePayoffs(rowOrder, colOrder);
  const [[rR, cR], [rS, cT], [rT, cS], [rP, cP]] = p;

  const rowDom = findDominantRow(rowOrder);
  const colDom = findDominantCol(colOrder);
  const nash = findPureNash(p);

  const rowPred =
    rowDom === "top" ? "C" : rowDom === "bottom" ? "D" : null;
  const colPred =
    colDom === "left" ? "C" : colDom === "right" ? "D" : null;
  const bothDom = rowPred && colPred;

  const cellMap: Record<string, { rr: number; cr: number }> = {
    CC: { rr: rR, cr: cR },
    CD: { rr: rS, cr: cT },
    DC: { rr: rT, cr: cS },
    DD: { rr: rP, cr: cP },
  };

  if (bothDom) {
    const key = `${rowPred}${colPred}`;
    return {
      type: "dominant" as const,
      cells: [cellMap[key]],
      actions: [key],
    };
  }

  if (nash.length > 0) {
    return {
      type: "nash" as const,
      cells: nash.map((ne) => cellMap[`${ne.row}${ne.col}`]),
      actions: nash.map((ne) => `${ne.row}${ne.col}`),
    };
  }

  return {
    type: "none" as const,
    cells: [] as Array<{ rr: number; cr: number }>,
    actions: [] as string[],
  };
}

interface Props {
  rowOrder: RstpOrder;
  colOrder: RstpOrder;
  label: string;
  width: number;
  height: number;
  fontSize: number;
  showName?: boolean;
  onClick?: () => void;
  eqFilter?: Set<string>;
}

export default function Abcd300Cell({
  rowOrder,
  colOrder,
  label,
  width,
  height,
  fontSize,
  showName,
  onClick,
  eqFilter,
}: Props) {
  const info = cellAnalysis(rowOrder, colOrder);
  const filteredOut =
    eqFilter && eqFilter.size < 4
    && info.actions.length > 0
    && !info.actions.some((a) => eqFilter.has(a));
  const prefix = info.type === "dominant" ? "*" : info.type === "nash" ? "NE" : "";
  const prefixGap = prefix ? 2 : 0;
  const gameInfo = showName ? getGameCommonInfo(label.toLowerCase()) : undefined;
  const displayText = gameInfo?.name ?? label;
  const nameFontSize = showName ? Math.max(7, fontSize - 1) : fontSize;

  /* tooltip: 博弈类型 + 角色名 */
  const roleTip = gameInfo?.rowPlayerName
    ? `（${gameInfo.rowPlayerName} vs ${gameInfo.colPlayerName}）`
    : "";
  const typeTip =
    info.type === "dominant"
      ? `严格优势 ${displayText}`
      : info.type === "nash"
        ? `纳什均衡 ${displayText}`
        : displayText;
  const title = `${typeTip}${roleTip} (${label})`;

  const bgStyle = (rr: number, cr: number): React.CSSProperties => ({
    width: info.cells.length > 1 ? `${100 / info.cells.length}%` : "100%",
    height: "100%",
    background: `linear-gradient(to top right, ${hexToRgba(RANK_COLORS[rr] ?? "#000", 0.25)} 50%, ${hexToRgba(RANK_COLORS[cr] ?? "#000", 0.25)} 50%)`,
  });

  return (
    <div
      title={title}
      onClick={onClick}
      style={{
        width,
        height,
        minWidth: width,
        minHeight: height,
        boxSizing: "border-box",
        border: "1px solid var(--border)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        cursor: onClick ? "pointer" : undefined,
        opacity: filteredOut ? 0.3 : undefined,
      }}
    >
      {info.cells.length > 0 && (
        <div style={{ position: "absolute", inset: 0, display: "flex" }}>
          {info.cells.map((c, i) => {
            const act = info.actions[i];
            const tri =
              act === "CC"
                ? { top: 0, left: 0, borderTop: "8px solid #eab308", borderRight: "8px solid transparent" }
                : act === "CD"
                  ? { top: 0, right: 0, borderTop: "8px solid #eab308", borderLeft: "8px solid transparent" }
                  : act === "DC"
                    ? { bottom: 0, left: 0, borderBottom: "8px solid #eab308", borderRight: "8px solid transparent" }
                    : { bottom: 0, right: 0, borderBottom: "8px solid #eab308", borderLeft: "8px solid transparent" };
            return (
              <div key={i} style={{ ...bgStyle(c.rr, c.cr), position: "relative" }}>
                {act && (
                  <div
                    style={{
                      position: "absolute",
                      width: 0,
                      height: 0,
                      zIndex: 1,
                      filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.15))",
                      ...tri,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      <span
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: nameFontSize,
          fontFamily: "var(--mono)",
          color: "var(--text)",
          fontWeight: info.type === "dominant" ? 700 : 400,
          overflow: "hidden",
          textShadow:
            info.cells.length > 0
              ? "0 0 3px var(--bg), 0 0 3px var(--bg), 0 0 1px var(--bg)"
              : "none",
          padding: "0 2px",
          gap: prefixGap,
        }}
      >
        {prefix && <span style={{ flexShrink: 0 }}>{prefix}</span>}
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayText}</span>
      </span>
    </div>
  );
}
