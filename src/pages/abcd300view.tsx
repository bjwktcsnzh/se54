import Abcd300 from "../components/Abcd300";

export default function Abcd300View() {
  return (
    <div>
      <h1 style={{ fontSize: 32, margin: "16px 0 8px" }}>全 300 种 2×2 博弈分类</h1>
      <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 560, marginBottom: 28, color: "var(--text)" }}>
        24 种 RSTP 收益顺序可配成 24×24 = 576 种行列组合。
        不计行列互换时唯一游戏数为 <strong>300</strong>（24 种对角同序游戏 + (24×23)/2 = 276 种非对角异序游戏）。
        热力图按 <strong>C→D→A→B</strong> 分组排列，点击任意格子查看详情。
      </p>

      <Abcd300 />
    </div>
  );
}
