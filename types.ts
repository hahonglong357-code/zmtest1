
export type Operator = '+' | '-' | '×' | '÷';

export interface Cell {
  id: string;
  value: number | Operator;
  type: 'number' | 'operator';
  isRemoving?: boolean;
}

export interface Position {
  col: number;
  row: number;
}

export interface TargetData {
  value: number;
  diff: number;
  core_base: number;
}

export interface GameState {
  grid: Cell[][];
  previewCells: Cell[];
  currentTarget: TargetData;
  nextTarget: TargetData;
  targetSequenceIndex: number; // 0 to 4
  score: number;
  selectedNum: Position | null;
  selectedOp: Position | null;
  combo: number;
  isGameOver: boolean;
}
