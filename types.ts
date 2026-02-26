
export type Operator = '+' | '-' | '×' | '÷';

export type ItemType = 'number' | 'timer' | 'refresh' | 'score';

export interface StorageItem {
  id: string;
  type: ItemType;
  value?: number;
}

// 抽卡结果类型
export type GachaResultType = 'item' | 'event';

// 抽卡道具结果
export interface GachaItemResult {
  type: GachaResultType;
  resultType: 'item';
  item: StorageItem;
  narrativeText: string;
  itemName: string;
}

// 抽卡事件结果
export type GachaEventId = 'time_half' | 'items_lost' | 'dog_attack' | 'score_double';

export interface GachaEventResult {
  type: GachaResultType;
  resultType: 'event';
  eventId: GachaEventId;
  eventText: string;
}

// 联合类型
export type GachaResult = GachaItemResult | GachaEventResult;

export interface Cell {
  id: string;
  value: number | Operator;
  type: 'number' | 'operator';
  isRemoving?: boolean;
}

export interface Position {
  col: number;
  row: number;
  source: 'grid' | 'storage';
  storageIndex?: number;
}

export interface TargetData {
  value: number;
  diff: number;
}

export interface LevelStartState {
  grid: Cell[][];
  storage: (StorageItem | null)[];
  numbersUsed: number;
}

export interface GameState {
  grid: Cell[][];
  previewCells: Cell[];
  currentTarget: TargetData;
  nextTarget: TargetData;
  totalTargetsCleared: number;
  score: number;
  selectedNum: Position | null;
  selectedOp: Position | null;
  combo: number;
  isGameOver: boolean;
  isPaused: boolean;
  numbersUsed: number;
  totalDraws: number;
  storage: (StorageItem | null)[];
  levelStartState: LevelStartState | null;
  tutorialStep: number | null; // null means tutorial finished or not started
  lastGachaThreshold: number;
  timePenaltyCount: number; // 剩余时间惩罚次数（事件效果计数）
  doubleScoreCount: number; // 积分翻倍次数
  dogAttackCount: number; // 猎狗攻击：下回合丢失一个数字
  timeLeft: number; // 剩余时间
}
