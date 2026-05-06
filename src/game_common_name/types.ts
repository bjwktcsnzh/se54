export interface GameCommonInfo {
  /** 简短名称（热力图单元格中显示） */
  name: string;
  /** 详细描述（详情页展示） */
  desc: string;
  /** 行玩家角色名（仅非对称博弈） */
  rowPlayerName?: string;
  /** 列玩家角色名（仅非对称博弈） */
  colPlayerName?: string;
}
