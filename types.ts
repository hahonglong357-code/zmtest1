
export type Operator = '+' | '-' | '×' | '÷';

export type ItemType = 'number' | 'timer' | 'refresh' | 'score';

export interface StorageItem {
  id: string;
  type: ItemType;
  value?: number;
}

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
  core_base: number;
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
}
