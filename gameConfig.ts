
import { TargetData, ItemType } from './types';

/**
 * ==========================================
 * TARGET CATALOG (The Level "Table")
 * ==========================================
 * diff: 0=Easy, 1=Normal, 2=Hard, 3=Expert, 4=Master
 * core_base: Base multiplier for score and time
 */
export const TARGET_CATALOG: TargetData[] = [
  // EASY (diff 0)
  { value: 24, diff: 0, core_base: 2 },
  { value: 26, diff: 0, core_base: 2 },
  { value: 48, diff: 0, core_base: 2 },
  { value: 60, diff: 0, core_base: 2 },
  { value: 72, diff: 0, core_base: 2 },
  { value: 12, diff: 0, core_base: 2 },
  { value: 20, diff: 0, core_base: 2 },
  
  // NORMAL (diff 1)
  { value: 25, diff: 1, core_base: 5 },
  { value: 49, diff: 1, core_base: 5 },
  { value: 64, diff: 1, core_base: 5 },
  { value: 81, diff: 1, core_base: 5 },
  { value: 11, diff: 1, core_base: 5 },
  { value: 29, diff: 1, core_base: 5 },
  { value: 23, diff: 1, core_base: 5 },
  { value: 17, diff: 1, core_base: 5 },
  { value: 27, diff: 1, core_base: 5 },
  
  // HARD (diff 2)
  { value: 47, diff: 2, core_base: 6 },
  { value: 53, diff: 2, core_base: 6 },
  { value: 91, diff: 2, core_base: 6 },
  { value: 58, diff: 2, core_base: 6 },
  { value: 62, diff: 2, core_base: 6 },
  
  // EXPERT (diff 3)
  { value: 61, diff: 3, core_base: 8 },
  { value: 71, diff: 3, core_base: 8 },
  { value: 79, diff: 3, core_base: 8 },
  { value: 94, diff: 3, core_base: 8 },
  { value: 98, diff: 3, core_base: 8 },
  
  // MASTER (diff 4)
  { value: 67, diff: 4, core_base: 10 },
  { value: 83, diff: 4, core_base: 10 },
  { value: 89, diff: 4, core_base: 10 },
  { value: 97, diff: 4, core_base: 10 }
];

/**
 * ==========================================
 * GAME BALANCE PARAMETERS
 * ==========================================
 */
export const GAME_PARAMS = {
  GACHA_THRESHOLD: 30,      // Progress needed to trigger a draw
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
  TIMER_ADD_SECONDS: 15,
  SCORE_PACK_POINTS: 500,
  DESCRIPTIONS: {
    number: "合成助手：存放在储物格中，可随时取用参与合成，帮你化解僵局。",
    timer: `时间增益：点击即用，瞬间为你的挑战延长 ${15} 秒倒计时。`,
    refresh: "棋盘刷新：当你觉得无计可施时，点击它来重置整个棋盘布局。",
    score: `幸运礼包：直接获得 ${500} 额外积分，让你的排名更进一步。`
  } as Record<ItemType, string>
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
} as Record<number, { label: string; color: string; bg: string; border: string }>;
