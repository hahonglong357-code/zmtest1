# Beyond 24 (24点：放飞版) 项目知识文档

## 项目概述

**Beyond 24** 是一款融合数学运算与肉鸽（Roguelike）元素的数字合成挑战游戏。玩家需要在限定时间内，利用棋盘上的数字通过加、减、乘、除运算合成目标数字。

### 核心玩法
- **目标合成**: 使用棋盘上的数字和运算符，计算出目标数字
- **时间挑战**: 在倒计时结束前达成目标
- **道具系统**: 通过抽卡获得各种道具
- **动态难度**: 系统会根据你的持仓道具数量实时调节压力
- **调试中心**: 内置 Debug 窗口实时监控难度系数
- **全球排行榜**: 与全世界的玩家一较高下

### 技术栈
- React 19 + TypeScript
- Vite 6 (构建工具)
- Framer Motion (动画)
- Supabase (排行榜后端)
- Google Gemini AI (反馈服务)

---

## 目录结构

```
zmtest/
├── App.tsx                    # 主应用入口，状态管理和组件协调
├── types.ts                   # TypeScript 类型定义
├── gameConfig.ts              # 游戏配置（目标、难度、道具等）
├── featureFlags.ts            # 功能开关配置
├── i18n.ts                    # 国际化（中英文）
│
├── components/                # UI 组件
│   ├── HomeScreen.tsx         # 首页
│   ├── GameBoard.tsx          # 游戏棋盘（数字+运算符）
│   ├── TargetCard.tsx         # 目标卡片
│   ├── StorageBar.tsx         # 道具存储栏
│   ├── GachaModal.tsx         # 抽卡弹窗
│   ├── PauseModal.tsx         # 暂停弹窗
│   ├── GameOverModal.tsx      # 游戏结束弹窗
│   ├── LeaderboardOverlay.tsx # 排行榜浮层
│   ├── TutorialOverlay.tsx    # 教程浮层
│   ├── FeedbackModal.tsx      # 反馈弹窗
│   ├── Toast.tsx              # 提示消息
│   └── ScorePopupOverlay.tsx  # 分数弹出动画
│
├── hooks/                     # React 自定义 Hooks
│   ├── useGameCore.ts         # 核心游戏逻辑（状态、操作）
│   ├── useTimer.ts            # 计时器逻辑
│   ├── useGacha.ts            # 抽卡逻辑
│   └── useLeaderboard.ts      # 排行榜逻辑
│
└── services/                  # 外部服务
    ├── supabaseClient.ts      # Supabase 客户端
    ├── soundEffects.ts         # 音效服务
    ├── feedbackService.ts      # 反馈服务 (Gemini AI)
    ├── userAnalytics.ts       # 用户分析
    └── geminiService.ts       # Gemini API
```

---

## 核心概念

### 游戏状态 (GameState)

详见 [types.ts](types.ts) 中的 `GameState` 接口：

```typescript
interface GameState {
  grid: Cell[][];           // 3行棋盘：数字行、运算符行、数字行
  previewCells: Cell[];    // 预览数字
  currentTarget: TargetData; // 当前目标
  nextTarget: TargetData;    // 下一个目标
  totalTargetsCleared: number;
  score: number;
  selectedNum: Position | null;   // 选中的数字位置
  selectedOp: Position | null;    // 选中的运算符位置
  combo: number;             // 连击数
  isGameOver: boolean;
  isPaused: boolean;
  storage: (StorageItem | null)[];  // 道具存储（4格）
  tutorialStep: number | null;
  // ... 其他状态
}
```

### 棋盘结构

棋盘为 3行 × 3列 的结构：
- 第0行: 数字 (NUM_HEIGHT = 3)
- 第1行: 运算符 (+, -, ×, ÷)
- 第2行: 数字

### 运算规则

| 运算符 | 规则 |
|--------|------|
| + | 加法 |
| - | 减法（不能为负数）|
| × | 乘法 |
| ÷ | 除法（必须整除）|

---

## 难度系统

### 6个难度等级

| 等级 | 名称 | 分值范围 | 目标数字范围 |
|------|------|----------|--------------|
| 0 | EASY | 0-19999 | 12-60 |
| 1 | NORMAL | 20000-39999 | 14-81 |
| 2 | HARD | 40000-59999 | 23-97 |
| 3 | EXPERT | 60000-79999 | 102-158 |
| 4 | MASTER | 80000-99999 | 101-178 |
| 5 | LEGEND | 100000+ | 163-199 |

> **注意**: 已移除固定难度提升的弹窗干扰，改为后台平滑递进。

### 动态难度

详见 [gameConfig.ts](gameConfig.ts) 中的 `DYNAMIC_DIFFICULTY_CONFIG` 和 `GAME_PARAMS.TIMER_MULTIPLIER`：

- **时间倍率**: 从 17x 缩减到 13x（配置于 `GAME_PARAMS.TIMER_MULTIPLIER`）
- **抽卡概率**: 从 80% 降到 40% (配置于 `DYNAMIC_DIFFICULTY_CONFIG`)
- **判定逻辑**: 每 3,000 分检查一次。若持有道具 ≥3，大概率升难度；若道具 ≤1，大概率降难度。

---

## 道具系统

### 道具类型

| 类型 | 说明 |
|------|------|
| `number` | 数字工具：存放备用数字 |
| `timer` | 加时工具：+30秒 |
| `refresh` | 刷新令牌：重置棋盘 |
| `score` | 金币：+500分 |

### 抽卡机制

- 每完成 3 个目标触发一次抽卡
- 概率获得道具或触发事件
- 事件包括：时间减半、道具丢失、猎狗攻击、分数翻倍

---

## 功能开关

详见 [featureFlags.ts](featureFlags.ts)：

```typescript
const FEATURES = {
  GACHA: true,       // 抽卡系统
  TUTORIAL: true,    // 新手教程
  LEADERBOARD: true, // 在线排行榜
  TIMER: true,       // 计时器
  STORAGE: true,     // 储物格系统
  COMBO: true,       // 连击加分
};
```

---

## 快速参考

### 修改目标数字范围
编辑 [gameConfig.ts:10](gameConfig.ts#L10) 中的 `TARGET_CATALOG` 数组

### 修改时间限制
编辑 [gameConfig.ts:184](gameConfig.ts#L184) 中的 `DYNAMIC_DIFFICULTY_CONFIG`

### 修改道具效果
编辑 [gameConfig.ts:243](gameConfig.ts#L243) 中的 `ITEM_CONFIG`

### 添加新语言
编辑 [i18n.ts](i18n.ts) 中的 `TRANSLATIONS` 对象

### 关闭/开启功能
编辑 [featureFlags.ts](featureFlags.ts) 中的 `FEATURES` 对象
