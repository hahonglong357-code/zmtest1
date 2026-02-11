
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cell, Operator, Position, GameState, TargetData, StorageItem, ItemType } from './types';
import { supabase } from './services/supabaseClient';
import { TARGET_CATALOG, GAME_PARAMS, ITEM_CONFIG, DIFF_UI } from './gameConfig';

const NUM_HEIGHT = 3;
const OP_HEIGHT = 4;
const OPERATORS: Operator[] = ['+', '-', '×', '÷'];

const getTargetForAbsoluteIndex = (index: number, totalDraws: number): TargetData => {
  const GROUP_WARMUP = TARGET_CATALOG.filter(t => t.value < 40 && t.diff <= 1);
  const GROUP_LOW = TARGET_CATALOG.filter(t => t.diff <= 2);
  const GROUP_MED = TARGET_CATALOG.filter(t => t.diff === 3);
  const GROUP_HIGH = TARGET_CATALOG.filter(t => t.diff === 4);
  
  if (index < 3) return GROUP_WARMUP[Math.floor(Math.random() * GROUP_WARMUP.length)];
  
  const relativeIdx = index - 3;
  if (totalDraws < 2) {
    const cycleIdx = relativeIdx % 5;
    if (cycleIdx < 3) return GROUP_LOW[Math.floor(Math.random() * GROUP_LOW.length)];
    if (cycleIdx === 3) return GROUP_MED[Math.floor(Math.random() * GROUP_MED.length)];
    return GROUP_HIGH[Math.floor(Math.random() * GROUP_HIGH.length)];
  } else {
    const cycleIdx = relativeIdx % 4;
    if (cycleIdx < 2) return GROUP_LOW[Math.floor(Math.random() * GROUP_LOW.length)];
    if (cycleIdx === 2) return GROUP_MED[Math.floor(Math.random() * GROUP_MED.length)];
    return GROUP_HIGH[Math.floor(Math.random() * GROUP_HIGH.length)];
  }
};

const generateRandomId = () => Math.random().toString(36).substr(2, 9);

const createCell = (type: 'number' | 'operator', value?: number | Operator): Cell => ({
  id: generateRandomId(),
  value: value !== undefined ? value : (type === 'number' ? Math.floor(Math.random() * 9) + 1 : OPERATORS[Math.floor(Math.random() * OPERATORS.length)]),
  type
});

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [username, setUsername] = useState('');
  const [isGachaModalOpen, setIsGachaModalOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawResult, setDrawResult] = useState<StorageItem | null>(null);
  const [isNewDiscovery, setIsNewDiscovery] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [maxTime, setMaxTime] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const hasVisited = localStorage.getItem('quest_visited');
    if (!hasVisited) startTutorial();
    else resetGame();
    fetchLeaderboard();
  }, []);

  // Timer logic
  useEffect(() => {
    if (gameState && !gameState.isGameOver && !gameState.isPaused && !isSynthesizing && !showLeaderboard && !isGachaModalOpen && gameState.tutorialStep === null) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0.1) {
            setGameState(g => g ? { ...g, isGameOver: true } : null);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState?.isGameOver, gameState?.isPaused, isSynthesizing, showLeaderboard, isGachaModalOpen, gameState?.tutorialStep]);

  // Gacha trigger logic
  useEffect(() => {
    if (gameState && gameState.numbersUsed >= GAME_PARAMS.GACHA_THRESHOLD && !isGachaModalOpen && gameState.tutorialStep === null) {
      if (gameState.storage.some(s => s === null)) {
        setIsGachaModalOpen(true);
      }
    }
  }, [gameState?.numbersUsed, isGachaModalOpen, gameState?.tutorialStep]);

  const startTutorial = () => {
    const grid: Cell[][] = [
      [createCell('number', 3), createCell('number', 1), createCell('number', 6)],
      OPERATORS.map(op => createCell('operator', op)),
      [createCell('number', 9), createCell('number', 3), createCell('number', 6)]
    ];
    const initialTarget = { value: 24, diff: 0, core_base: 2 };
    setGameState({
      grid,
      previewCells: [createCell('number'), createCell('number'), createCell('number')],
      currentTarget: initialTarget,
      nextTarget: { value: 12, diff: 0, core_base: 2 },
      totalTargetsCleared: 0, score: 0, selectedNum: null, selectedOp: null, combo: 0,
      isGameOver: false, isPaused: false, numbersUsed: 0, totalDraws: 0, storage: Array(GAME_PARAMS.STORAGE_SIZE).fill(null),
      levelStartState: null, tutorialStep: 0
    });
    setTimeLeft(100); setMaxTime(100);
  };

  const nextTutorialStep = () => {
    setGameState(prev => {
      if (!prev || prev.tutorialStep === null) return prev;
      if (prev.tutorialStep < 3) return { ...prev, tutorialStep: prev.tutorialStep + 1 };
      if (prev.tutorialStep === 3) return { ...prev, tutorialStep: 4 };
      return prev;
    });
  };

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase.from('high_scores').select('*').order('score', { ascending: false }).limit(10);
      if (!error && data) setLeaderboard(data);
    } catch (e) { console.error(e); }
  };

  const resetGame = () => {
    const firstTarget = getTargetForAbsoluteIndex(0, 0);
    const initialDuration = firstTarget.core_base * GAME_PARAMS.TIMER_MULTIPLIER;
    const initialGrid = [
      Array.from({ length: NUM_HEIGHT }, () => createCell('number')),
      OPERATORS.map(op => createCell('operator', op)),
      Array.from({ length: NUM_HEIGHT }, () => createCell('number'))
    ];
    setGameState({
      grid: initialGrid, previewCells: [createCell('number'), createCell('number'), createCell('number')],
      currentTarget: firstTarget, nextTarget: getTargetForAbsoluteIndex(1, 0),
      totalTargetsCleared: 0, score: 0, selectedNum: null, selectedOp: null, combo: 0,
      isGameOver: false, isPaused: false, numbersUsed: 0, totalDraws: 0, storage: Array(GAME_PARAMS.STORAGE_SIZE).fill(null),
      levelStartState: { grid: JSON.parse(JSON.stringify(initialGrid)), storage: Array(GAME_PARAMS.STORAGE_SIZE).fill(null), numbersUsed: 0 },
      tutorialStep: null
    });
    setTimeLeft(initialDuration); setMaxTime(initialDuration);
  };

  const handleCellClick = (col: number, row: number) => {
    if (!gameState || isSynthesizing || gameState.isGameOver || gameState.isPaused) return;
    
    if (gameState.tutorialStep !== null) {
      if (gameState.tutorialStep < 4) return;
      const expected = [
        { c: 0, r: 0 }, { c: 1, r: 0 }, { c: 0, r: 1 }, { c: 0, r: 1 }, { c: 0, r: 1 }, { c: 1, r: 2 }, { c: 2, r: 2 }
      ];
      const curIdx = gameState.tutorialStep - 4;
      if (curIdx >= expected.length || col !== expected[curIdx].c || row !== expected[curIdx].r) return;
    }

    const cell = gameState.grid[col][row];
    if (!cell) return;
    if (cell.type === 'number') {
      if (gameState.selectedNum?.col === col && gameState.selectedNum?.row === row && gameState.selectedNum.source === 'grid') {
        setGameState(prev => prev ? ({ ...prev, selectedNum: null, selectedOp: null, tutorialStep: prev.tutorialStep !== null ? prev.tutorialStep + 1 : null }) : null);
        return;
      }
      if (gameState.selectedNum && gameState.selectedOp) {
        performSynthesis(gameState.selectedNum, gameState.selectedOp, { col, row, source: 'grid' });
        return;
      }
      setGameState(prev => prev ? ({ ...prev, selectedNum: { col, row, source: 'grid' }, tutorialStep: prev.tutorialStep !== null ? prev.tutorialStep + 1 : null }) : null);
    } else {
      if (!gameState.selectedNum) return;
      setGameState(prev => prev ? ({ ...prev, selectedOp: { col, row, source: 'grid' }, tutorialStep: prev.tutorialStep !== null ? prev.tutorialStep + 1 : null }) : null);
    }
  };

  const performSynthesis = (numPos1: Position, opPos: Position, numPos2: Position) => {
    if (!gameState) return;
    setIsSynthesizing(true);
    const getVal = (p: Position) => p.source === 'grid' ? gameState.grid[p.col][p.row].value as number : gameState.storage[p.storageIndex!]?.value as number;
    const v1 = getVal(numPos1); const v2 = getVal(numPos2);
    const op = gameState.grid[opPos.col][opPos.row].value as Operator;
    let result = 0;
    switch (op) {
      case '+': result = v1 + v2; break;
      case '-': result = v1 - v2; break;
      case '×': result = v1 * v2; break;
      case '÷': result = v2 !== 0 ? Math.floor(v1 / v2) : 0; break;
    }

    if (result < 0) {
      setMessage("不能得到负数");
      setGameState(prev => prev ? ({ ...prev, selectedNum: null, selectedOp: null }) : null);
      setIsSynthesizing(false);
      return;
    }
    
    setTimeout(() => {
      setGameState(prev => {
        if (!prev) return null;
        let newGrid = prev.grid.map(col => [...col]);
        let newStorage = [...prev.storage];
        const isMatch = result === prev.currentTarget.value;
        const resultId = generateRandomId();
        
        if (numPos1.source === 'grid') newGrid[numPos1.col][numPos1.row] = null as any;
        else newStorage[numPos1.storageIndex!] = null;

        if (numPos2.source === 'grid') {
          if (isMatch) newGrid[numPos2.col][numPos2.row] = null as any;
          else newGrid[numPos2.col][numPos2.row] = { ...newGrid[numPos2.col][numPos2.row], value: result, id: resultId };
        } else {
          newStorage[numPos2.storageIndex!] = null;
          if (!isMatch) newStorage[numPos2.storageIndex!] = { id: resultId, type: 'number', value: result };
        }
        
        let processedGrid = newGrid.map((col, idx) => idx === 1 ? col : col.filter(cell => cell !== null));
        let { totalTargetsCleared, currentTarget, nextTarget, score, combo, numbersUsed, totalDraws } = prev;
        numbersUsed += 2;
        
        if (isMatch) {
          score += (prev.currentTarget.core_base * GAME_PARAMS.BASE_SCORE_MULTIPLIER) + (combo * GAME_PARAMS.COMBO_SCORE_BONUS);
          combo += 1; totalTargetsCleared += 1;
          
          if (prev.tutorialStep !== null) {
            setMessage("恭喜你学会了游戏规则，继续后面的游戏吧");
            setTimeout(() => { 
              localStorage.setItem('quest_visited', 'true');
              resetGame(); 
            }, 2300);
            return { ...prev, tutorialStep: null };
          }
          
          currentTarget = nextTarget; nextTarget = getTargetForAbsoluteIndex(totalTargetsCleared + 1, totalDraws);
          const newDuration = currentTarget.core_base * GAME_PARAMS.TIMER_MULTIPLIER;
          setTimeLeft(newDuration); setMaxTime(newDuration);
          processedGrid = processedGrid.map((col, colIdx) => {
            if (colIdx === 1) return col;
            const filled = [...col];
            if (filled.length < NUM_HEIGHT) filled.unshift({ ...prev.previewCells[colIdx === 0 ? 0 : 2], id: generateRandomId() });
            while (filled.length < NUM_HEIGHT) filled.unshift(createCell('number'));
            return filled;
          });
        } else {
          processedGrid = processedGrid.map((col, colIdx) => {
             const h = colIdx === 1 ? OP_HEIGHT : NUM_HEIGHT;
             const padded = [...col]; while (padded.length < h) padded.unshift(null as any);
             return padded;
          });
        }
        
        let newSelectedNum: Position | null = null;
        if (!isMatch) {
           const gridNumsCount = processedGrid.reduce((acc, col) => acc + col.filter(c => c?.type === 'number').length, 0);
           const storageNumsCount = newStorage.filter(s => s?.type === 'number').length;
           if (gridNumsCount + storageNumsCount < 2) {
             setTimeout(() => setGameState(s => s ? { ...s, isGameOver: true } : null), 1200);
           }
          if (numPos2.source === 'grid') {
            const rIdx = processedGrid[numPos2.col].findIndex(cell => cell?.id === resultId);
            if (rIdx !== -1) newSelectedNum = { col: numPos2.col, row: rIdx, source: 'grid' };
          } else {
            newSelectedNum = { col: -1, row: -1, source: 'storage', storageIndex: numPos2.storageIndex };
          }
        }

        const levelStartState = isMatch 
          ? { grid: JSON.parse(JSON.stringify(processedGrid)), storage: JSON.parse(JSON.stringify(newStorage)), numbersUsed } 
          : prev.levelStartState;
        
        return { 
          ...prev, 
          grid: processedGrid, storage: newStorage,
          selectedNum: newSelectedNum, selectedOp: null, 
          score, combo, 
          currentTarget, nextTarget, 
          totalTargetsCleared, numbersUsed, 
          levelStartState,
          tutorialStep: prev.tutorialStep !== null ? prev.tutorialStep + 1 : null 
        };
      });
      setIsSynthesizing(false);
    }, 400);
  };

  const getTutorialHintText = () => {
    switch(gameState?.tutorialStep) {
      case 0: return "嘿！欢迎来到数合挑战！这是你的目标数字，你需要用棋盘上的数算出它。";
      case 1: return "这里预告了下一个挑战目标，高手都会提前做好计算规划哦！";
      case 2: return "看到这个时间条了吗？它走完前必须达成目标，动作要快！";
      case 3: return "这就是你的主战场！通过点击数字和符号，把它们合二为一。";
      case 4: return "第一步：咱们先选中左边这个 3。";
      case 5: return "第二步：点击加号 +，准备给它加点料。";
      case 6: return "第三步：点击这个 1。看！3 和 1 合成了 4。";
      case 7: return "瞧！它们变成了 4。现在它是选中状态，点击它可以取消选中。";
      case 8: return "我们要算出 24，还差一个 4×6。现在重新选上这个 4 吧！";
      case 9: return "接下来，点击乘号 ×。";
      case 10: return "最后点击 6。4 × 6 = 24！刚好匹配我们的目标，简直完美！";
      default: return "";
    }
  };

  const TutorialView = () => {
    if (gameState?.tutorialStep === null) return null;
    return (
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          exit={{ opacity: 0, scale: 0.9 }} 
          className={`absolute inset-0 z-[1100] flex items-center justify-center p-4 pointer-events-none`}
        >
          <div className="bg-white rounded-[28px] p-6 ios-shadow border border-gray-100 text-center w-full h-full flex flex-col justify-center pointer-events-auto max-h-[160px]">
            <h3 className="text-lg font-black text-gray-900 mb-1">{gameState!.tutorialStep! < 4 ? "游戏教程" : "跟我来操作"}</h3>
            <p className="text-gray-600 leading-snug text-xs font-medium mb-4">{getTutorialHintText()}</p>
            {gameState!.tutorialStep! < 4 ? (
              <button onClick={nextTutorialStep} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm active:scale-95 transition-all shadow-lg shadow-blue-500/20">我知道了，下一步</button>
            ) : (
              <div className="flex items-center justify-center gap-2 text-blue-600 font-bold animate-bounce text-xs"><i className="fas fa-hand-pointer"></i><span>点击下方闪烁块</span></div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const drawProgress = useMemo(() => {
    if (!gameState) return 0;
    return Math.min(100, (gameState.numbersUsed / GAME_PARAMS.GACHA_THRESHOLD) * 100);
  }, [gameState?.numbersUsed]);

  const currentDiff = useMemo(() => {
    if (!gameState) return null;
    return DIFF_UI[gameState.currentTarget.diff] || null;
  }, [gameState?.currentTarget.diff]);

  if (!gameState) return null;

  const timerWidth = (timeLeft / maxTime) * 100;

  return (
    <div className="h-dvh flex flex-col items-center bg-[#f2f2f7] text-black px-4 pt-4 pb-12 overflow-hidden relative selection:bg-blue-500/20 safe-top safe-bottom">
      
      <AnimatePresence>
        {gameState.tutorialStep !== null && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[900] bg-black/70 pointer-events-none" />}
      </AnimatePresence>

      <div className={`w-full max-w-md flex justify-between items-center mb-2 px-2 shrink-0 ${gameState.tutorialStep !== null ? 'z-[1002]' : ''}`}>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">当前得分</span>
          <span className="text-2xl font-bold tracking-tight">{gameState.score}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setGameState(p => p ? ({ ...p, isPaused: !p.isPaused }) : null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white ios-shadow active:scale-90 transition-all text-blue-500">
            <i className={`fas ${gameState.isPaused ? 'fa-play' : 'fa-pause'} text-base`}></i>
          </button>
          <button onClick={() => setShowLeaderboard(true)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white ios-shadow active:scale-90 transition-all text-blue-600"><i className="fas fa-trophy text-base"></i></button>
          <button onClick={startTutorial} className="w-10 h-10 flex items-center justify-center rounded-full bg-white ios-shadow active:scale-90 transition-all text-emerald-500" title="帮助/教程"><i className="fas fa-book-open text-base"></i></button>
          <button onClick={resetGame} className="w-10 h-10 flex items-center justify-center rounded-full bg-white ios-shadow active:scale-90 transition-all text-gray-400"><i className="fas fa-arrow-rotate-left text-base"></i></button>
        </div>
      </div>

      <div className="w-full max-w-md relative mb-4 shrink-0 h-[170px]">
        <motion.div layout id="target-card" className={`absolute inset-0 bg-white/70 ios-blur ios-shadow rounded-[24px] pt-4 pb-3 px-4 flex flex-col items-center border border-white/50 overflow-hidden transition-all duration-300 ${gameState.tutorialStep !== null && gameState.tutorialStep < 3 ? 'z-[1001] !bg-white scale-105 ring-4 ring-blue-400 shadow-2xl' : ''}`}>
          <div className={`flex flex-col items-center transition-all ${gameState.tutorialStep === 0 ? 'scale-110' : ''}`}>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-1">Target</div>
            <motion.div key={gameState.currentTarget.value} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`text-5xl font-black tracking-tighter ${currentDiff ? currentDiff.color : 'text-blue-600'}`}>{gameState.currentTarget.value}</motion.div>
            <AnimatePresence mode="wait">{currentDiff && <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className={`mt-1 px-3 py-0.5 rounded-full text-[9px] font-black tracking-widest border ${currentDiff.bg} ${currentDiff.color} ${currentDiff.border}`}>{currentDiff.label}</motion.div>}</AnimatePresence>
          </div>
          <div className={`mt-2 flex items-center gap-2 mb-3 rounded-full px-4 py-1.5 transition-all ${gameState.tutorialStep === 1 ? 'bg-blue-600 !text-white ring-4 ring-blue-300 scale-105' : 'text-gray-400 bg-gray-100/50'}`}>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${gameState.tutorialStep === 1 ? 'text-blue-100' : 'text-gray-300'}`}>Next:</span>
            <span className="text-[12px] font-bold">{gameState.nextTarget.value}</span>
          </div>
          <div className={`w-full h-1.5 bg-gray-100 rounded-full overflow-hidden relative transition-all ${gameState.tutorialStep === 2 ? 'ring-4 ring-blue-300 scale-y-125' : ''}`}>
            <div className="absolute inset-y-0 left-0 bg-blue-600" style={{ width: `${timerWidth}%`, backgroundColor: timerWidth < 30 ? '#ef4444' : '#2563eb', transition: timerWidth > 98 ? 'none' : 'width 0.15s linear' }} />
          </div>
        </motion.div>
        {gameState.tutorialStep !== null && gameState.tutorialStep >= 3 && <TutorialView />}
      </div>

      <div className={`w-full max-w-md flex justify-end mb-1 px-1 shrink-0 ${gameState.tutorialStep !== null ? 'invisible' : ''}`}>
        <button onClick={() => setGameState(p => {
          if (!p || !p.levelStartState) return p;
          // Time left is preserved on manual level reset as requested
          return { ...p, grid: JSON.parse(JSON.stringify(p.levelStartState.grid)), storage: JSON.parse(JSON.stringify(p.levelStartState.storage)), numbersUsed: p.levelStartState.numbersUsed, selectedNum: null, selectedOp: null };
        })} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 ios-shadow text-[11px] font-bold text-gray-500 active:scale-95 transition-all">
          <i className="fas fa-undo text-[10px]"></i> 重置本关
        </button>
      </div>

      <div className={`w-full max-w-md relative flex-grow flex flex-col justify-center overflow-visible`}>
        <div className={`grid grid-cols-3 gap-3 px-1 transition-all duration-500 ${gameState.tutorialStep === 3 ? 'z-[1001] bg-white/20 p-4 rounded-3xl ring-4 ring-blue-400 scale-105 shadow-2xl' : ''}`}>
          {gameState.grid.map((column, colIdx) => (
            <div key={`col-${colIdx}`} className="flex flex-col gap-2.5 justify-center">
              {column.map((cell, rowIdx) => {
                if (!cell) return null;
                const isSelected = gameState.selectedNum?.source === 'grid' && gameState.selectedNum?.col === colIdx && gameState.selectedNum?.row === rowIdx || gameState.selectedOp?.col === colIdx && gameState.selectedOp?.row === rowIdx;
                let isGuided = false;
                if (gameState.tutorialStep !== null) {
                  const guideMap = [{ c: 0, r: 0 }, { c: 1, r: 0 }, { c: 0, r: 1 }, { c: 0, r: 1 }, { c: 0, r: 1 }, { c: 1, r: 2 }, { c: 2, r: 2 }];
                  const curActionIdx = gameState.tutorialStep - 4;
                  if (curActionIdx >= 0 && curActionIdx < guideMap.length) {
                    const targetPos = guideMap[curActionIdx];
                    if (colIdx === targetPos.c && rowIdx === targetPos.r) isGuided = true;
                  }
                }
                return (
                  <motion.button key={cell.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileTap={{ scale: 0.94 }} onClick={() => handleCellClick(colIdx, rowIdx)} className={`relative h-14 sm:h-18 w-full flex items-center justify-center rounded-[20px] text-xl font-bold transition-all duration-300 ios-shadow ${cell.type === 'operator' ? 'bg-orange-50/80 text-orange-500 border border-orange-100' : 'bg-white text-black border border-white/50'} ${isSelected ? 'ring-4 ring-blue-500/30 !bg-blue-600 !text-white !border-blue-600 shadow-lg scale-110' : ''} ${isGuided ? 'z-[1001] ring-4 ring-blue-500 animate-pulse !shadow-2xl' : ''}`}>
                    {cell.value}
                  </motion.button>
                );
              })}
            </div>
          ))}
        </div>
        {gameState.tutorialStep !== null && gameState.tutorialStep < 3 && <div className="absolute inset-0 z-[1002] flex items-center justify-center p-4"><TutorialView /></div>}
      </div>

      <div className={`w-full max-w-md mt-4 px-2 shrink-0 ${gameState.tutorialStep !== null ? 'opacity-10 pointer-events-none' : ''}`}>
        <div className="flex justify-between items-end mb-1.5">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">抽卡进度</span>
          <span className="text-[10px] font-bold text-blue-400">{Math.floor(drawProgress)}%</span>
        </div>
        <div className="w-full h-1 bg-gray-200 rounded-full mb-3 overflow-hidden">
          <motion.div animate={{ width: `${drawProgress}%` }} className="h-full bg-blue-600" transition={{ duration: 0.3 }} />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {gameState.storage.map((item, i) => (
            <button 
              key={item?.id || `empty-${i}`} 
              onClick={() => {
                if (!item) return;
                if (item.type === 'number') {
                  if (gameState.selectedNum?.source === 'storage' && gameState.selectedNum.storageIndex === i) {
                    setGameState(p => p ? { ...p, selectedNum: null, selectedOp: null } : null); return;
                  }
                  if (gameState.selectedNum && gameState.selectedOp) {
                    performSynthesis(gameState.selectedNum, gameState.selectedOp, { col: -1, row: -1, source: 'storage', storageIndex: i }); return;
                  }
                  setGameState(p => p ? { ...p, selectedNum: { col: -1, row: -1, source: 'storage', storageIndex: i } } : null);
                } else if (item.type === 'timer') {
                  setTimeLeft(prev => Math.min(maxTime, prev + ITEM_CONFIG.TIMER_ADD_SECONDS));
                  setGameState(p => {
                    if (!p) return null;
                    const nextStorage = [...p.storage]; nextStorage[i] = null;
                    return { ...p, storage: nextStorage };
                  });
                  setMessage(`时间增加 ${ITEM_CONFIG.TIMER_ADD_SECONDS}s`);
                } else if (item.type === 'refresh') {
                   resetGame(); setMessage("棋盘已刷新");
                }
              }}
              className={`aspect-square rounded-[16px] ios-shadow border flex items-center justify-center transition-all ${item ? 'bg-white border-white/50 active:scale-90' : 'bg-gray-100/50 border-dashed border-gray-200'} ${gameState.selectedNum?.source === 'storage' && gameState.selectedNum.storageIndex === i ? 'ring-2 ring-blue-500 scale-105' : ''}`}
            >
              {item?.type === 'number' && <span className="text-lg font-black">{item.value}</span>}
              {item?.type === 'timer' && <i className="fas fa-stopwatch text-rose-500 text-lg"></i>}
              {item?.type === 'refresh' && <i className="fas fa-sync-alt text-emerald-500 text-lg"></i>}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isGachaModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2000] bg-black/60 ios-blur flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[32px] p-8 w-full max-w-xs ios-shadow text-center relative overflow-hidden">
              <h2 className="text-2xl font-black mb-6 tracking-tight">幸运抽奖</h2>
              <div className="min-h-32 flex flex-col items-center justify-center mb-6">
                {isDrawing ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.5, ease: 'linear' }} className="text-5xl text-blue-600"><i className="fas fa-spinner"></i></motion.div>
                ) : drawResult ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-[24px] flex items-center justify-center mb-4">
                      {drawResult.type === 'score' && <i className="fas fa-star text-yellow-500 text-3xl"></i>}
                      {drawResult.type === 'number' && <span className="text-4xl font-black text-blue-600">{drawResult.value}</span>}
                      {drawResult.type === 'timer' && <i className="fas fa-stopwatch text-rose-500 text-4xl"></i>}
                      {drawResult.type === 'refresh' && <i className="fas fa-sync-alt text-emerald-500 text-4xl"></i>}
                    </div>
                    {isNewDiscovery && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-2 px-6">
                         <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mb-2 inline-block">新道具发现</div>
                         <p className="text-gray-500 text-xs font-medium leading-relaxed">{ITEM_CONFIG.DESCRIPTIONS[drawResult.type]}</p>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <i className="fas fa-gift text-6xl text-gray-200"></i>
                )}
              </div>
              {!drawResult ? (
                <button 
                  onClick={() => {
                    setIsDrawing(true);
                    setTimeout(() => {
                      const pool: ItemType[] = ['score', 'number', 'timer', 'refresh'];
                      const type = pool[Math.floor(Math.random() * pool.length)];
                      const result = { id: generateRandomId(), type, value: type === 'number' ? Math.floor(Math.random() * 9) + 1 : undefined };
                      const storageKey = `seen_item_${type}`;
                      const hasSeen = localStorage.getItem(storageKey);
                      if (!hasSeen) { setIsNewDiscovery(true); localStorage.setItem(storageKey, 'true'); } else { setIsNewDiscovery(false); }
                      setGameState(prev => {
                        if (!prev) return null;
                        let { score, numbersUsed, totalDraws, storage } = prev;
                        if (type === 'score') score += ITEM_CONFIG.SCORE_PACK_POINTS;
                        else { const idx = storage.indexOf(null); if (idx !== -1) storage[idx] = result; }
                        return { ...prev, score, numbersUsed: 0, totalDraws: totalDraws + 1, storage: [...storage] };
                      });
                      setDrawResult(result); setIsDrawing(false);
                    }, 1500);
                  }} 
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold active:scale-95 shadow-lg shadow-blue-500/20"
                >点击开启</button>
              ) : (
                <button onClick={() => { setIsGachaModalOpen(false); setDrawResult(null); setIsNewDiscovery(false); }} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold active:scale-95">收下奖励</button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gameState.isGameOver && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[3000] bg-black/40 ios-blur flex items-center justify-center p-6 text-center">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[32px] p-8 w-full max-w-sm ios-shadow">
              <h2 className="text-3xl font-black mb-4">挑战结束</h2>
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Final Score</div>
                <div className="text-4xl font-black text-blue-600">{gameState.score}</div>
              </div>
              <input type="text" placeholder="输入你的昵称" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-gray-50 border-gray-100 border rounded-xl px-4 py-4 mb-4 text-center font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
              <button onClick={() => { if (!username.trim() || gameState.score === 0) { resetGame(); return; } supabase.from('high_scores').insert([{ username, score: gameState.score }]).then(fetchLeaderboard); resetGame(); setUsername(''); }} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold mb-2 shadow-xl shadow-blue-500/20 active:scale-95">保存成绩</button>
              <button onClick={resetGame} className="w-full py-3 text-gray-400 font-bold active:scale-95">重新开始</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLeaderboard && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-0 z-[2500] bg-white flex flex-col pt-safe">
            <div className="flex justify-between items-center p-6 border-b border-gray-50">
              <h2 className="text-xl font-black tracking-tight">排行榜</h2>
              <button onClick={() => setShowLeaderboard(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 active:scale-90"><i className="fas fa-xmark text-lg"></i></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {leaderboard.length > 0 ? leaderboard.map((entry, i) => (
                <div key={entry.id} className="flex items-center justify-between bg-gray-50/50 p-5 rounded-3xl border border-gray-100">
                  <div className="flex items-center gap-5">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold ${i < 3 ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>{i + 1}</span>
                    <span className="font-bold text-gray-800">{entry.username}</span>
                  </div>
                  <span className="font-black text-xl text-blue-600 tracking-tight">{entry.score}</span>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-300">
                  <i className="fas fa-trophy text-6xl mb-4 opacity-10"></i>
                  <p className="font-bold">虚位以待</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {message && (
          <motion.div initial={{ opacity: 0, scale: 0.8, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }} className="fixed inset-x-0 top-1/2 -translate-y-1/2 mx-auto z-[4000] w-fit max-w-[80vw] bg-gray-900/95 text-white text-center font-bold px-10 py-6 rounded-3xl ios-shadow ios-blur" onAnimationComplete={() => setTimeout(() => setMessage(null), 2300)}>
            <div className="text-4xl mb-3">✨</div><div className="text-lg">{message}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
