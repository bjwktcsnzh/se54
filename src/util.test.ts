import { describe, it, expect } from "vitest";
import {
  RSTP_ORDERS,
  permutationIndex,
  findDominantRow,
  payoffs2order,
  SEMANTIC_KEYS,
  CATEGORY_SORT,
  CATEGORY_INFO,
  CATEGORY_COLORS,
  getPayoffColor,
  rstpLabels,
  gamePayoffs,
  findPureNash,
} from "./util";
import type { RstpOrder } from "./util";

/* ============================================================
   核心映射表：RSTP 字符串 ↔ 索引 0-23 ↔ 语义化编号
   三者互为锁定关系，修改任一方必须同步更新
   ============================================================ */

const CANONICAL: { order: RstpOrder; idx: number; sk: string; cat: string }[] = [
  { order: ["R", "S", "T", "P"], idx: 0, sk: "C1", cat: "C" },
  { order: ["R", "S", "P", "T"], idx: 1, sk: "C2", cat: "C" },
  { order: ["R", "T", "S", "P"], idx: 2, sk: "C3", cat: "C" },
  { order: ["R", "T", "P", "S"], idx: 3, sk: "A2", cat: "A" },
  { order: ["R", "P", "S", "T"], idx: 4, sk: "B1", cat: "B" },
  { order: ["R", "P", "T", "S"], idx: 5, sk: "A1", cat: "A" },
  { order: ["S", "R", "T", "P"], idx: 6, sk: "C4", cat: "C" },
  { order: ["S", "R", "P", "T"], idx: 7, sk: "C5", cat: "C" },
  { order: ["S", "T", "R", "P"], idx: 8, sk: "B2", cat: "B" },
  { order: ["S", "T", "P", "R"], idx: 9, sk: "A4", cat: "A" },
  { order: ["S", "P", "R", "T"], idx: 10, sk: "C6", cat: "C" },
  { order: ["S", "P", "T", "R"], idx: 11, sk: "A3", cat: "A" },
  { order: ["T", "R", "S", "P"], idx: 12, sk: "A6", cat: "A" },
  { order: ["T", "R", "P", "S"], idx: 13, sk: "D6", cat: "D" },
  { order: ["T", "S", "R", "P"], idx: 14, sk: "A5", cat: "A" },
  { order: ["T", "S", "P", "R"], idx: 15, sk: "B3", cat: "B" },
  { order: ["T", "P", "R", "S"], idx: 16, sk: "D5", cat: "D" },
  { order: ["T", "P", "S", "R"], idx: 17, sk: "D4", cat: "D" },
  { order: ["P", "R", "S", "T"], idx: 18, sk: "A8", cat: "A" },
  { order: ["P", "R", "T", "S"], idx: 19, sk: "B4", cat: "B" },
  { order: ["P", "S", "R", "T"], idx: 20, sk: "A7", cat: "A" },
  { order: ["P", "S", "T", "R"], idx: 21, sk: "D3", cat: "D" },
  { order: ["P", "T", "R", "S"], idx: 22, sk: "D2", cat: "D" },
  { order: ["P", "T", "S", "R"], idx: 23, sk: "D1", cat: "D" },
];

/* ── RSTP_ORDERS ─────────────────────────────────────────── */

describe("RSTP_ORDERS", () => {
  it("恰好 24 种排列", () => {
    expect(RSTP_ORDERS).toHaveLength(24);
  });

  it("按 Lehmer 码升序（相邻间 idx 递增）", () => {
    for (let i = 1; i < 24; i++) {
      expect(permutationIndex(RSTP_ORDERS[i])).toBeGreaterThan(permutationIndex(RSTP_ORDERS[i - 1]));
    }
  });

  it("与规范表顺序完全一致", () => {
    for (let i = 0; i < 24; i++) {
      expect(RSTP_ORDERS[i]).toEqual(CANONICAL[i].order);
    }
  });
});

/* ── permutationIndex ────────────────────────────────────── */

describe("permutationIndex", () => {
  it("24 种排列输出 0-23", () => {
    expect(RSTP_ORDERS.map(permutationIndex)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]);
  });

  it("与规范表完全一致", () => {
    for (const row of CANONICAL) {
      expect(permutationIndex(row.order)).toBe(row.idx);
    }
  });

  it("permutationIndex(RSTP_ORDERS[i]) === i", () => {
    for (let i = 0; i < 24; i++) {
      expect(permutationIndex(RSTP_ORDERS[i])).toBe(i);
    }
  });

  it("每个输出唯一", () => {
    expect(new Set(RSTP_ORDERS.map(permutationIndex)).size).toBe(24);
  });

  it("RSTP → 0", () => {
    expect(permutationIndex(["R", "S", "T", "P"])).toBe(0);
  });

  it("PTSR → 23", () => {
    expect(permutationIndex(["P", "T", "S", "R"])).toBe(23);
  });
});

/* ── SEMANTIC_KEYS ───────────────────────────────────────── */

describe("SEMANTIC_KEYS", () => {
  it("覆盖 0-23 每个索引", () => {
    for (let i = 0; i < 24; i++) {
      expect(SEMANTIC_KEYS[i]).toBeDefined();
    }
  });

  it("与规范表完全一致", () => {
    for (const row of CANONICAL) {
      expect(SEMANTIC_KEYS[row.idx]).toBe(row.sk);
    }
  });

  it("格式为 字母 + 数字", () => {
    for (let i = 0; i < 24; i++) {
      expect(SEMANTIC_KEYS[i]).toMatch(/^[CDAB]\d$/);
    }
  });
});

/* ── 三向映射 ──────────────────────────────────────────── */

describe("三向映射锁定测试", () => {
  it("RSTP 字符串 → 索引 → 语义编号", () => {
    for (const row of CANONICAL) {
      const idx = permutationIndex(row.order);
      expect(idx).toBe(row.idx);
      expect(SEMANTIC_KEYS[idx]).toBe(row.sk);
    }
  });

  it("RSTP_ORDERS[i] → 语义编号 = CANONICAL[i].sk", () => {
    for (let i = 0; i < 24; i++) {
      const sk = SEMANTIC_KEYS[permutationIndex(RSTP_ORDERS[i])];
      expect(sk).toBe(CANONICAL[i].sk);
    }
  });
});

/* ── 分类统计 ───────────────────────────────────────────── */

describe("分类统计", () => {
  it("C 类 6 个: 0,1,2,6,7,10", () => {
    const got = CANONICAL.filter((r) => r.cat === "C").map((r) => r.idx).sort((a, b) => a - b);
    expect(got).toEqual([0, 1, 2, 6, 7, 10]);
  });

  it("D 类 6 个: 13,16,17,21,22,23", () => {
    const got = CANONICAL.filter((r) => r.cat === "D").map((r) => r.idx).sort((a, b) => a - b);
    expect(got).toEqual([13, 16, 17, 21, 22, 23]);
  });

  it("A 类 8 个: 3,5,9,11,12,14,18,20", () => {
    const got = CANONICAL.filter((r) => r.cat === "A").map((r) => r.idx).sort((a, b) => a - b);
    expect(got).toEqual([3, 5, 9, 11, 12, 14, 18, 20]);
  });

  it("B 类 4 个: 4,8,15,19", () => {
    const got = CANONICAL.filter((r) => r.cat === "B").map((r) => r.idx).sort((a, b) => a - b);
    expect(got).toEqual([4, 8, 15, 19]);
  });

  it("四类合计 24", () => {
    const cats = ["C", "D", "A", "B"] as const;
    const counts = cats.map((c) => CANONICAL.filter((r) => r.cat === c).length);
    expect(counts).toEqual([6, 6, 8, 4]);
    expect(counts.reduce((a, b) => a + b, 0)).toBe(24);
  });

  it("C 类严格优势行均为 top", () => {
    for (const row of CANONICAL.filter((r) => r.cat === "C")) {
      expect(findDominantRow(row.order)).toBe("top");
    }
  });

  it("D 类严格优势行均为 bottom", () => {
    for (const row of CANONICAL.filter((r) => r.cat === "D")) {
      expect(findDominantRow(row.order)).toBe("bottom");
    }
  });

  it("A 和 B 类均无严格优势行", () => {
    for (const row of CANONICAL.filter((r) => r.cat === "A" || r.cat === "B")) {
      expect(findDominantRow(row.order)).toBeNull();
    }
  });
});

/* ── CATEGORY_SORT ──────────────────────────────────────── */

describe("CATEGORY_SORT", () => {
  it("包含 24 个不重复索引", () => {
    expect(new Set(CATEGORY_SORT).size).toBe(24);
    expect(CATEGORY_SORT).toHaveLength(24);
  });

  it("覆盖 0-23", () => {
    for (let i = 0; i < 24; i++) {
      expect(CATEGORY_SORT).toContain(i);
    }
  });

  it("分组有序: C → D → A → B", () => {
    const cats = CATEGORY_SORT.map((i) => SEMANTIC_KEYS[i]![0]);
    expect(cats.lastIndexOf("C")).toBeLessThan(cats.indexOf("D"));
    expect(cats.lastIndexOf("D")).toBeLessThan(cats.indexOf("A"));
    expect(cats.lastIndexOf("A")).toBeLessThan(cats.indexOf("B"));
  });

  it("每组内编号升序", () => {
    expect(CATEGORY_SORT.slice(0, 6).map((i) => SEMANTIC_KEYS[i]))
      .toEqual(["C1", "C2", "C3", "C4", "C5", "C6"]);
    expect(CATEGORY_SORT.slice(6, 12).map((i) => SEMANTIC_KEYS[i]))
      .toEqual(["D1", "D2", "D3", "D4", "D5", "D6"]);
    expect(CATEGORY_SORT.slice(12, 20).map((i) => SEMANTIC_KEYS[i]))
      .toEqual(["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8"]);
    expect(CATEGORY_SORT.slice(20, 24).map((i) => SEMANTIC_KEYS[i]))
      .toEqual(["B1", "B2", "B3", "B4"]);
  });
});

/* ── findDominantRow ─────────────────────────────────────── */

describe("findDominantRow（逐条验证）", () => {
  const cases: { order: RstpOrder; expected: string }[] = [
    { order: ["R", "S", "T", "P"], expected: "top" },     // C1
    { order: ["R", "S", "P", "T"], expected: "top" },     // C2
    { order: ["R", "T", "S", "P"], expected: "top" },     // C3
    { order: ["R", "T", "P", "S"], expected: "null" },    // A2
    { order: ["R", "P", "S", "T"], expected: "null" },    // B1
    { order: ["R", "P", "T", "S"], expected: "null" },    // A1
    { order: ["S", "R", "T", "P"], expected: "top" },     // C4
    { order: ["S", "R", "P", "T"], expected: "top" },     // C5
    { order: ["S", "T", "R", "P"], expected: "null" },    // B2
    { order: ["S", "T", "P", "R"], expected: "null" },    // A4
    { order: ["S", "P", "R", "T"], expected: "top" },     // C6
    { order: ["S", "P", "T", "R"], expected: "null" },    // A3
    { order: ["T", "R", "S", "P"], expected: "null" },    // A6
    { order: ["T", "R", "P", "S"], expected: "bottom" },  // D6
    { order: ["T", "S", "R", "P"], expected: "null" },    // A5
    { order: ["T", "S", "P", "R"], expected: "null" },    // B3
    { order: ["T", "P", "R", "S"], expected: "bottom" },  // D5
    { order: ["T", "P", "S", "R"], expected: "bottom" },  // D4
    { order: ["P", "R", "S", "T"], expected: "null" },    // A8
    { order: ["P", "R", "T", "S"], expected: "null" },    // B4
    { order: ["P", "S", "R", "T"], expected: "null" },    // A7
    { order: ["P", "S", "T", "R"], expected: "bottom" },  // D3
    { order: ["P", "T", "R", "S"], expected: "bottom" },  // D2
    { order: ["P", "T", "S", "R"], expected: "bottom" },  // D1
  ];

  for (const { order, expected } of cases) {
    it(`${order.join("")} → ${expected}`, () => {
      expect(findDominantRow(order)).toBe(expected === "null" ? null : expected);
    });
  }
});

/* ── getPayoffColor ──────────────────────────────────────── */

describe("getPayoffColor", () => {
  it("4 种排名返回 4 种不同颜色", () => {
    expect(new Set([0, 1, 2, 3].map(getPayoffColor)).size).toBe(4);
  });

  it("排名 3 绿色, 排名 0 红色", () => {
    expect(getPayoffColor(3)).toBe("#22c55e");
    expect(getPayoffColor(0)).toBe("#ef4444");
  });

  it("越界返回 #000", () => {
    expect(getPayoffColor(-1)).toBe("#000");
    expect(getPayoffColor(4)).toBe("#000");
  });
});

/* ── payoffs2order ───────────────────────────────────────── */

describe("payoffs2order", () => {
  it("T=5 R=3 P=2 S=1 → TRPS", () => {
    expect(payoffs2order([3, 1, 5, 2])).toEqual(["T", "R", "P", "S"]);
  });

  it("R=4 S=3 T=2 P=1 → RSTP", () => {
    expect(payoffs2order([4, 3, 2, 1])).toEqual(["R", "S", "T", "P"]);
  });

  it("全相等时保持 rstpChars 顺序: RSTP", () => {
    expect(payoffs2order([3, 3, 3, 3])).toEqual(["R", "S", "T", "P"]);
  });

  it("逆向验证: 从规范表构造收益值可还原", () => {
    for (const row of CANONICAL) {
      const payoffs: [number, number, number, number] = [0, 0, 0, 0];
      row.order.forEach((ch, i) => {
        const idx = { R: 0, S: 1, T: 2, P: 3 }[ch]!;
        payoffs[idx] = 4 - i;
      });
      expect(payoffs2order(payoffs)).toEqual(row.order);
    }
  });

  it("返回值始终是有效排列", () => {
    const orders = new Set(RSTP_ORDERS.map((o) => o.join("")));
    expect(orders.has(payoffs2order([10, -1, 5, 0]).join(""))).toBe(true);
  });
});

/* ── rstpLabels ──────────────────────────────────────────── */

describe("rstpLabels", () => {
  it("覆盖 R,S,T,P 四个字母", () => {
    expect(Object.keys(rstpLabels).sort()).toEqual(["P", "R", "S", "T"]);
  });

  it("每个标签非空", () => {
    for (const v of Object.values(rstpLabels)) {
      expect(v.length).toBeGreaterThan(0);
    }
  });
});

/* ── CATEGORY_INFO / CATEGORY_COLORS ────────────────────── */

describe("CATEGORY_INFO", () => {
  it("覆盖 C,D,A,B", () => {
    expect(Object.keys(CATEGORY_INFO).sort()).toEqual(["A", "B", "C", "D"]);
  });

  it("A: 总有风险小的选项", () => {
    expect(CATEGORY_INFO.A.label).toBe("A（总有风险小的选项）");
  });

  it("C: 严格合作", () => {
    expect(CATEGORY_INFO.C.label).toBe("C（严格合作）");
  });

  it("D: 严格背叛", () => {
    expect(CATEGORY_INFO.D.label).toBe("D（严格背叛）");
  });
});

/* ── gamePayoffs + findPureNash 交叉验证 ──────────────────── */

describe("gamePayoffs 矩阵验证（C5 对称博弈）", () => {
  const c5 = RSTP_ORDERS[7]; // ["S","R","P","T"]
  const p = gamePayoffs(c5, c5);
  const [[rR, cR], [rS, cT], [rT, cS], [rP, cP]] = p;

  it("C5: S=3, R=2, P=1, T=0", () => {
    expect({ rS, rR, rP, rT }).toEqual({ rS: 3, rR: 2, rP: 1, rT: 0 });
    expect({ cS, cR, cP, cT }).toEqual({ cS: 3, cR: 2, cP: 1, cT: 0 });
  });

  it("C5 标准矩阵: CC=(2,2) CD=(3,0) DC=(0,3) DD=(1,1)", () => {
    expect(p).toEqual([
      [2, 2],
      [3, 0],
      [0, 3],
      [1, 1],
    ]);
  });

  it("C5: CC 是唯一纳什均衡", () => {
    const ne = findPureNash(p);
    expect(ne).toEqual([{ row: "C", col: "C" }]);
  });
});

/* ── 各分类的代表性博弈矩阵验证 ──────────────────────────── */

describe.each([
  // D6 囚徒困境: T>R>P>S, 即 T=3,R=2,P=1,S=0
  // CC=(R,R)=(2,2) CD=(S,T)=(0,3) DC=(T,S)=(3,0) DD=(P,P)=(1,1)
  { sk: "D6", idx: 13, order: ["T", "R", "P", "S"] as const, name: "囚徒困境", expected: {
    matrix: [[2,2],[0,3],[3,0],[1,1]] as const,
    ne: [{ row: "D", col: "D" }] as const,
  }},
  // A6 雪堆博弈: T>R>S>P, 即 T=3,R=2,S=1,P=0
  // CC=(R,R)=(2,2) CD=(S,T)=(1,3) DC=(T,S)=(3,1) DD=(P,P)=(0,0)
  { sk: "A6", idx: 12, order: ["T", "R", "S", "P"] as const, name: "雪堆博弈", expected: {
    matrix: [[2,2],[1,3],[3,1],[0,0]] as const,
    ne: [{ row: "C", col: "D" }, { row: "D", col: "C" }] as const,
  }},
  // A2 猎鹿博弈: R>T>P>S, 即 R=3,T=2,P=1,S=0
  // CC=(R,R)=(3,3) CD=(S,T)=(0,2) DC=(T,S)=(2,0) DD=(P,P)=(1,1)
  { sk: "A2", idx: 3, order: ["R", "T", "P", "S"] as const, name: "猎鹿博弈", expected: {
    matrix: [[3,3],[0,2],[2,0],[1,1]] as const,
    ne: [{ row: "C", col: "C" }, { row: "D", col: "D" }] as const,
  }},
  // D5 死锁博弈: T>P>R>S, 即 T=3,P=2,R=1,S=0
  // CC=(R,R)=(1,1) CD=(S,T)=(0,3) DC=(T,S)=(3,0) DD=(P,P)=(2,2)
  { sk: "D5", idx: 16, order: ["T", "P", "R", "S"] as const, name: "死锁博弈", expected: {
    matrix: [[1,1],[0,3],[3,0],[2,2]] as const,
    ne: [{ row: "D", col: "D" }] as const,
  }},
])("$sk $name", ({ order, expected }) => {
  const p = gamePayoffs(order, order);

  it(`${order.join("")}×${order.join("")} 标准矩阵正确`, () => {
    expect(p).toEqual([...expected.matrix]);
  });

  it("纯策略纳什均衡正确", () => {
    expect(findPureNash(p)).toEqual([...expected.ne]);
  });
});

/* ── 非对称博弈 ────────────────────────────────────────── */

describe("非对称博弈 A6×D6（智猪博弈）", () => {
  const a6 = RSTP_ORDERS[12]; // ["T","R","S","P"]
  const d6 = RSTP_ORDERS[13]; // ["T","R","P","S"]
  const p = gamePayoffs(a6, d6);
  const [[rR, cR], [rS, cT], [rT, cS], [rP, cP]] = p;

  it("A6: T=3,R=2,S=1,P=0; D6: T=3,R=2,P=1,S=0", () => {
    expect({ rT: rT, rR: rR, rS: rS, rP: rP }).toEqual({ rT: 3, rR: 2, rS: 1, rP: 0 });
    expect({ cT: cT, cR: cR, cP: cP, cS: cS }).toEqual({ cT: 3, cR: 2, cP: 1, cS: 0 });
  });

  it("标准矩阵: CC=(2,2) CD=(1,3) DC=(3,0) DD=(0,1)", () => {
    expect(p).toEqual([
      [2, 2],
      [1, 3],
      [3, 0],
      [0, 1],
    ]);
  });

  it("CD（行合作、列背叛）是唯一纯策略纳什均衡", () => {
    expect(findPureNash(p)).toEqual([{ row: "C", col: "D" }]);
  });
});

describe("CATEGORY_COLORS", () => {
  it("覆盖 C,D,A,B", () => {
    expect(Object.keys(CATEGORY_COLORS).sort()).toEqual(["A", "B", "C", "D"]);
  });

  it("每个颜色为有效十六进制", () => {
    for (const v of Object.values(CATEGORY_COLORS)) {
      expect(v).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});
