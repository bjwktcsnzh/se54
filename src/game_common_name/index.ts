import { parse } from "smol-toml";
import type { GameCommonInfo } from "./types";

/**
 * 所有博弈条目的映射表。
 * key 为小写的 gameKey，如 "a6a6"、"a1a8"。
 *
 * 每条目为独立的 .toml 文件，见 src/game_common_name/*.toml。
 */
export const GAME_COMMON_NAMES: Record<string, GameCommonInfo> = {};

/* 使用 Vite import.meta.glob 在构建时加载所有 TOML */
const tomlFiles = import.meta.glob("./*.toml", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

for (const [filepath, raw] of Object.entries(tomlFiles)) {
  const key = filepath.match(/\.\/(\w+)\.toml$/)?.[1];
  if (key) {
    try {
      const data = parse(raw) as Record<string, unknown>;
      const info: GameCommonInfo = {
        name: String(data.name ?? ""),
        desc: String(data.desc ?? ""),
      };
      if (typeof data.rowPlayerName === "string" && data.rowPlayerName) {
        info.rowPlayerName = data.rowPlayerName;
      }
      if (typeof data.colPlayerName === "string" && data.colPlayerName) {
        info.colPlayerName = data.colPlayerName;
      }
      GAME_COMMON_NAMES[key] = info;
    } catch (e) {
      console.error(`[game_common_name] parse error for ${filepath}:`, e);
    }
  }
}

export { type GameCommonInfo } from "./types";

/** 翻转 ABCD 标识：将 4 字符 key 的前后 2 字符互换 */
export function reverseAbcdId(id: string): string {
  if (id.length !== 4) return id;
  return id.slice(2, 4) + id.slice(0, 2);
}

/**
 * 以 gameKey 查询常见博弈名称信息。
 */
export function getGameCommonInfo(gameKey: string): GameCommonInfo | undefined {
  const k = gameKey.toLowerCase();
  let info = GAME_COMMON_NAMES[k];
  if (!info && k.length === 4) {
    const reversed = reverseAbcdId(k);
    if (reversed !== k) info = GAME_COMMON_NAMES[reversed];
  }
  return info;
}
