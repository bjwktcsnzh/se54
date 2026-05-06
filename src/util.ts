export const RSTP_ORDERS = [
  ["R", "S", "T", "P"],
  ["R", "S", "P", "T"],
  ["R", "T", "S", "P"],
  ["R", "T", "P", "S"],
  ["R", "P", "S", "T"],
  ["R", "P", "T", "S"],
  ["S", "R", "T", "P"],
  ["S", "R", "P", "T"],
  ["S", "T", "R", "P"],
  ["S", "T", "P", "R"],
  ["S", "P", "R", "T"],
  ["S", "P", "T", "R"],
  ["T", "R", "S", "P"],
  ["T", "R", "P", "S"],
  ["T", "S", "R", "P"],
  ["T", "S", "P", "R"],
  ["T", "P", "R", "S"],
  ["T", "P", "S", "R"],
  ["P", "R", "S", "T"],
  ["P", "R", "T", "S"],
  ["P", "S", "R", "T"],
  ["P", "S", "T", "R"],
  ["P", "T", "R", "S"],
  ["P", "T", "S", "R"],
] as const;

export type RstpLetter = (typeof RSTP_ORDERS[number])[number];
export type RstpOrder = typeof RSTP_ORDERS[number];

export const rstpLabels: Record<RstpLetter, string> = {
  R: "Reward（双方合作）",
  S: "Sucker（合作 vs 背叛）",
  T: "Temptation（背叛 vs 合作）",
  P: "Punishment（双方背叛）",
};

const rstpChars: RstpLetter[] = ["R", "S", "T", "P"];

export type DominantRow = "top" | "bottom" | null;

/** 根据 RSTP 顺序判断行玩家的严格优势行（算法层） */
export function findDominantRow(order: RstpOrder): DominantRow {
  const rank: Record<string, number> = {};
  order.forEach((ch, i) => {
    rank[ch] = 3 - i;
  });

  const topDominant = rank["R"] > rank["T"] && rank["S"] > rank["P"];
  const bottomDominant = rank["T"] > rank["R"] && rank["P"] > rank["S"];

  if (topDominant) return "top";
  if (bottomDominant) return "bottom";
  return null;
}

/** 根据收益排名（3=最高，0=最低）返回颜色 */
export function getPayoffColor(rankIndex: number): string {
  const colors = ["#ef4444", "#f97316", "#06b6d4", "#22c55e"] as const;
  return colors[rankIndex] ?? "#000";
}

/** 计算排列的 Lehmer 码（阶乘进制），输出 0-23 */
export function permutationIndex(order: RstpOrder): number {
  const nums = order.map((c) => "RSTP".indexOf(c));
  let idx = 0;
  for (let i = 0; i < 4; i++) {
    let smaller = 0;
    for (let j = i + 1; j < 4; j++) {
      if (nums[j] < nums[i]) smaller++;
    }
    idx = idx * (4 - i) + smaller;
  }
  return idx;
}

/** 语义化编号映射表 */
export const SEMANTIC_KEYS: Record<number, string> = {
  0: "C1", 1: "C2", 2: "C3",
  3: "A2", 4: "B1", 5: "A1",
  6: "C4", 7: "C5",
  8: "B2", 9: "A4", 10: "C6", 11: "A3",
  12: "A6", 13: "D6", 14: "A5", 15: "B3",
  16: "D5", 17: "D4", 18: "A8", 19: "B4",
  20: "A7", 21: "D3", 22: "D2", 23: "D1",
};

export const CATEGORY_INFO: Record<string, { label: string }> = {
  C: { label: "C（严格合作）" },
  D: { label: "D（严格背叛）" },
  A: { label: "A（总有风险小的选项）" },
  B: { label: "B" },
};

export const CATEGORY_COLORS: Record<string, string> = {
  C: "#166534",
  D: "#dc2626",
  A: "#92400e",
  B: "#7c3aed",
};

/** 按分类顺序排列的 24 个索引 */
export const CATEGORY_SORT: number[] = [
  0, 1, 2, 6, 7, 10,  // C1-C6
  23, 22, 21, 17, 16, 13,  // D1-D6
  5, 3, 11, 9, 14, 12, 20, 18,  // A1-A8
  4, 8, 15, 19,  // B1-B4
];

/** 将 [R, S, T, P] 收益值转换为从高到低的 RSTP 顺序 */
export function payoffs2order(
  payoffs: [number, number, number, number],
): RstpOrder {
  const indexed = rstpChars.map((ch, i) => ({ ch, value: payoffs[i] }));
  indexed.sort((a, b) => b.value - a.value);
  return indexed.map((x) => x.ch) as unknown as RstpOrder;
}

/** 根据语义化编号（不区分大小写）查找 RSTP 顺序 */
export function orderFromSk(sk: string): RstpOrder | undefined {
  const entry = Object.entries(SEMANTIC_KEYS).find(
    ([, v]) => v.toLowerCase() === sk.toLowerCase(),
  );
  if (!entry) return undefined;
  return RSTP_ORDERS[Number(entry[0])];
}

/** 根据语义化编号（不区分大小写）查找排列索引 */
export function idxFromSk(sk: string): number | undefined {
  const entry = Object.entries(SEMANTIC_KEYS).find(
    ([, v]) => v.toLowerCase() === sk.toLowerCase(),
  );
  return entry ? Number(entry[0]) : undefined;
}

/* ── 博弈分析类型 ─────────────────────────────────────── */

export type PayoffRank = 0 | 1 | 2 | 3;
export type PayoffCell = [PayoffRank, PayoffRank];
/** [R, S, T, P] × [rowRank, colRank] */
export type GamePayoffMatrix = [PayoffCell, PayoffCell, PayoffCell, PayoffCell];

export type Action = "C" | "D";
export type NashEq = { row: Action; col: Action };

/** 行列 RSTP 顺序 → 4×2 收益排名矩阵 */
export function gamePayoffs(
  rowOrder: RstpOrder,
  colOrder: RstpOrder,
): GamePayoffMatrix {
  const rank = (order: RstpOrder): Record<string, number> => {
    const r: Record<string, number> = {};
    (order as readonly string[]).forEach((ch, i) => { r[ch] = 3 - i; });
    return r;
  };
  const rr = rank(rowOrder);
  const cr = rank(colOrder);
  return [
    [rr.R as PayoffRank, cr.R as PayoffRank],
    [rr.S as PayoffRank, cr.T as PayoffRank],
    [rr.T as PayoffRank, cr.S as PayoffRank],
    [rr.P as PayoffRank, cr.P as PayoffRank],
  ];
}

/** 列玩家的严格优势列 */
export type DominantCol = "left" | "right" | null;

export function findDominantCol(order: RstpOrder): DominantCol {
  const rank: Record<string, number> = {};
  (order as readonly string[]).forEach((ch, i) => { rank[ch] = 3 - i; });
  const leftDominant = rank["R"] > rank["T"] && rank["S"] > rank["P"];
  const rightDominant = rank["T"] > rank["R"] && rank["P"] > rank["S"];
  if (leftDominant) return "left";
  if (rightDominant) return "right";
  return null;
}

/* ── 常见博弈情形名称映射 ──────────────────────────── */

/** 游戏 key（小写，如 "a6a6"）→ 常见情形名称 */
export const GAME_COMMON_NAMES: Record<string, string> = {
  // === 对称博弈（对角线） ===
  // C 类 — 合作严格占优
  "c1c1": "和谐博弈",
  "c2c2": "和谐博弈",
  "c3c3": "和谐博弈",
  "c4c4": "和谐博弈",
  "c5c5": "和谐博弈",
  "c6c6": "和谐博弈",

  // A 类 — 无严格优势，有风险较小选项
  "a2a2": "猎鹿博弈",   // R>T>P>S，两个 NE：(C,C)(D,D)
  "a6a6": "雪堆博弈",   // T>R>S>P，两个 NE：(C,D)(D,C)

  // D 类 — 背叛严格占优
  "d5d5": "死锁博弈",   // T>P>R>S，(D,D) 优于 (C,C)
  "d6d6": "囚徒困境",   // T>R>P>S，(D,D) 劣于 (C,C)

  // === 非对称博弈 ===
  "a1a8": "性别战",     // 两个 NE：(C,C)(D,D)，偏好冲突
  "a8a1": "性别战",
  "a6d6": "智猪博弈",   // 大猪按按钮，小猪搭便车
  "d6a6": "智猪博弈",
};

/** 寻找纯策略纳什均衡 */
export function findPureNash(payoffs: GamePayoffMatrix): NashEq[] {
  const [[rR, cR], [rS, cT], [rT, cS], [rP, cP]] = payoffs;
  const eq: NashEq[] = [];
  // 四个单元格中谁的收益更优（rank 更大）则不会偏离
  if (rR > rT && cR > cT) eq.push({ row: "C", col: "C" });
  if (rS > rP && cT > cR) eq.push({ row: "C", col: "D" });
  if (rT > rR && cS > cP) eq.push({ row: "D", col: "C" });
  if (rP > rS && cP > cS) eq.push({ row: "D", col: "D" });
  return eq;
}
