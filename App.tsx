
import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FEATURES } from './featureFlags';
import { TRANSLATIONS, Language } from './i18n';
import { GAME_PARAMS, ITEM_CONFIG, getTimerMultiplierByLevel, getItemChanceByLevel, DIFFICULTY_BANNER_CONFIG } from './gameConfig';
import { userAnalytics } from './services/userAnalytics';

// Hooks
import { useGameCore } from './hooks/useGameCore';
import { useTimer } from './hooks/useTimer';
import { useGacha } from './hooks/useGacha';
import { useLeaderboard } from './hooks/useLeaderboard';

// Components
import HomeScreen from './components/HomeScreen';
import FeedbackModal from './components/FeedbackModal';
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
  const [showFeedback, setShowFeedback] = useState(false);
  const [savedGameState, setSavedGameState] = useState<ReturnType<typeof useGameCore>['gameState'] | null>(null);

  const t = TRANSLATIONS[language];

  // Hooks
  const game = useGameCore(t);
  const gacha = useGacha();
  const { leaderboard, showLeaderboard, setShowLeaderboard, submitScore } = useLeaderboard();

  // 计算计时器时长和激活状态
  const currentScore = game.gameState?.score || 0;
  const currentDifficultyLevel = game.difficultyLevel || 0;
  const currentTimerMultiplier = getTimerMultiplierByLevel(currentDifficultyLevel);
  const timerDuration = (game.gameState && game.gameState.currentTarget && game.gameState.tutorialStep === null)
    ? game.gameState.currentTarget.core_base * currentTimerMultiplier * (game.gameState.timePenaltyCount > 0 ? 0.5 : 1)
    : GAME_PARAMS.TIMER_LIMITS.DEFAULT_MAX; // 教程期间或无目标时使用配置值

  // 简化计时器激活条件，确保游戏开始后立即激活
  const timerActive = FEATURES.TIMER && !!game.gameState && !game.gameState.isGameOver && !game.gameState.isPaused &&
    game.gameState.tutorialStep === null && !gacha.isOpen;

  // 计算有效的剩余时间
  // 优先级：游戏状态中的时间 > 保存的游戏状态中的时间 > 基于目标难度计算的时间
  const effectiveTimeLeft = game.gameState?.timeLeft || savedGameState?.timeLeft || timerDuration;

  // 直接在顶层调用useTimer Hook，遵循React的Hook规则
  const timer = useTimer({
    isActive: timerActive,
    duration: timerDuration,
    resetKey: game.gameState?.totalTargetsCleared,
    initialTimeLeft: effectiveTimeLeft,
    onTimeUp: () => {
      gameStatsRef.current.endReason = 'time_up';
      game.setGameState(g => g ? { ...g, isGameOver: true } : null);
    }
  });

  // 简化时间管理，只在返回主页时保存时间
  // 避免实时同步导致的性能问题和状态冲突
  const handleSaveTimeBeforeExit = () => {
    if (game.gameState && !game.gameState.isGameOver) {
      game.setGameState(prev => prev ? ({ ...prev, timeLeft: timer.timeLeft }) : null);
    }
  };

  // 页面卸载时保存当前时间
  useEffect(() => {
    const handleBeforeUnload = () => {
      handleSaveTimeBeforeExit();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [game.gameState, timer.timeLeft]);

  // Track game stats for analytics
  const gameStatsRef = useRef({ highestCombo: 0, highestDifficulty: 0, endReason: 'settle' as 'settle' | 'time_up' });

  // Update highest combo and difficulty during gameplay
  useEffect(() => {
    if (!game.gameState || game.gameState.isGameOver) return;
    if (game.gameState.combo > gameStatsRef.current.highestCombo) {
      gameStatsRef.current.highestCombo = game.gameState.combo;
    }
    if (game.gameState.currentTarget && game.gameState.currentTarget.diff > gameStatsRef.current.highestDifficulty) {
      gameStatsRef.current.highestDifficulty = game.gameState.currentTarget.diff;
    }
  }, [game.gameState?.combo, game.gameState?.currentTarget?.diff, game.gameState?.isGameOver]);

  // Persist language
  useEffect(() => { localStorage.setItem('game_lang', language); }, [language]);

  // Load saved data
  useEffect(() => {
    const savedHighScore = localStorage.getItem('personal_high_score');
    if (savedHighScore) setPersonalHighScore(parseInt(savedHighScore, 10));
    const savedUsername = localStorage.getItem('last_username');
    if (savedUsername) setUsername(savedUsername);

    // Load saved game state from localStorage
    const savedGame = localStorage.getItem('saved_game_state');
    if (savedGame) {
      try {
        const parsedGameState = JSON.parse(savedGame);
        setSavedGameState(parsedGameState);
      } catch (error) {
        console.error('Failed to parse saved game state:', error);
        localStorage.removeItem('saved_game_state');
      }
    }
  }, []);

  // Save game state to localStorage when it changes
  useEffect(() => {
    if (game.gameState && !game.gameState.isGameOver) {
      localStorage.setItem('saved_game_state', JSON.stringify(game.gameState));
    }
  }, [game.gameState]);

  // Gacha trigger - 每完成一个目标触发一次抽卡
  useEffect(() => {
    if (!FEATURES.GACHA || !game.gameState) return;
    if (game.gameState.totalTargetsCleared > 0 &&
      game.gameState.totalTargetsCleared % GAME_PARAMS.GACHA_TARGETS_THRESHOLD === 0 &&
      !gacha.isOpen && game.gameState.tutorialStep === null) {
      const lastHandled = game.gameState.lastGachaThreshold || 0;
      if (game.gameState.totalTargetsCleared > lastHandled) {
        // 立即标记已处理，防止重复触发
        game.setGameState(prev => prev ? ({ ...prev, lastGachaThreshold: prev.totalTargetsCleared }) : null);

        // 延迟 1200ms 弹出抽卡，让分数反馈和纸屑特效先播放完
        const timer = setTimeout(() => {
          // 再次检查确认格子未满且弹窗未开启
          if (!gacha.isOpen && game.gameState && game.gameState.storage.some(s => s === null)) {
            gacha.setIsOpen(true);
          }
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [game.gameState?.totalTargetsCleared, gacha.isOpen, game.gameState?.tutorialStep, game.gameState?.storage, game.setGameState, gacha.setIsOpen]);

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
      game.handleStorageNumberClick(index, timer.timeLeft, timerDuration);
    } else if (item.type === 'timer') {
      timer.addTime(ITEM_CONFIG.TIMER_ADD_SECONDS);
      game.useStorageItem(index);
      game.setMessage(`${t.timer_add_msg} ${ITEM_CONFIG.TIMER_ADD_SECONDS}s`);
    } else if (item.type === 'refresh') {
      game.refreshTarget();
      game.useStorageItem(index);
      game.setMessage(t.refresh_msg);
    }
  };

  // Handle gacha draw
  const handleGachaDraw = () => {
    const currentDifficultyLevel = game.difficultyLevel || 0;
    console.log(`[handleGachaDraw] 传入的难度等级: ${currentDifficultyLevel}, getItemChanceByLevel结果: ${getItemChanceByLevel(currentDifficultyLevel)}`);
    gacha.performDraw((result) => {
      game.setGameState(prev => {
        if (!prev) return null;
        let score = prev.score;
        let newStorage = [...prev.storage];
        let timePenaltyCount = prev.timePenaltyCount;
        let doubleScoreCount = prev.doubleScoreCount;
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
            // 随机丢失一个道具
            const filledIndices = newStorage.map((item, idx) => item !== null ? idx : -1).filter(idx => idx !== -1);
            if (filledIndices.length > 0) {
              const randomIdx = filledIndices[Math.floor(Math.random() * filledIndices.length)];
              newStorage[randomIdx] = null;
            }
          } else if (result.eventId === 'time_half') {
            // 时间惩罚：接下来两回合减半
            timePenaltyCount = 2;
          } else if (result.eventId === 'score_double') {
            // 积分翻倍：接下来3个目标获得积分翻倍
            doubleScoreCount = 3;
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

        // 更新 levelStartState
        let newLevelStartState = prev.levelStartState;
        if (result.eventId === 'dog_attack') {
          // 猎狗攻击：更新grid
          newLevelStartState = { ...prev.levelStartState!, grid: JSON.parse(JSON.stringify(newGrid)) };
        } else if (result.resultType === 'item' && result.item.type !== 'score') {
          // 获得道具时：更新storage为当前状态
          newLevelStartState = { ...prev.levelStartState!, storage: JSON.parse(JSON.stringify(newStorage)) };
        }

        return {
          ...prev,
          score,
          totalDraws: prev.totalDraws + 1,
          storage: newStorage,
          timePenaltyCount,
          doubleScoreCount,
          grid: newGrid,
          levelStartState: newLevelStartState
        };
      });
    }, currentDifficultyLevel);
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
            // Reset game stats for new session
            gameStatsRef.current = { highestCombo: 0, highestDifficulty: 0 };
            // Start analytics session
            userAnalytics.startGameSession();

            // 清除保存的游戏状态，确保新游戏使用新的时间
            setSavedGameState(null);
            localStorage.removeItem('saved_game_state');

            // 强制刷新游戏状态，确保使用新的时间
            // 先设置为null，然后在下一个渲染周期后重置游戏
            game.setGameState(null);
            setTimeout(() => {
              const hasVisited = localStorage.getItem('quest_visited');
              if (!hasVisited && FEATURES.TUTORIAL) {
                game.startTutorial();
              } else {
                game.resetGame();
              }
              setCurrentView('game');
            }, 0);
          }}
          onContinueGame={() => {
            if (savedGameState) {
              // 恢复游戏状态并确保游戏是非暂停状态
              game.setGameState({ ...savedGameState, isPaused: false });
              // 延迟清空savedGameState，确保effectiveTimeLeft能够正确计算
              setTimeout(() => {
                setSavedGameState(null);
              }, 0);
              setCurrentView('game');
            }
          }}
          hasSavedGame={!!savedGameState}
          onShowLeaderboard={() => setShowLeaderboard(true)}
          onShowFeedback={() => setShowFeedback(true)}
        />
        {FEATURES.LEADERBOARD && <LeaderboardOverlay isOpen={showLeaderboard} leaderboard={leaderboard} onClose={() => setShowLeaderboard(false)} t={t} />}
        <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} t={t} />
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

      {/* Tutorial dark overlay with spotlight feel */}
      <AnimatePresence>
        {game.gameState.tutorialStep !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[900] bg-black/70 ios-blur-sm pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Target Card - 动态提升教程层级 */}
      <div className={`w-full max-w-md relative mb-0 shrink-0 transform -translate-y-1 transition-all duration-300 ${game.gameState.tutorialStep !== null && game.gameState.tutorialStep < 3 ? 'z-[1001]' : 'z-10'}`}>
        <TargetCard gameState={game.gameState} timeLeft={timer.timeLeft} maxTime={timerDuration} currentDiff={game.currentDiff} t={t} />
        {game.gameState.tutorialStep !== null && game.gameState.tutorialStep < 3 && (
          <TutorialOverlay tutorialStep={game.gameState.tutorialStep} hintText={game.getTutorialHintText()} onNextStep={game.nextTutorialStep} t={t} position="bottom" />
        )}
      </div>

      {/* Reset Numbers Button */}
      <div className="w-full max-w-md flex justify-end mb-6 shrink-0 pr-4 mt-2">
        <button
          onClick={game.resetLevel}
          className="flex items-center gap-2 px-4 py-2.5 bg-white ios-blur rounded-2xl text-[11px] font-black text-gray-400 ios-shadow active:scale-95 transition-all border border-gray-100 group"
        >
          <i className="fas fa-rotate-left group-active:rotate-180 transition-transform duration-500"></i>
          <span>{t.reset_numbers}</span>
        </button>
      </div>

      {/* Game Board - 动态提升教程层级 */}
      <div className={`w-full max-w-md relative flex-grow flex flex-col justify-start mt-[-4px] overflow-visible transition-all duration-300 ${game.gameState.tutorialStep !== null && game.gameState.tutorialStep >= 3 ? 'z-[1001]' : 'z-10'}`}>
        <GameBoard
          gameState={game.gameState}
          onCellClick={(col, row) => game.handleCellClick(col, row, timer.timeLeft, timerDuration)}
          message={game.message}
          onDismissMessage={() => game.setMessage(null)}
        />
        {game.gameState.tutorialStep !== null && game.gameState.tutorialStep >= 3 && (
          <div className="absolute top-0 left-0 right-0 z-[1002] flex items-center justify-center p-4">
            <TutorialOverlay tutorialStep={game.gameState.tutorialStep} hintText={game.getTutorialHintText()} onNextStep={game.nextTutorialStep} t={t} position="top" />
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
        onSettle={() => { setIsPauseModalOpen(false); game.setGameState(p => p ? ({ ...p, isPaused: false, isGameOver: true }) : null); }}
        onBackToHome={() => {
          setIsPauseModalOpen(false);
          // 保存当前游戏状态和计时器时间
          handleSaveTimeBeforeExit();
          const currentState = game.gameState;
          if (currentState) {
            setSavedGameState(currentState);
          }
          setCurrentView('home');
        }}
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
          // End analytics session
          userAnalytics.endGameSession({
            score: game.gameState!.score,
            targetsCleared: game.gameState!.totalTargetsCleared,
            highestCombo: gameStatsRef.current.highestCombo,
            highestDifficulty: gameStatsRef.current.highestDifficulty,
            endReason: 'settle',
            currentDifficultyLevel: game.difficultyLevel,
            itemsHeld: game.gameState!.storage.filter(i => i !== null).length,
            username: username
          });
          updateHighScore(game.gameState!.score);
          if (FEATURES.LEADERBOARD) submitScore(username, game.gameState!.score);
          localStorage.removeItem('saved_game_state');
          // 确保游戏状态被清空，避免影响下一局
          game.setGameState(null);
          setCurrentView('home');
        }}
        onPlayAgain={() => {
          // End analytics session then restart
          userAnalytics.endGameSession({
            score: game.gameState!.score,
            targetsCleared: game.gameState!.totalTargetsCleared,
            highestCombo: gameStatsRef.current.highestCombo,
            highestDifficulty: gameStatsRef.current.highestDifficulty,
            endReason: 'settle',
            currentDifficultyLevel: game.difficultyLevel,
            itemsHeld: game.gameState!.storage.filter(i => i !== null).length,
            username: username
          });
          updateHighScore(game.gameState!.score);
          // Reset stats and start new session
          gameStatsRef.current = { highestCombo: 0, highestDifficulty: 0 };
          userAnalytics.startGameSession();
          // 先清空游戏状态，然后再重置，确保完全刷新
          game.setGameState(null);
          // 确保在下一个渲染周期后重置游戏，避免状态冲突
          setTimeout(() => {
            game.resetGame();
          }, 0);
          localStorage.removeItem('saved_game_state');
        }}
        t={t}
      />

      {FEATURES.LEADERBOARD && <LeaderboardOverlay isOpen={showLeaderboard} leaderboard={leaderboard} onClose={() => setShowLeaderboard(false)} t={t} />}
      <ScorePopupOverlay popups={game.scorePopups} />

      {/* Debug Window */}
      <div className="fixed bottom-4 left-4 z-[9999] pointer-events-none">
        <div className="bg-black/80 backdrop-blur-md border border-white/20 rounded-xl p-3 text-[10px] text-white font-mono space-y-1 shadow-2xl">
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">DIFF LEVEL:</span>
            <span className="font-bold text-blue-400">{currentDifficultyLevel}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">ITEM CHANCE:</span>
            <span className="font-bold text-emerald-400">{(getItemChanceByLevel(currentDifficultyLevel) * 100).toFixed(0)}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">TIME MULT:</span>
            <span className="font-bold text-orange-400">{currentTimerMultiplier.toFixed(1)}x</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
