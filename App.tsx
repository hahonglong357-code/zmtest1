
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FEATURES } from './featureFlags';
import { TRANSLATIONS, Language } from './i18n';
import { GAME_PARAMS, ITEM_CONFIG } from './gameConfig';

// Hooks
import { useGameCore } from './hooks/useGameCore';
import { useTimer } from './hooks/useTimer';
import { useGacha } from './hooks/useGacha';
import { useLeaderboard } from './hooks/useLeaderboard';

// Components
import HomeScreen from './components/HomeScreen';
import GameBoard from './components/GameBoard';
import TargetCard from './components/TargetCard';
import StorageBar from './components/StorageBar';
import GachaModal from './components/GachaModal';
import PauseModal from './components/PauseModal';
import GameOverModal from './components/GameOverModal';
import LeaderboardOverlay from './components/LeaderboardOverlay';
import TutorialOverlay from './components/TutorialOverlay';
import Toast from './components/Toast';
import ScorePopupOverlay from './components/ScorePopupOverlay';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'game'>('home');
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('game_lang');
    return (saved as Language) || 'zh';
  });
  const [personalHighScore, setPersonalHighScore] = useState(0);
  const [username, setUsername] = useState('');
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);

  const t = TRANSLATIONS[language];

  // Hooks
  const game = useGameCore(t);
  const gacha = useGacha();
  const { leaderboard, showLeaderboard, setShowLeaderboard, submitScore } = useLeaderboard();

  // 计算计时器时长和激活状态
  const timerDuration = (game.gameState && game.gameState.currentTarget && game.gameState.tutorialStep === null)
    ? game.gameState.currentTarget.core_base * GAME_PARAMS.TIMER_MULTIPLIER * (game.gameState.timePenaltyCount > 0 ? 0.5 : 1)
    : 100; // 教程期间或无目标时固定100秒

  const timerActive = FEATURES.TIMER && !!game.gameState && !game.gameState.isGameOver && !game.gameState.isPaused &&
    !game.isSynthesizing && !showLeaderboard && !gacha.isOpen && !isPauseModalOpen && game.gameState.tutorialStep === null;

  const timer = useTimer({
    isActive: timerActive,
    duration: timerDuration,
    resetKey: game.gameState?.totalTargetsCleared,
    onTimeUp: () => game.setGameState(g => g ? { ...g, isGameOver: true } : null)
  });

  // Persist language
  useEffect(() => { localStorage.setItem('game_lang', language); }, [language]);

  // Load saved data
  useEffect(() => {
    const savedHighScore = localStorage.getItem('personal_high_score');
    if (savedHighScore) setPersonalHighScore(parseInt(savedHighScore, 10));
    const savedUsername = localStorage.getItem('last_username');
    if (savedUsername) setUsername(savedUsername);
  }, []);

  // Gacha trigger - 每完成一个目标触发一次抽卡
  useEffect(() => {
    if (!FEATURES.GACHA || !game.gameState) return;
    if (game.gameState.totalTargetsCleared > 0 &&
      game.gameState.totalTargetsCleared % GAME_PARAMS.GACHA_TARGETS_THRESHOLD === 0 &&
      !gacha.isOpen && game.gameState.tutorialStep === null) {
      const lastHandled = game.gameState.lastGachaThreshold || 0;
      if (game.gameState.totalTargetsCleared > lastHandled) {
        if (game.gameState.storage.some(s => s === null)) {
          game.setGameState(prev => prev ? ({ ...prev, lastGachaThreshold: prev.totalTargetsCleared }) : null);
          gacha.setIsOpen(true);
        }
      }
    }
  }, [game.gameState?.totalTargetsCleared, gacha.isOpen, game.gameState?.tutorialStep]);

  // Update high score
  const updateHighScore = (score: number) => {
    if (score > personalHighScore) {
      setPersonalHighScore(score);
      localStorage.setItem('personal_high_score', score.toString());
    }
  };

  // Handle storage item click
  const handleStorageClick = (index: number) => {
    if (!game.gameState) return;
    const item = game.gameState.storage[index];
    if (!item) return;

    if (item.type === 'number') {
      game.handleStorageNumberClick(index);
    } else if (item.type === 'timer') {
      timer.addTime(ITEM_CONFIG.TIMER_ADD_SECONDS);
      game.useStorageItem(index);
      game.setMessage(`${t.timer_add_msg} ${ITEM_CONFIG.TIMER_ADD_SECONDS}s`);
    } else if (item.type === 'refresh') {
      game.resetGame();
      game.setMessage(t.refresh_msg);
    }
  };

  // Handle gacha draw
  const handleGachaDraw = () => {
    gacha.performDraw((result) => {
      game.setGameState(prev => {
        if (!prev) return null;
        let score = prev.score;
        let newStorage = [...prev.storage];
        let timePenaltyCount = prev.timePenaltyCount;
        let newGrid = prev.grid.map(col => [...col]);

        if (result.resultType === 'item') {
          // 获得道具
          if (result.item.type === 'score') {
            score += ITEM_CONFIG.SCORE_PACK_POINTS;
          } else {
            const idx = newStorage.indexOf(null);
            if (idx !== -1) newStorage[idx] = result.item;
          }
        } else {
          // 发生事件
          if (result.eventId === 'items_lost') {
            // 清空道具
            newStorage = Array(GAME_PARAMS.STORAGE_SIZE).fill(null);
          } else if (result.eventId === 'time_half') {
            // 时间惩罚：接下来两回合减半
            timePenaltyCount = 2;
          } else if (result.eventId === 'dog_attack') {
            // 猎狗攻击：立即丢失一个数字
            // 从左侧或右侧随机移除一个数字
            const leftCol = newGrid[0].filter(c => c?.type === 'number');
            const rightCol = newGrid[2].filter(c => c?.type === 'number');
            const allNums = [...leftCol, ...rightCol];

            if (allNums.length > 0) {
              const randomIdx = Math.floor(Math.random() * allNums.length);
              const cellToRemove = allNums[randomIdx];
              const colIdx = leftCol.includes(cellToRemove) ? 0 : 2;
              const actualIdx = newGrid[colIdx].findIndex(c => c?.id === cellToRemove?.id);
              if (actualIdx !== -1) newGrid[colIdx][actualIdx] = null as any;

              // 过滤掉 null 值
              newGrid[0] = newGrid[0].filter(c => c !== null);
              newGrid[2] = newGrid[2].filter(c => c !== null);
            }
          }
        }

        return {
          ...prev,
          score,
          totalDraws: prev.totalDraws + 1,
          storage: newStorage,
          timePenaltyCount,
          grid: newGrid
        };
      });
    });
  };

  // ========== HOME SCREEN ==========
  if (currentView === 'home') {
    return (
      <>
        <HomeScreen
          personalHighScore={personalHighScore}
          language={language}
          onLanguageToggle={() => setLanguage(l => l === 'zh' ? 'en' : 'zh')}
          onShowTutorial={() => {
            game.startTutorial();
            setCurrentView('game');
          }}
          t={t}
          onStartGame={() => {
            const hasVisited = localStorage.getItem('quest_visited');
            if (!hasVisited && FEATURES.TUTORIAL) {
              game.startTutorial();
            } else {
              game.resetGame();
            }
            setCurrentView('game');
          }}
          onShowLeaderboard={() => setShowLeaderboard(true)}
        />
        {FEATURES.LEADERBOARD && <LeaderboardOverlay isOpen={showLeaderboard} leaderboard={leaderboard} onClose={() => setShowLeaderboard(false)} t={t} />}
      </>
    );
  }

  // ========== GAME SCREEN ==========
  if (!game.gameState) return null;

  return (
    <div className="h-dvh flex flex-col items-center bg-[#f2f2f7] text-black px-4 pt-4 pb-12 overflow-hidden relative selection:bg-blue-500/20 safe-top safe-bottom">

      {/* Top Bar */}
      <div className="w-full max-w-md flex justify-between items-center px-2 mb-2 shrink-0">
        <div className="flex flex-col items-start">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Score</span>
          <span className="text-2xl font-black text-gray-900 leading-none">{game.gameState.score}</span>
        </div>
        <button
          onClick={() => { setIsPauseModalOpen(true); game.setGameState(p => p ? ({ ...p, isPaused: true }) : null); }}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white ios-shadow text-gray-400 active:scale-90 transition-all border border-gray-100"
        >
          <i className="fas fa-pause text-sm"></i>
        </button>
      </div>

      {/* Tutorial dark overlay */}
      <AnimatePresence>
        {game.gameState.tutorialStep !== null && <div className="fixed inset-0 z-[900] bg-black/70 pointer-events-none" />}
      </AnimatePresence>

      {/* Target Card */}
      <div className="w-full max-w-md relative mb-3 shrink-0 h-[180px]">
        <TargetCard gameState={game.gameState} timeLeft={timer.timeLeft} maxTime={timerDuration} currentDiff={game.currentDiff} t={t} />
        {game.gameState.tutorialStep !== null && game.gameState.tutorialStep >= 3 && (
          <TutorialOverlay tutorialStep={game.gameState.tutorialStep} hintText={game.getTutorialHintText()} onNextStep={game.nextTutorialStep} t={t} />
        )}
      </div>

      {/* Reset Numbers Button */}
      <div className="w-full max-w-md flex justify-end mb-2 shrink-0 pr-2">
        <button
          onClick={game.resetLevel}
          className="flex items-center gap-2 px-4 py-1.5 bg-white/80 ios-blur rounded-full text-xs font-black text-gray-500 ios-shadow active:scale-95 transition-all border border-white/50"
        >
          <i className="fas fa-rotate-left"></i>
          <span>{t.reset_numbers}</span>
        </button>
      </div>

      {/* Game Board */}
      <div className={`w-full max-w-md relative flex-grow flex flex-col justify-center overflow-visible`}>
        <GameBoard gameState={game.gameState} onCellClick={game.handleCellClick} />
        {game.gameState.tutorialStep !== null && game.gameState.tutorialStep < 3 && (
          <div className="absolute inset-0 z-[1002] flex items-center justify-center p-4">
            <TutorialOverlay tutorialStep={game.gameState.tutorialStep} hintText={game.getTutorialHintText()} onNextStep={game.nextTutorialStep} t={t} />
          </div>
        )}
      </div>

      {/* Storage Bar */}
      {FEATURES.STORAGE && (
        <StorageBar gameState={game.gameState} drawProgress={game.drawProgress} onStorageClick={handleStorageClick} t={t} />
      )}

      {/* Modals */}
      <PauseModal
        isOpen={isPauseModalOpen}
        onContinue={() => { setIsPauseModalOpen(false); game.setGameState(p => p ? ({ ...p, isPaused: false }) : null); }}
        onBackToHome={() => { setIsPauseModalOpen(false); setCurrentView('home'); game.setGameState(null); }}
        t={t}
      />

      {FEATURES.GACHA && (
        <GachaModal
          isOpen={gacha.isOpen} isDrawing={gacha.isDrawing} drawResult={gacha.drawResult}
          onDraw={handleGachaDraw} onClaim={gacha.claimReward} t={t}
        />
      )}

      <GameOverModal
        isOpen={game.gameState.isGameOver}
        score={game.gameState.score}
        username={username}
        onUsernameChange={setUsername}
        onSaveAndHome={() => {
          updateHighScore(game.gameState!.score);
          if (FEATURES.LEADERBOARD) submitScore(username, game.gameState!.score);
          setCurrentView('home');
        }}
        onPlayAgain={() => {
          updateHighScore(game.gameState!.score);
          game.resetGame();
        }}
        t={t}
      />

      {FEATURES.LEADERBOARD && <LeaderboardOverlay isOpen={showLeaderboard} leaderboard={leaderboard} onClose={() => setShowLeaderboard(false)} t={t} />}
      <ScorePopupOverlay popups={game.scorePopups} />
      <Toast message={game.message} onDismiss={() => game.setMessage(null)} />
    </div>
  );
};

export default App;
