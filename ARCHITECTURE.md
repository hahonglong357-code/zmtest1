# 核心模块详解

## 1. useGameCore Hook

**文件**: [hooks/useGameCore.ts](hooks/useGameCore.ts)

这是游戏的核心逻辑引擎，负责：
- 游戏状态管理 (`GameState`)
- 数字合成运算
- 目标生成与切换
- 分数计算（基础分 + 连击分 + 速度倍率）
- 难度等级管理

### 关键函数

```typescript
// 初始化/重置游戏
resetGame(): TargetData

// 开始教程
startTutorial(): void
nextTutorialStep(): void

// 执行合成运算
performSynthesis(numPos1, opPos, numPos2, timeLeft?, maxTime?)

// 处理格子点击
handleCellClick(col, row)

// 处理存储格点击
handleStorageNumberClick(index, timeLeft, maxTime)

// 刷新目标
refreshTarget(): void

// 使用道具
useStorageItem(index): void
```

---

## 2. useTimer Hook

**文件**: [hooks/useTimer.ts](hooks/useTimer.ts)

简单的倒计时管理：
- 支持暂停/恢复
- 支持时间增加/减少
- 自动处理时间上限（999秒）

```typescript
const timer = useTimer({
  isActive: boolean,        // 是否激活
  duration: number,          // 总时长
  initialTimeLeft?: number,  // 初始剩余时间
  resetKey?: number,         // 重置标识
  onTimeUp: () => void       // 时间到回调
});

timer.timeLeft    // 剩余时间（秒）
timer.progress    // 进度百分比
timer.addTime(n)  // 增加n秒
```

---

## 3. useGacha Hook

**文件**: [hooks/useGacha.ts](hooks/useGacha.ts)

抽卡系统管理：
- 随机生成道具或事件
- 难度相关的概率控制
- 首次发现记录

```typescript
const gacha = useGacha();

gacha.isOpen         // 抽卡弹窗是否打开
gacha.isDrawing      // 是否正在抽奖
gacha.drawResult     // 抽卡结果

gacha.setIsOpen(b)   // 打开/关闭弹窗
gacha.performDraw(callback, difficultyLevel)  // 执行抽卡
```

---

## 4. 组件层次结构

```
App
├── HomeScreen               # 首页
│   └── LeaderboardOverlay  # 排行榜浮层
│
└── GameBoard (游戏视图)
    ├── TargetCard          # 目标卡片（含时间条）
    ├── GameBoard           # 主棋盘
    │   ├── 数字格 (3x3)
    │   ├── 运算符格 (4)
    │   └── Toast           # 提示消息（居中显示）
    ├── StorageBar          # 道具存储
    ├── ScorePopupOverlay   # 分数动画
    ├── TutorialOverlay     # 教程引导
    │
    └── Modals (弹窗层)
        ├── GachaModal      # 抽卡弹窗
        ├── PauseModal      # 暂停弹窗
        ├── GameOverModal  # 结束弹窗
        ├── FeedbackModal  # 反馈弹窗
```

---

## 5. 状态管理流程

```
用户操作 (点击)
    ↓
App.tsx 接收事件
    ↓
调用对应 Hook 方法
    ↓
useGameCore 更新 GameState
    ↓
触发 UI 重渲染
    ↓
更新 localStorage (存档)
```

### 存档机制

游戏状态会自动保存到 `localStorage`:
- Key: `saved_game_state`
- 触发条件: 状态变化且游戏未结束

其他存档:
- `personal_high_score` - 个人最高分
- `last_username` - 上次用户名
- `game_lang` - 语言设置

---

## 6. 国际化 (i18n)

**文件**: [i18n.ts](i18n.ts)

支持两种语言: `'zh'` | `'en'`

在 App.tsx 中:
```typescript
const [language, setLanguage] = useState<Language>(() => {
  const saved = localStorage.getItem('game_lang');
  return (saved as Language) || 'zh';
});

const t = TRANSLATIONS[language];  // 获取当前语言翻译
```

---

## 7. 游戏配置详解

### GAME_PARAMS

```typescript
GACHA_THRESHOLD: 6,        // 使用6个数字触发抽卡
GACHA_TARGETS_THRESHOLD: 3,// 完成3个目标触发抽卡
STORAGE_SIZE: 4,           // 存储格数量
LEVEL_BASE_SCORES: [150, 300, 400, 600, 900, 1500], // 各等级基础分
LEVEL_BASE_TIMES: [3, 4, 5, 6, 7, 8],             // 各等级基础时间系数
COMBO_SCORE_BONUS: 20,                          // 连击加分
```

### 得分计算

```
最终得分 = 基础分 × 速度倍率 × 翻倍 + 连击奖励
- 基础分: 根据目标难度等级从 LEVEL_BASE_SCORES [150, 300, 500, 800, 1200, 2000] 中取值
- 速度倍率: >70%时间=1.5x, >40%=1.2x, 其他=1.0x
- 翻倍: 翻倍道具=2x
- 连击: combo × 20 (上限200)
```

---

## 8. 外部服务

### Supabase (排行榜)
- 文件: [services/supabaseClient.ts](services/supabaseClient.ts)
- 用于存储和获取全球排行榜数据

### 音效 (soundEffects)
- 文件: [services/soundEffects.ts](services/soundEffects.ts)
- 包含合成、成功、错误音效

### 用户分析 (userAnalytics)
- 文件: [services/userAnalytics.ts](services/userAnalytics.ts)
- 埋点统计

### 反馈服务 (feedbackService)
- 文件: [services/feedbackService.ts](services/feedbackService.ts)
- 调用 Gemini AI 处理用户反馈
