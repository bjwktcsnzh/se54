# se54 项目指南

## 技术栈

- React 19 + TypeScript 6 + Vite 8
- react-router-dom v7（文件系统路由，基于 `src/pages/**/*.tsx`）
- vitest 测试
- smol-toml 解析 TOML 元数据
- 无 CSS 框架，全部 inline style

## 关键命令

```bash
npm run dev      # 启动开发服务器
npm run build    # tsc -b + vite build
npm test         # vitest run
npx tsc --noEmit # 仅类型检查
```

## RSTP 框架（核心概念）

RSTP 是 2×2 博弈的序数收益框架：

- **R**eward — 双方合作
- **S**ucker — 合作遇背叛
- **T**emptation — 背叛遇合作
- **P**unishment — 双方背叛

收益从高到低排列：3=best, 2, 1, 0=worst

## 数据结构

- `src/util.ts` — 核心函数
  - `RSTP_ORDERS` — 24 种排列，按 Lehmer 码排序
  - `SEMANTIC_KEYS` — 索引 0-23 → 语义编号（C1/D6/A3 等）
  - `CATEGORY_SORT` — 24 个索引按 C→D→A→B 分组排序
  - `gamePayoffs(rowOrder, colOrder)` → 收益矩阵 `[CC, CD, DC, DD]`
    - 返回值: `[[rR, cR], [rS, cT], [rT, cS], [rP, cP]]`
  - `findDominantRow/Col` → 严格优势策略检测
  - `findPureNash(payoffs)` → 纯策略纳什均衡列表

- `src/game_common_name/` — 34 个 TOML 文件（24 对称 + 10 非对称）
  - 非对称博弈仅在小 key 侧存数据，`getGameCommonInfo` 自动解析
  - 包含 name, desc, rowPlayerName, colPlayerName

## 组件架构

- `src/components/Rstp.tsx` — 2×2 着色字母块
- `src/components/Rstp24Item.tsx` — 单个排列的分类展示
- `src/components/Rstp24Table.tsx` — 24 排列全表
- `src/components/Abcd300.tsx` — 24×24 热力图（含均衡筛选器）
- `src/components/Abcd300Cell.tsx` — 单个热力图单元格
- `src/components/Abcd300DetailCompute.tsx` — 详情页博弈分析（矩阵 + 纳什推导）

## 关键规则

- 收益排名：**3 = best, 0 = worst**
- `gamePayoffs` 返回 `[CC, CD, DC, DD]`，顺序对应合作-背叛的标准矩阵
- 标准矩阵：
  ```
         C        D
    C  (R,R)   (S,T)
    D  (T,S)   (P,P)
  ```
- Cell 布局：左下角为行玩家收益（左侧行表头），右上角为列玩家收益（上方列表头）
- 颜色：`RANK_COLORS = ["#ef4444"(红/0), "#f97316"(橙/1), "#06b6d4"(青/2), "#22c55e"(绿/3)]`
- 测试覆盖率要求：核心映射表（RSTP_ORDERS ↔ 索引 ↔ 语义编号）的三向锁定测试
