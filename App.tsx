
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cell, Operator, Position, GameState, TargetData } from './types';
import { supabase } from './services/supabaseClient';

const NUM_HEIGHT = 3;
const OP_HEIGHT = 4;
const OPERATORS: Operator[] = ['+', '-', '×', '÷'];

// CSV Data converted to Lookup Table
const TARGET_CATALOG: TargetData[] = [
  { value: 24, diff: 0, core_base: 2 }, { value: 26, diff: 0, core_base: 2 }, { value: 48, diff: 0, core_base: 2 },
  { value: 60, diff: 0, core_base: 2 }, { value: 72, diff: 0, core_base: 2 }, { value: 12, diff: 0, core_base: 2 },
  { value: 20, diff: 0, core_base: 2 }, { value: 25, diff: 1, core_base: 5 }, { value: 49, diff: 1, core_base: 5 },
  { value: 64, diff: 1, core_base: 5 }, { value: 81, diff: 1, core_base: 5 }, { value: 11, diff: 1, core_base: 5 },
  { value: 29, diff: 1, core_base: 5 }, { value: 23, diff: 1, core_base: 5 }, { value: 17, diff: 1, core_base: 5 },
  { value: 27, diff: 1, core_base: 5 }, { value: 47, diff: 2, core_base: 6 }, { value: 53, diff: 2, core_base: 6 },
  { value: 91, diff: 2, core_base: 6 }, { value: 58, diff: 2, core_base: 6 }, { value: 62, diff: 2, core_base: 6 },
  { value: 61, diff: 3, core_base: 8 }, { value: 71, diff: 3, core_base: 8 }, { value: 79, diff: 3, core_base: 8 },
  { value: 94, diff: 3, core_base: 8 }, { value: 98, diff: 3, core_base: 8 }, { value: 67, diff: 4, core_base: 10 },
  { value: 83, diff: 4, core_base: 10 }, { value: 89, diff: 4, core_base: 10 }, { value: 97, diff: 4, core_base: 10 }
];

const GROUP_LOW = TARGET_CATALOG.filter(t => t.diff <= 2);
const GROUP_MED = TARGET_CATALOG.filter(t => t.diff === 3);
const GROUP_HIGH = TARGET_CATALOG.filter(t => t.diff === 4);

const getNextTargetFromSequence = (index: number): TargetData => {
  if (index < 3) {
    return GROUP_LOW[Math.floor(Math.random() * GROUP_LOW.length)];
  } else if (index === 3) {
    return GROUP_MED[Math.floor(Math.random() * GROUP_MED.length)];
  } else {
    return GROUP_HIGH[Math.floor(Math.random() * GROUP_HIGH.length)];
  }
};

const getDiffInfo = (diff: number) => {
  if (diff === 3) return { label: 'HARD', color: 'text-orange-500', bg: 'bg-orange-100/50', border: 'border-orange-200' };
  if (diff === 4) return { label: 'EXPERT', color: 'text-rose-500', bg: 'bg-rose-100/50', border: 'border-rose-200' };
  return null;
};

const generateRandomId = () => Math.random().toString(36).substr(2, 9);

const createCell = (type: 'number' | 'operator'): Cell => {
  if (type === 'number') {
    return {
      id: generateRandomId(),
      value: Math.floor(Math.random() * 9) + 1,
      type: 'number'
    };
  } else {
    return {
      id: generateRandomId(),
      value: OPERATORS[Math.floor(Math.random() * OPERATORS.length)],
      type: 'operator'
    };
  }
};

const generatePreviewRow = (): Cell[] => [
  createCell('number'),
  createCell('number'),
  createCell('number')
];

const generateInitialGrid = (): Cell[][] => {
  const grid: Cell[][] = [];
  grid[0] = Array.from({ length: NUM_HEIGHT }, () => createCell('number'));
  grid[1] = OPERATORS.map(op => ({ id: `fixed-${op}`, value: op, type: 'operator' }));
  grid[2] = Array.from({ length: NUM_HEIGHT }, () => createCell('number'));
  return grid;
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [username, setUsername] = useState('');

  useEffect(() => {
    resetGame();
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('high_scores')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);
      if (!error && data) setLeaderboard(data);
    } catch (e) {
      console.error("Leaderboard fetch failed", e);
    }
  };

  const saveScore = async () => {
    if (!gameState || !username.trim()) return;
    try {
      const { error } = await supabase
        .from('high_scores')
        .insert([{ username, score: gameState.score }]);
      
      if (!error) {
        fetchLeaderboard();
        resetGame();
        setUsername('');
        setMessage("Score saved successfully!");
      } else {
        console.error("Supabase Error:", error);
        setMessage(`Error: ${error.message || "Failed to save"}`);
      }
    } catch (e: any) {
      console.error("Score save failed", e);
      setMessage("Database connection error");
    }
  };

  const resetGame = () => {
    const firstTarget = getNextTargetFromSequence(0);
    const secondTarget = getNextTargetFromSequence(1);
    setGameState({
      grid: generateInitialGrid(),
      previewCells: generatePreviewRow(),
      currentTarget: firstTarget,
      nextTarget: secondTarget,
      targetSequenceIndex: 1,
      score: 0,
      selectedNum: null,
      selectedOp: null,
      combo: 0,
      isGameOver: false
    });
  };

  const handleCellClick = (col: number, row: number) => {
    if (!gameState || isSynthesizing || gameState.isGameOver) return;
    const cell = gameState.grid[col][row];
    if (!cell) return;

    if (cell.type === 'number') {
      if (gameState.selectedNum && gameState.selectedNum.col === col && gameState.selectedNum.row === row) {
        setGameState(prev => prev ? ({ ...prev, selectedNum: null, selectedOp: null }) : null);
        return;
      }
      if (gameState.selectedNum && gameState.selectedOp) {
        performSynthesis(gameState.selectedNum, gameState.selectedOp, { col, row });
        return;
      }
      setGameState(prev => prev ? ({ ...prev, selectedNum: { col, row } }) : null);
    } else {
      if (!gameState.selectedNum) return;
      if (gameState.selectedOp && gameState.selectedOp.col === col && gameState.selectedOp.row === row) {
        setGameState(prev => prev ? ({ ...prev, selectedOp: null }) : null);
      } else {
        setGameState(prev => prev ? ({ ...prev, selectedOp: { col, row } }) : null);
      }
    }
  };

  const performSynthesis = (numPos: Position, opPos: Position, targetPos: Position) => {
    if (!gameState) return;
    setIsSynthesizing(true);
    const numValue = gameState.grid[numPos.col][numPos.row].value as number;
    const op = gameState.grid[opPos.col][opPos.row].value as Operator;
    const targetValue = gameState.grid[targetPos.col][targetPos.row].value as number;

    let result = 0;
    switch (op) {
      case '+': result = numValue + targetValue; break;
      case '-': result = numValue - targetValue; break;
      case '×': result = numValue * targetValue; break;
      case '÷': result = targetValue !== 0 ? Math.floor(numValue / targetValue) : 0; break;
    }

    if (result < 0) {
      setMessage("Result cannot be negative");
      setGameState(prev => prev ? ({ ...prev, selectedNum: null, selectedOp: null }) : null);
      setIsSynthesizing(false);
      return;
    }

    setTimeout(() => {
      setGameState(prev => {
        if (!prev) return null;
        let newGrid = prev.grid.map(col => [...col]);
        const isMatch = result === prev.currentTarget.value;

        // @ts-ignore
        newGrid[numPos.col][numPos.row] = null;
        if (isMatch) {
          // @ts-ignore
          newGrid[targetPos.col][targetPos.row] = null;
        } else {
          newGrid[targetPos.col][targetPos.row] = {
            ...newGrid[targetPos.col][targetPos.row],
            value: result,
            id: generateRandomId()
          };
        }

        let processedGrid = newGrid.map((col, idx) => idx === 1 ? col : col.filter(cell => cell !== null));
        let nextTargetIdx = prev.targetSequenceIndex;
        let currentTarget = prev.currentTarget;
        let nextTarget = prev.nextTarget;
        let score = prev.score;
        let combo = prev.combo;
        let isGameOver = false;

        if (isMatch) {
          score += (prev.currentTarget.core_base * 50) + (combo * 20);
          combo += 1;
          
          currentTarget = nextTarget;
          const nextInLine = (nextTargetIdx + 1) % 5;
          nextTarget = getNextTargetFromSequence(nextInLine);
          nextTargetIdx = nextInLine;

          processedGrid = processedGrid.map((col, colIdx) => {
            if (colIdx === 1) return col;
            const filled = [...col];
            if (filled.length < NUM_HEIGHT) {
               const previewIdx = colIdx === 0 ? 0 : 2;
               filled.unshift({ ...prev.previewCells[previewIdx], id: generateRandomId() });
            }
            while (filled.length < NUM_HEIGHT) {
              filled.unshift(createCell('number'));
            }
            return filled;
          });
        } else {
          const numberCount = processedGrid[0].length + processedGrid[2].length;
          if (numberCount < 2) isGameOver = true;

          processedGrid = processedGrid.map((col, colIdx) => {
             const h = colIdx === 1 ? OP_HEIGHT : NUM_HEIGHT;
             const padded = [...col];
             while (padded.length < h) {
               // @ts-ignore
               padded.unshift(null);
             }
             return padded;
          });
        }

        return { 
          ...prev, 
          grid: processedGrid, 
          selectedNum: null, 
          selectedOp: null, 
          score, 
          combo, 
          currentTarget, 
          nextTarget, 
          targetSequenceIndex: nextTargetIdx,
          isGameOver 
        };
      });
      setIsSynthesizing(false);
    }, 400);
  };

  if (!gameState) return null;

  const currentDiff = getDiffInfo(gameState.currentTarget.diff);
  const nextDiff = getDiffInfo(gameState.nextTarget.diff);

  return (
    <div className="h-dvh flex flex-col items-center bg-[#f2f2f7] text-black px-4 pt-4 pb-4 overflow-hidden relative selection:bg-blue-500/20 safe-top safe-bottom">
      
      {/* iOS Style HUD - More compact for mobile */}
      <div className="w-full max-w-md flex justify-between items-center mb-4 px-2 shrink-0">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Score</span>
          <span className="text-2xl sm:text-3xl font-bold tracking-tight">{gameState.score}</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowLeaderboard(true)}
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-white ios-shadow active:scale-90 transition-all text-blue-600"
          >
            <i className="fas fa-trophy text-base sm:text-lg"></i>
          </button>
          <button 
            onClick={resetGame}
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-white ios-shadow active:scale-90 transition-all text-gray-600"
          >
            <i className="fas fa-arrow-rotate-left text-base sm:text-lg"></i>
          </button>
        </div>
      </div>

      {/* Target Card - Responsive Height & Padding */}
      <motion.div 
        layout
        className="w-full max-w-md bg-white/70 ios-blur ios-shadow rounded-[24px] sm:rounded-[32px] p-4 sm:p-8 mb-4 sm:mb-6 flex flex-col items-center border border-white/50 relative overflow-hidden shrink-0"
      >
        <div className="flex flex-col items-center">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-1">Target</div>
          <motion.div 
            key={gameState.currentTarget.value}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-6xl sm:text-8xl font-black tracking-tighter ${currentDiff ? currentDiff.color : 'text-blue-600'}`}
          >
            {gameState.currentTarget.value}
          </motion.div>
          
          <AnimatePresence mode="wait">
            {currentDiff && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className={`mt-1 px-3 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black tracking-widest border ${currentDiff.bg} ${currentDiff.color} ${currentDiff.border}`}
              >
                {currentDiff.label}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="mt-3 sm:mt-5 flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Next:</span>
          <span className={`text-[11px] sm:text-xs font-bold px-3 py-0.5 rounded-full transition-colors duration-300 ${nextDiff ? `${nextDiff.bg} ${nextDiff.color}` : 'text-gray-500 bg-gray-100/50'}`}>
            {gameState.nextTarget.value}
            {nextDiff && <span className="ml-1 opacity-60 text-[8px] font-black">★</span>}
          </span>
        </div>
      </motion.div>

      {/* Main Grid - More compact gap and sizing for mobile */}
      <div className="w-full max-w-md grid grid-cols-3 gap-2 sm:gap-3.5 px-1 sm:px-2 flex-grow flex items-center justify-center overflow-visible">
        {gameState.grid.map((column, colIdx) => (
          <div 
            key={`col-${colIdx}`} 
            className={`flex flex-col gap-2 sm:gap-3.5 justify-center`}
          >
            {column.map((cell, rowIdx) => {
              if (!cell) return null;
              
              const isSelected = (gameState.selectedNum?.col === colIdx && gameState.selectedNum?.row === rowIdx) ||
                                 (gameState.selectedOp?.col === colIdx && gameState.selectedOp?.row === rowIdx);
              
              return (
                <motion.button
                  key={cell.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => handleCellClick(colIdx, rowIdx)}
                  className={`
                    relative h-16 sm:h-20 w-full flex items-center justify-center rounded-[18px] sm:rounded-[24px] text-2xl sm:text-3xl font-bold transition-all duration-300 ios-shadow
                    ${cell.type === 'operator' ? 'bg-orange-50/80 text-orange-500 border border-orange-100' : 'bg-white text-black border border-white/50'}
                    ${isSelected ? 'ring-4 ring-blue-500/30 !bg-blue-600 !text-white !border-blue-600 shadow-[0_8px_20px_rgba(37,99,235,0.3)]' : ''}
                  `}
                >
                  {cell.value}
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Game Over Modal */}
      <AnimatePresence>
        {gameState.isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/20 ios-blur flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[32px] sm:rounded-[40px] p-8 sm:p-10 w-full max-w-sm ios-shadow text-center"
            >
              <h2 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">Game Over</h2>
              <p className="text-gray-400 text-sm mb-6 sm:mb-8 font-medium">Out of moves!</p>
              
              <div className="bg-gray-50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 mb-6 sm:mb-8 border border-gray-100">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Final Score</div>
                <div className="text-4xl sm:text-5xl font-black text-blue-600 tracking-tighter">{gameState.score}</div>
              </div>

              <input 
                type="text" 
                placeholder="Your Name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl px-5 py-3.5 sm:py-4 mb-4 sm:mb-5 text-center font-bold text-base sm:text-lg placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />

              <div className="flex flex-col gap-2.5 sm:gap-3">
                <button 
                  onClick={saveScore}
                  className="w-full py-3.5 sm:py-4.5 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-bold shadow-lg sm:shadow-xl shadow-blue-600/20 active:scale-95 transition-all text-base sm:text-lg"
                >
                  Save & Restart
                </button>
                <button 
                  onClick={resetGame}
                  className="w-full py-3 text-gray-500 rounded-xl sm:rounded-2xl font-bold active:scale-95 transition-all text-[13px] sm:text-sm"
                >
                  Discard Score
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leaderboard Slide-up */}
      <AnimatePresence>
        {showLeaderboard && (
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-white flex flex-col pt-safe"
          >
            <div className="flex justify-between items-center p-5 sm:p-6 border-b border-gray-50">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">Leaderboard</h2>
              <button 
                onClick={() => setShowLeaderboard(false)}
                className="w-9 h-9 sm:w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 active:scale-90 transition-all"
              >
                <i className="fas fa-xmark text-base sm:text-lg"></i>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 no-scrollbar">
              {leaderboard.map((entry, i) => (
                <div key={entry.id} className="flex items-center justify-between bg-gray-50/50 p-4 sm:p-5 rounded-[20px] sm:rounded-3xl border border-gray-100">
                  <div className="flex items-center gap-4 sm:gap-5">
                    <span className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-[11px] sm:text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-600' : i === 1 ? 'bg-gray-200 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'text-gray-400'}`}>
                      {i + 1}
                    </span>
                    <span className="font-bold text-sm sm:text-base text-gray-800 truncate max-w-[120px] sm:max-w-none">{entry.username}</span>
                  </div>
                  <span className="font-black text-lg sm:text-xl text-blue-600 tracking-tight">{entry.score}</span>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 sm:py-32 text-gray-300">
                  <i className="fas fa-trophy text-5xl sm:text-6xl mb-4 opacity-10"></i>
                  <p className="font-bold uppercase tracking-widest text-[9px] sm:text-[10px]">No Records Yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed bottom-8 sm:bottom-12 z-[70] bg-gray-900/90 text-white text-[10px] sm:text-[11px] font-bold px-6 sm:px-8 py-3 sm:py-3.5 rounded-full ios-blur ios-shadow max-w-[80%]"
            onAnimationComplete={() => setTimeout(() => setMessage(null), 3000)}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
