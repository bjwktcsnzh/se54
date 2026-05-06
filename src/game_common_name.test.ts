import { describe, it, expect } from "vitest";
import { getGameCommonInfo, reverseAbcdId } from "./game_common_name";

/* ============================================================
   所有 34 条博弈条目枚举
   对称 24（对角）：前后两字符相同
   非对称 10（上下三角）：前后两字符不同，仅 ASCII 较小的 key 有 TOML
   ============================================================ */

const SYMMETRIC = [
  "c1c1", "c2c2", "c3c3", "c4c4", "c5c5", "c6c6",
  "a1a1", "a2a2", "a3a3", "a4a4", "a5a5", "a6a6", "a7a7", "a8a8",
  "b1b1", "b2b2", "b3b3", "b4b4",
  "d1d1", "d2d2", "d3d3", "d4d4", "d5d5", "d6d6",
] as const;

const ASYMMETRIC_PAIRS: [primary: string, flipped: string][] = [
  ["a1a8", "a8a1"],
  ["a1d6", "d6a1"],
  ["a5a6", "a6a5"],
  ["a5c1", "c1a5"],
  ["a5d5", "d5a5"],
  ["a6b3", "b3a6"],
  ["a6c1", "c1a6"],
  ["a6d6", "d6a6"],
  ["b3c1", "c1b3"],
  ["b3d4", "d4b3"],
];

/* ── reverseAbcdId ──────────────────────────────────────── */

describe("reverseAbcdId", () => {
  it("交换前后两字符组: d6a6 → a6d6", () => {
    expect(reverseAbcdId("d6a6")).toBe("a6d6");
  });

  it("对称游戏翻转不变: a6a6 → a6a6", () => {
    expect(reverseAbcdId("a6a6")).toBe("a6a6");
  });

  it("非 4 字符原样返回", () => {
    expect(reverseAbcdId("abc")).toBe("abc");
    expect(reverseAbcdId("")).toBe("");
  });

  for (const [primary, flipped] of ASYMMETRIC_PAIRS) {
    it(`reverseAbcdId("${flipped}") → "${primary}"`, () => {
      expect(reverseAbcdId(flipped)).toBe(primary);
    });
  }
});

/* ── 非对称博弈：每对只有一份数据 ────────────────────── */

describe("非对称博弈 → 同一 TOML 无冲突", () => {
  for (const [primary, flipped] of ASYMMETRIC_PAIRS) {
    it(`${primary} / ${flipped} 返回同一引用`, () => {
      const a = getGameCommonInfo(primary);
      const b = getGameCommonInfo(flipped);
      expect(a).toBeDefined();
      expect(b).toBeDefined();
      expect(a).toBe(b); // 同一对象，非 deep equal
    });

    it(`${primary} 包含 rowPlayerName + colPlayerName`, () => {
      const info = getGameCommonInfo(primary)!;
      expect(info.rowPlayerName).toBeTypeOf("string");
      expect(info.rowPlayerName!.length).toBeGreaterThan(0);
      expect(info.colPlayerName).toBeTypeOf("string");
      expect(info.colPlayerName!.length).toBeGreaterThan(0);
    });
  }

  it(`共 ${ASYMMETRIC_PAIRS.length} 对非对称博弈`, () => {
    expect(ASYMMETRIC_PAIRS).toHaveLength(10);
  });
});

/* ── 对称博弈 ──────────────────────────────────────────── */

describe("对称博弈", () => {
  for (const key of SYMMETRIC) {
    it(`${key} 可加载且有名称`, () => {
      const info = getGameCommonInfo(key);
      expect(info).toBeDefined();
      expect(info!.name).toBeTypeOf("string");
      expect(info!.name.length).toBeGreaterThan(0);
    });

    it(`${key} 不包含角色名`, () => {
      const info = getGameCommonInfo(key)!;
      expect(info.rowPlayerName).toBeUndefined();
      expect(info.colPlayerName).toBeUndefined();
    });
  }

  it(`共 ${SYMMETRIC.length} 个对称博弈`, () => {
    expect(SYMMETRIC).toHaveLength(24);
  });
});

/* ── 全覆盖 ────────────────────────────────────────────── */

describe("全覆盖", () => {
  const ALL_PRIMARY_KEYS = [...SYMMETRIC, ...ASYMMETRIC_PAIRS.map(([k]) => k)];

  it("所有 34 个条目均能加载", () => {
    for (const key of ALL_PRIMARY_KEYS) {
      expect(getGameCommonInfo(key)).toBeDefined();
    }
  });

  it("无效 key 返回 undefined", () => {
    expect(getGameCommonInfo("zzzz")).toBeUndefined();
    expect(getGameCommonInfo("")).toBeUndefined();
  });

  it("翻转方向也能全部加载（不遗漏别名）", () => {
    for (const [, flipped] of ASYMMETRIC_PAIRS) {
      expect(getGameCommonInfo(flipped)).toBeDefined();
    }
  });
});
