
import { TargetData, ItemType, Cell, Operator } from './types';

/**
 * ==========================================
 * TARGET CATALOG (Comprehensive 11-200)
 * ==========================================
 * diff: 0=Easy, 1=Normal, 2=Hard, 3=Expert, 4=Master, 5=Legend
 */
export const TARGET_CATALOG: TargetData[] = [
  // LEVEL 0: EASY (9 numbers) - Simple numbers <= 60
  { value: 12, diff: 0, core_base: 2 }, { value: 20, diff: 0, core_base: 2 },
  { value: 24, diff: 0, core_base: 2 }, { value: 30, diff: 0, core_base: 2 },
  { value: 36, diff: 0, core_base: 2 }, { value: 40, diff: 0, core_base: 2 },
  { value: 48, diff: 0, core_base: 2 }, { value: 50, diff: 0, core_base: 2 },
  { value: 60, diff: 0, core_base: 2 },

  // LEVEL 1: NORMAL (42 numbers) - Common composite numbers
  { value: 14, diff: 1, core_base: 4 }, { value: 15, diff: 1, core_base: 4 },
  { value: 16, diff: 1, core_base: 4 }, { value: 18, diff: 1, core_base: 4 },
  { value: 21, diff: 1, core_base: 4 }, { value: 22, diff: 1, core_base: 4 },
  { value: 25, diff: 1, core_base: 5 }, { value: 26, diff: 1, core_base: 5 },
  { value: 27, diff: 1, core_base: 5 }, { value: 28, diff: 1, core_base: 5 },
  { value: 32, diff: 1, core_base: 5 }, { value: 33, diff: 1, core_base: 5 },
  { value: 34, diff: 1, core_base: 5 }, { value: 35, diff: 1, core_base: 5 },
  { value: 38, diff: 1, core_base: 5 }, { value: 39, diff: 1, core_base: 5 },
  { value: 42, diff: 1, core_base: 5 }, { value: 44, diff: 1, core_base: 5 },
  { value: 45, diff: 1, core_base: 5 }, { value: 46, diff: 1, core_base: 5 },
  { value: 49, diff: 1, core_base: 5 }, { value: 52, diff: 1, core_base: 5 },
  { value: 54, diff: 1, core_base: 5 }, { value: 55, diff: 1, core_base: 5 },
  { value: 56, diff: 1, core_base: 5 }, { value: 63, diff: 1, core_base: 5 },
  { value: 64, diff: 1, core_base: 5 }, { value: 65, diff: 1, core_base: 5 },
  { value: 66, diff: 1, core_base: 5 }, { value: 70, diff: 1, core_base: 5 },
  { value: 75, diff: 1, core_base: 5 }, { value: 77, diff: 1, core_base: 5 },
  { value: 78, diff: 1, core_base: 5 }, { value: 81, diff: 1, core_base: 5 },
 

  // LEVEL 2: HARD (34 numbers) - Small primes and trickier numbers < 100
  { value: 23, diff: 2, core_base: 6 }, { value: 29, diff: 2, core_base: 6 },
  { value: 31, diff: 2, core_base: 6 }, { value: 37, diff: 2, core_base: 6 },
  { value: 41, diff: 2, core_base: 6 }, { value: 43, diff: 2, core_base: 6 },
  { value: 47, diff: 2, core_base: 6 }, { value: 51, diff: 2, core_base: 6 },
  { value: 53, diff: 2, core_base: 6 }, { value: 57, diff: 2, core_base: 6 },
  { value: 58, diff: 2, core_base: 6 }, { value: 59, diff: 2, core_base: 6 },
  { value: 61, diff: 2, core_base: 6 }, { value: 62, diff: 2, core_base: 6 },
  { value: 67, diff: 2, core_base: 6 }, { value: 68, diff: 2, core_base: 6 },
  { value: 69, diff: 2, core_base: 6 }, { value: 71, diff: 2, core_base: 6 },
  { value: 73, diff: 2, core_base: 6 }, { value: 74, diff: 2, core_base: 6 },
  { value: 76, diff: 2, core_base: 6 }, { value: 79, diff: 2, core_base: 6 },
  { value: 85, diff: 2, core_base: 6 }, { value: 88, diff: 2, core_base: 6 },
  { value: 86, diff: 2, core_base: 6 }, { value: 87, diff: 2, core_base: 6 },
  { value: 89, diff: 2, core_base: 6 }, { value: 93, diff: 2, core_base: 6 },
  { value: 94, diff: 2, core_base: 6 }, { value: 97, diff: 2, core_base: 6 },

  // LEVEL 3: EXPERT (42 numbers) - Composites 100-160
  { value: 102, diff: 3, core_base: 8 }, { value: 104, diff: 3, core_base: 8 },
  { value: 105, diff: 3, core_base: 8 }, { value: 106, diff: 3, core_base: 8 },
  { value: 108, diff: 3, core_base: 8 }, { value: 110, diff: 3, core_base: 8 },
  { value: 111, diff: 3, core_base: 8 }, { value: 112, diff: 3, core_base: 8 },
  { value: 114, diff: 3, core_base: 8 }, { value: 115, diff: 3, core_base: 8 },
  { value: 116, diff: 3, core_base: 8 }, { value: 117, diff: 3, core_base: 8 },
  { value: 118, diff: 3, core_base: 8 }, { value: 119, diff: 3, core_base: 8 },
  { value: 121, diff: 3, core_base: 8 }, { value: 122, diff: 3, core_base: 8 },
  { value: 123, diff: 3, core_base: 8 }, { value: 124, diff: 3, core_base: 8 },
  { value: 125, diff: 3, core_base: 8 }, { value: 126, diff: 3, core_base: 8 },
  { value: 128, diff: 3, core_base: 8 }, { value: 129, diff: 3, core_base: 8 },
  { value: 130, diff: 3, core_base: 8 }, { value: 132, diff: 3, core_base: 8 },
  { value: 133, diff: 3, core_base: 8 }, { value: 134, diff: 3, core_base: 8 },
  { value: 135, diff: 3, core_base: 8 }, { value: 136, diff: 3, core_base: 8 },
  { value: 138, diff: 3, core_base: 8 }, { value: 141, diff: 3, core_base: 8 },
  { value: 142, diff: 3, core_base: 8 }, { value: 143, diff: 3, core_base: 8 },
  { value: 145, diff: 3, core_base: 8 }, { value: 146, diff: 3, core_base: 8 },
  { value: 147, diff: 3, core_base: 8 }, { value: 148, diff: 3, core_base: 8 },
  { value: 152, diff: 3, core_base: 8 }, { value: 153, diff: 3, core_base: 8 },
  { value: 154, diff: 3, core_base: 8 }, { value: 155, diff: 3, core_base: 8 },
  { value: 156, diff: 3, core_base: 8 }, { value: 158, diff: 3, core_base: 8 },

   // LEVEL 4: MASTER (28 numbers) - Primes and complex composites 100-180
  { value: 101, diff: 4, core_base: 10 }, { value: 103, diff: 4, core_base: 10 },
  { value: 107, diff: 4, core_base: 10 }, { value: 109, diff: 4, core_base: 10 },
  { value: 113, diff: 4, core_base: 10 }, { value: 127, diff: 4, core_base: 10 },
  { value: 131, diff: 4, core_base: 10 }, { value: 137, diff: 4, core_base: 10 },
  { value: 139, diff: 4, core_base: 10 }, { value: 149, diff: 4, core_base: 10 },
  { value: 151, diff: 4, core_base: 10 }, { value: 157, diff: 4, core_base: 10 },
  { value: 159, diff: 4, core_base: 10 }, { value: 161, diff: 4, core_base: 10 },
  { value: 162, diff: 4, core_base: 10 }, { value: 164, diff: 4, core_base: 10 },
  { value: 165, diff: 4, core_base: 10 }, { value: 166, diff: 4, core_base: 10 },
  { value: 168, diff: 4, core_base: 10 }, { value: 170, diff: 4, core_base: 10 },
  { value: 171, diff: 4, core_base: 10 }, { value: 172, diff: 4, core_base: 10 },
  { value: 174, diff: 4, core_base: 10 }, { value: 175, diff: 4, core_base: 10 },
  { value: 176, diff: 4, core_base: 10 }, { value: 177, diff: 4, core_base: 10 },
  { value: 178, diff: 4, core_base: 10 },

  // LEVEL 5: LEGEND (30 numbers) - Primes and very large numbers nearing 200
  { value: 163, diff: 5, core_base: 12 }, { value: 167, diff: 5, core_base: 12 },
  { value: 169, diff: 5, core_base: 12 }, { value: 173, diff: 5, core_base: 12 },
  { value: 179, diff: 5, core_base: 12 }, { value: 181, diff: 5, core_base: 12 },
  { value: 182, diff: 5, core_base: 12 }, { value: 183, diff: 5, core_base: 12 },
  { value: 184, diff: 5, core_base: 12 }, { value: 185, diff: 5, core_base: 12 },
  { value: 186, diff: 5, core_base: 12 }, { value: 187, diff: 5, core_base: 12 },
  { value: 188, diff: 5, core_base: 12 }, { value: 189, diff: 5, core_base: 12 },
  { value: 190, diff: 5, core_base: 12 }, { value: 191, diff: 5, core_base: 12 },
  { value: 192, diff: 5, core_base: 12 }, { value: 193, diff: 5, core_base: 12 },
  { value: 194, diff: 5, core_base: 12 }, { value: 195, diff: 5, core_base: 12 },
  { value: 196, diff: 5, core_base: 12 }, { value: 197, diff: 5, core_base: 12 },
  { value: 198, diff: 5, core_base: 12 }, { value: 199, diff: 5, core_base: 12 }
];

/**
 * ==========================================
 * GAME BALANCE PARAMETERS
 * ==========================================
 */
export const GAME_PARAMS = {
  GACHA_THRESHOLD: 6,       // Numbers used to trigger a gacha draw
  GACHA_TARGETS_THRESHOLD: 3, // Targets cleared to trigger a gacha draw
  TIMER_MULTIPLIER: 18,     // Seconds per core_base unit (e.g., 2 * 18 = 36s)
  STORAGE_SIZE: 4,          // Number of item slots
  COMBO_SCORE_BONUS: 20,    // Points per combo
  BASE_SCORE_MULTIPLIER: 50 // Points per core_base unit
};

/**
 * ==========================================
 * ITEM CONFIGURATION & DESCRIPTIONS
 * ==========================================
 */
export const ITEM_CONFIG = {
  TIMER_ADD_SECONDS: 30,
  SCORE_PACK_POINTS: 500,
  DESCRIPTIONS: {
    number: "数字工具：存放在储物格中，可随时取用参与合成，帮你化解僵局。",
    timer: `加时工具：点击即用，瞬间为你的挑战延长 ${30} 秒倒计时。`,
    refresh: "刷新令牌：当你觉得无计可施时，点击它来重置整个棋盘布局。",
    score: `500金币：直接获得 ${500} 额外积分，让你的排名更进一步。`
  } as Record<ItemType, string>,
  NAMES: {
    number: "数字工具",
    timer: "加时工具",
    refresh: "刷新令牌",
    score: "500金币"
  } as Record<ItemType, string>
};

/**
 * ==========================================
 * GACHA NARRATIVE CONFIG - 抽卡叙事配置
 * ==========================================
 */
export const GACHA_NARRATIVES = {
  // 获得道具时的预设文案
  ITEM_INTROS: [
    "你和数字士兵搏斗，它掉落了",
    "在路上看到一个袋子，戳了戳，露出来一个",
    "在路上钓了会鱼，钓上来一个",
    "你觉得太难，朝天上骂了几句，天上掉下来一个",
    "你觉得太难，向天上拜了拜，天上掉下来一个",
    "路上碰到熟人了，他有不少宝贝，给了你一个",
    "路上碰到制作者了，打了他一顿，他口袋里有个",
    "数字士兵向你求饶，并给你"
  ] as string[],
  // 道具名称映射（用于文案组合）
  ITEM_NAMES: {
    number: "数字工具",
    timer: "加时工具",
    refresh: "刷新令牌",
    score: "500金币"
  } as Record<ItemType, string>
};

/**
 * ==========================================
 * GACHA EVENTS CONFIG - 抽卡事件配置
 * ==========================================
 */
export type GachaEventConfig = {
  id: string;
  text: string;
  icon: string;
  iconColor: string;
};

export const GACHA_EVENTS: GachaEventConfig[] = [
  {
    id: 'time_half',
    text: "你沉浸在上一次胜利中，这次迟到了，接下来的两回合时间减半",
    icon: 'fa-clock',
    iconColor: 'text-amber-500'
  },
  {
    id: 'items_lost',
    text: "你来的路上摔了一跤，道具掉了你也不知道",
    icon: 'fa-tshirt',
    iconColor: 'text-rose-500'
  },
  {
    id: 'dog_attack',
    text: "来的路上碰到了数字猎狗，你不得不丢出一个数字保全自己",
    icon: 'fa-dog',
    iconColor: 'text-orange-500'
  }
];

/**
 * ==========================================
 * GACHA POOLS - 抽卡奖池配置
 * ==========================================
 */
// 概率分布：number 35%, refresh 35%, timer 15%, score 15%
export const GACHA_ITEM_POOL: ItemType[] = [
  ...Array(35).fill('number'),
  ...Array(30).fill('refresh'),
  ...Array(15).fill('timer'),
  ...Array(20).fill('score'),
];

/**
 * ==========================================
 * GACHA CONFIG - 抽卡概率配置
 * ==========================================
 */
export const GACHA_CONFIG = {
  /** 获得道具的概率 (0.5 = 50% 道具, 50% 事件) */
  ITEM_CHANCE: 0.8
};

/**
 * ==========================================
 * UI DISPLAY NAMES
 * ==========================================
 */
export const DIFF_UI = {
  0: { label: 'EASY', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  1: { label: 'NORMAL', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  2: { label: 'HARD', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
  3: { label: 'EXPERT', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
  4: { label: 'MASTER', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  5: { label: 'LEGEND', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
} as Record<number, { label: string; color: string; bg: string; border: string }>;

/**
 * ==========================================
 * GRID CONSTANTS
 * ==========================================
 */
export const NUM_HEIGHT = 3;
export const OP_HEIGHT = 4;
export const OPERATORS: Operator[] = ['+', '-', '×', '÷'];

/**
 * ==========================================
 * UTILITY FUNCTIONS
 * ==========================================
 */
export const generateRandomId = () => Math.random().toString(36).substr(2, 9);

export const createCell = (type: 'number' | 'operator', value?: number | Operator): Cell => ({
  id: generateRandomId(),
  value: value !== undefined ? value : (type === 'number' ? Math.floor(Math.random() * 9) + 1 : OPERATORS[Math.floor(Math.random() * OPERATORS.length)]),
  type
});

/**
 * ==========================================
 * DIFFICULTY GROUPS - 按难度分组的数字集合
 * ==========================================
 */
export const DIFF_GROUPS = {
  // 难度0-1：简单到普通
  EASY_NORMAL: [0, 1] as const,
  // 难度0：非常简单
  EASY: [0] as const,
  // 难度1：普通
  NORMAL: [1] as const,
  // 难度2：困难
  HARD: [2] as const,
  // 难度3：专家
  EXPERT: [3] as const,
  // 难度4：大师
  MASTER: [4] as const,
  // 难度5：传奇
  LEGEND: [5] as const,
} as const;

export type DiffGroupKey = keyof typeof DIFF_GROUPS;

/**
 * ==========================================
 * TARGET POOL - 按难度分组的数字池
 * ==========================================
 */
// 预计算各难度的数字池
const TARGETS_BY_DIFF: Record<number, TargetData[]> = {};
for (const target of TARGET_CATALOG) {
  if (!TARGETS_BY_DIFF[target.diff]) {
    TARGETS_BY_DIFF[target.diff] = [];
  }
  TARGETS_BY_DIFF[target.diff].push(target);
}

// 便捷获取函数：从指定难度组中随机获取
const getRandomFromDiffs = (diffs: readonly number[]): TargetData => {
  const pool = diffs.flatMap(d => TARGETS_BY_DIFF[d] || []);
  return pool[Math.floor(Math.random() * pool.length)];
};

// 导出：获取难度为0的目标数字（用于刷新令牌）
export const getRandomEasyTarget = (): TargetData => {
  return getRandomFromDiffs([0]);
};

// 预计算常用组合池
const WARMUP_POOL = TARGET_CATALOG.filter(t => t.value < 40 && t.diff <= 1);

/**
 * ==========================================
 * TARGET SEQUENCE CONFIG - 目标序列配置
 * ==========================================
 * 定义每种序列类型的生成规则
 */
export interface TargetSequenceStep {
  /** 从哪个难度组取数 */
  diffGroup: DiffGroupKey;
  /** 说明（仅用于文档） */
  description?: string;
}

export interface TargetSequenceConfig {
  /** 序列名称 */
  name: string;
  /** 序列长度（每轮多少个目标） */
  length: number;
  /** 每步的取数规则 */
  steps: TargetSequenceStep[];
}

/**
 * ==========================================
 * SEQUENCE PATTERNS - 序列模式定义
 * ==========================================
 */
export const SEQUENCE_PATTERNS = {
  /** 正常序列（中等难度） */
  NORMAL: {
    name: 'Normal',
    length: 6,
    steps: [
      { diffGroup: 'EASY_NORMAL', description: '前两个从难度0-1中随机取' },
      { diffGroup: 'EASY_NORMAL', description: '前两个从难度0-1中随机取' },
      { diffGroup: 'HARD', description: '第三个从难度2中取' },
      { diffGroup: 'EASY_NORMAL', description: '第四个从难度0-1中取' },
      { diffGroup: 'HARD', description: '第五个从难度2中取' },
      { diffGroup: 'EXPERT', description: '第六个从难度3中取' },
    ]
  } as TargetSequenceConfig,

  /** 困难序列（高难度） */
  HARD: {
    name: 'Hard',
    length: 6,
    steps: [
      { diffGroup: 'EASY_NORMAL', description: '前两个从难度0-1中取' },
      { diffGroup: 'EASY_NORMAL', description: '前两个从难度0-1中取' },
      { diffGroup: 'MASTER', description: '第三个从难度4中取' },
      { diffGroup: 'LEGEND', description: '第四个从难度5中取' },
      { diffGroup: 'EASY_NORMAL', description: '第五、六个从难度0-1中随机取' },
      { diffGroup: 'EASY_NORMAL', description: '第五、六个从难度0-1中随机取' },
    ]
  } as TargetSequenceConfig,
} as const;

export type SequencePatternKey = keyof typeof SEQUENCE_PATTERNS;

/**
 * ==========================================
 * SCORE THRESHOLDS - 分数阈值配置
 * ==========================================
 */
export const SCORE_THRESHOLDS = {
  /** 困难序列解锁分数 */
  HARD_UNLOCK: 5000,
  /** 专家序列解锁分数 */
  EXPERT_UNLOCK: 15000,
} as const;

/**
 * ==========================================
 * MAIN SEQUENCE ORDER - 主序列循环顺序
 * ==========================================
 * 根据分数动态决定序列顺序
 */
export const getSequenceOrder = (currentScore: number): SequencePatternKey[] => {
  if (currentScore < SCORE_THRESHOLDS.HARD_UNLOCK) {
    // 低于5000分：仅NORMAL
    return ['NORMAL'];
  } else if (currentScore < SCORE_THRESHOLDS.EXPERT_UNLOCK) {
    // 5000-15000分：N,N,H
    return ['NORMAL', 'NORMAL', 'HARD'];
  } else {
    // 15000分以上：N,H
    return ['NORMAL', 'HARD'];
  }
};

/**
 * ==========================================
 * TARGET GENERATOR - 目标数字生成器
 * ==========================================
 */
class TargetGenerator {
  private currentSequenceOrder: SequencePatternKey[] = ['NORMAL'];
  private sequenceIndex: number = 0;

  /** 设置当前分数，决定使用的序列（每个序列完成后调用） */
  setScore(score: number): void {
    const newOrder = getSequenceOrder(score);
    // 只有当序列配置发生变化时才更新
    if (JSON.stringify(newOrder) !== JSON.stringify(this.currentSequenceOrder)) {
      this.currentSequenceOrder = newOrder;
      this.sequenceIndex = 0; // 重置到新序列的开头
    }
  }

  /** 获取随机目标 */
  getTarget(absoluteIndex: number): TargetData {
    // 前3个目标使用热身池
    if (absoluteIndex < 3) {
      return WARMUP_POOL[Math.floor(Math.random() * WARMUP_POOL.length)];
    }

    // 计算在主序列中的位置
    const mainIndex = absoluteIndex - 3;
    const mainSequenceLength = this.currentSequenceOrder.reduce((sum, key) => sum + SEQUENCE_PATTERNS[key].length, 0);
    const cyclePosition = mainIndex % mainSequenceLength;

    // 确定当前在哪个序列中
    let remaining = cyclePosition;
    let currentSequenceKey: SequencePatternKey = 'NORMAL';

    for (const seqKey of this.currentSequenceOrder) {
      const seqLength = SEQUENCE_PATTERNS[seqKey].length;
      if (remaining < seqLength) {
        currentSequenceKey = seqKey;
        break;
      }
      remaining -= seqLength;
    }

    // 获取当前序列的配置和位置
    const sequenceConfig = SEQUENCE_PATTERNS[currentSequenceKey];
    const currentSeqLength = sequenceConfig.length;
    const stepIndex = remaining % sequenceConfig.length;
    const diffGroup = sequenceConfig.steps[stepIndex].diffGroup;

    // 检查是否完成了一个序列，如果是则更新序列配置
    const nextRemaining = remaining + 1;
    if (nextRemaining >= currentSeqLength) {
      // 序列完成，准备切换
      this.sequenceIndex = (this.sequenceIndex + 1) % this.currentSequenceOrder.length;
    }

    // 从对应难度组获取随机目标
    return getRandomFromDiffs(DIFF_GROUPS[diffGroup]);
  }
}

// 导出单例生成器
export const targetGenerator = new TargetGenerator();

// 兼容旧接口的函数
export const getTargetForAbsoluteIndex = (index: number, _totalDraws: number): TargetData => {
  return targetGenerator.getTarget(index);
};

/** 设置当前分数，用于决定序列难度 */
export const setTargetScore = (score: number): void => {
  targetGenerator.setScore(score);
};
