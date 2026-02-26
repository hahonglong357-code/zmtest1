# 快速修改指南

此文档帮助你快速定位需要修改的代码位置。

---

## 🎮 游戏数值调整

### 修改目标数字
- **文件**: [gameConfig.ts:10](gameConfig.ts#L10)
- **内容**: `TARGET_CATALOG` 数组
- **格式**: `{ value: 数字, diff: 难度等级(0-5) }`

### 修改时间限制
- **文件**: [gameConfig.ts:184](gameConfig.ts#L184)
- **参数**:
  - `LEVEL_BASE_TIMES`: 各等级基础时间数组 (秒)
  - `TIMER_MULTIPLIER`: 动态倍率配置 (BASE: 初始, DECREASE: 步进, MIN: 下限)

### 修改得分公式
- **文件**: [gameConfig.ts:114](gameConfig.ts#L114)
- **参数**:
  - `LEVEL_BASE_SCORES`: 各等级基础分数组 (EASY, NORMAL, HARD, EXPERT, MASTER, LEGEND)
  - `SCORE_REWARDS.COMBO_BONUS`: 连击奖励
  - `SCORE_REWARDS.MAX_COMBO_BONUS`: 连击奖励上限 (已调升至 200)
  - `SCORE_REWARDS.SPEED_MULTIPLIERS`: Speed multiplier config

### 修改难度阈值
- **文件**: [gameConfig.ts:184](gameConfig.ts#L184)
- `START_SCORE`: 开始增加难度的分数 (默认20000)
- `CHECK_INTERVAL`: 难度检查间隔 (默认5000)

---

## 🎁 道具系统

### 修改道具效果
- **文件**: [gameConfig.ts:243](gameConfig.ts#L243)
- `ITEM_CONFIG.TIMER_ADD_SECONDS`: 加时秒数 (默认30)
- `ITEM_CONFIG.SCORE_PACK_POINTS`: 金币分数 (默认500)

### 修改抽卡概率
- **文件**: [gameConfig.ts:184](gameConfig.ts#L184)
- `BASE_ITEM_CHANCE`: 基础抽卡概率 (默认0.8)
- `MIN_ITEM_CHANCE`: 最低概率 (默认0.4)

### 修改抽卡阈值
- **文件**: [gameConfig.ts:114](gameConfig.ts#L114)
- `GACHA_TARGETS_THRESHOLD`: 每完成N个目标触发抽卡 (默认3)

### 添加新道具
1. 在 [types.ts:4](types.ts#L4) 添加 `ItemType`
2. 在 [gameConfig.ts:331](gameConfig.ts#L331) 添加到 `GACHA_ITEM_POOL`
3. 在 [gameConfig.ts:252](gameConfig.ts#L252) 添加名称
4. 在 [gameConfig.ts:246](gameConfig.ts#L246) 添加描述

### 修改抽卡文案
- **文件**: [gameConfig.ts:265](gameConfig.ts#L265)
- `GACHA_NARRATIVES.ITEM_INTROS`: 获得道具的文案

### 修改随机事件
- **文件**: [gameConfig.ts:298](gameConfig.ts#L298)
- `GACHA_EVENTS` 数组

---

## 🌍 界面与文本

### 修改界面文本
- **文件**: [i18n.ts](i18n.ts)
- 格式: `TRANSLATIONS.zh` / `TRANSLATIONS.en`
- **注意**: 目前报错提示（Toast）已移至 [components/GameBoard.tsx](components/GameBoard.tsx) 中心，由 `game.message` 驱动。

### 修改首页
- **文件**: [components/HomeScreen.tsx](components/HomeScreen.tsx)

### 修改游戏结束弹窗
- **文件**: [components/GameOverModal.tsx](components/GameOverModal.tsx)

### 修改教程内容
- **文件**: [i18n.ts:56](i18n.ts#L56)
- `tutorial_steps` 数组

---

## ⚙️ 功能开关

### 开启/关闭功能
- **文件**: [featureFlags.ts](featureFlags.ts)
- 设置对应项为 `true` 或 `false`

| 功能 | 变量 |
|------|------|
| 抽卡系统 | `FEATURES.GACHA` |
| 新手教程 | `FEATURES.TUTORIAL` |
| 排行榜 | `FEATURES.LEADERBOARD` |
| 计时器 | `FEATURES.TIMER` |
| 储物格 | `FEATURES.STORAGE` |
| 连击加分 | `FEATURES.COMBO` |

---

## 🔊 音效

### 修改音效
- **文件**: [services/soundEffects.ts](services/soundEffects.ts)
- 使用 `playFusionSound()`, `playSuccessSound()`, `playErrorSound()`

---

## 📱 排行榜

### 配置 Supabase
- **文件**: [services/supabaseClient.ts](services/supabaseClient.ts)
- 需要设置 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`

---

## 🐛 常见问题定位

### 游戏逻辑问题
→ 查看 [hooks/useGameCore.ts](hooks/useGameCore.ts)

### 计时器问题
→ 查看 [hooks/useTimer.ts](hooks/useTimer.ts)

### 抽卡问题
→ 查看 [hooks/useGacha.ts](hooks/useGacha.ts)

### UI 不刷新
→ 检查 `gameState` 是否正确更新

### 本地存储问题
→ 查看 [App.tsx:134](App.tsx#L134) 的 `useEffect`
