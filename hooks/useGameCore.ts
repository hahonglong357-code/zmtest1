import { useState, useMemo, useCallback } from 'react';
import { Cell, Operator, Position, GameState } from '../types';
import { GAME_PARAMS, DIFF_UI, NUM_HEIGHT, OP_HEIGHT, OPERATORS, createCell, generateRandomId, getTargetForAbsoluteIndex, setTargetScore, SEQUENCE_PATTERNS, getSequenceOrder, getRandomEasyTarget, getDifficultyLevel } from '../gameConfig';
import { FEATURES } from '../featureFlags';
import { Translations } from '../i18n';
import { playFusionSound, playSuccessSound, playErrorSound } from '../services/soundEffects';

export interface ScorePopup {
  id: string;
  amount: number;
  x: number;
  y: number;
}

export function useGameCore(t: Translations) {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);

    const resetGame = useCallback(() => {
        const firstTarget = getTargetForAbsoluteIndex(0, 0);
        const initialGrid = [
            Array.from({ length: NUM_HEIGHT }, () => createCell('number')),
            OPERATORS.map(op => createCell('operator', op)),
            Array.from({ length: NUM_HEIGHT }, () => createCell('number'))
        ];
        setGameState({
            grid: initialGrid,
            previewCells: [createCell('number'), createCell('number'), createCell('number')],
            currentTarget: firstTarget,
            nextTarget: getTargetForAbsoluteIndex(1, 0),
            totalTargetsCleared: 0, score: 0, selectedNum: null, selectedOp: null, combo: 0,
            isGameOver: false, isPaused: false, numbersUsed: 0, totalDraws: 0,
            storage: Array(GAME_PARAMS.STORAGE_SIZE).fill(null),
            levelStartState: { grid: JSON.parse(JSON.stringify(initialGrid)), storage: Array(GAME_PARAMS.STORAGE_SIZE).fill(null), numbersUsed: 0 },
            tutorialStep: null,
            lastGachaThreshold: 0,
            timePenaltyCount: 0,
            dogAttackCount: 0,
            lastDifficultyLevel: 0,
            timeLeft: 100 // 初始时间
        });
        return firstTarget;
    }, []);

    const startTutorial = useCallback(() => {
        const grid: Cell[][] = [
            [createCell('number', 3), createCell('number', 1), createCell('number', 6)],
            OPERATORS.map(op => createCell('operator', op)),
            [createCell('number', 9), createCell('number', 3), createCell('number', 6)]
        ];
        setGameState({
            grid,
            previewCells: [createCell('number'), createCell('number'), createCell('number')],
            currentTarget: { value: 24, diff: 0, core_base: 2 },
            nextTarget: { value: 12, diff: 0, core_base: 2 },
            totalTargetsCleared: 0, score: 0, selectedNum: null, selectedOp: null, combo: 0,
            isGameOver: false, isPaused: false, numbersUsed: 0, totalDraws: 0,
            storage: Array(GAME_PARAMS.STORAGE_SIZE).fill(null),
            levelStartState: null, tutorialStep: 0,
            lastGachaThreshold: 0,
            timePenaltyCount: 0,
            dogAttackCount: 0,
            lastDifficultyLevel: 0,
            timeLeft: 100 // 教程初始时间
        });
    }, []);

    const nextTutorialStep = useCallback(() => {
        setGameState(prev => {
            if (!prev || prev.tutorialStep === null) return prev;
            if (prev.tutorialStep < 3) return { ...prev, tutorialStep: prev.tutorialStep + 1 };
            if (prev.tutorialStep === 3) return { ...prev, tutorialStep: 4 };
            return prev;
        });
    }, []);

    const getTutorialHintText = useCallback(() => {
        if (!gameState || gameState.tutorialStep === null) return "";
        return t.tutorial_steps[gameState.tutorialStep] || "";
    }, [gameState?.tutorialStep, t]);

    const triggerScorePopup = useCallback((amount: number, x: number, y: number) => {
        const id = generateRandomId();
        setScorePopups(prev => [...prev, { id, amount, x, y }]);
        // 动画结束后移除
        setTimeout(() => {
            setScorePopups(prev => prev.filter(p => p.id !== id));
        }, 1000);
    }, []);

    const performSynthesis = useCallback((numPos1: Position, opPos: Position, numPos2: Position) => {
        if (!gameState) return;
        setIsSynthesizing(true);
        const getVal = (p: Position) => p.source === 'grid' ? gameState.grid[p.col][p.row].value as number : gameState.storage[p.storageIndex!]?.value as number;
        const v1 = getVal(numPos1); const v2 = getVal(numPos2);
        const op = gameState.grid[opPos.col][opPos.row].value as Operator;

        if (op === '÷' && (v2 === 0 || v1 % v2 !== 0)) {
            playErrorSound();
            setMessage(v2 === 0 ? t.div_zero_err : t.not_divisible_err);
            setGameState(prev => prev ? ({ ...prev, selectedNum: null, selectedOp: null }) : null);
            setIsSynthesizing(false);
            return;
        }

        let result = 0;
        switch (op) {
            case '+': result = v1 + v2; break;
            case '-': result = v1 - v2; break;
            case '×': result = v1 * v2; break;
            case '÷': result = Math.floor(v1 / v2); break;
        }

        if (result < 0) {
            playErrorSound();
            setMessage(t.negative_err);
            setGameState(prev => prev ? ({ ...prev, selectedNum: null, selectedOp: null }) : null);
            setIsSynthesizing(false);
            return;
        }

        // 计算本回合得分（用于弹出动画）
        const roundScore = result === gameState.currentTarget.value
            ? (gameState.currentTarget.core_base * GAME_PARAMS.BASE_SCORE_MULTIPLIER) + (gameState.combo * GAME_PARAMS.COMBO_SCORE_BONUS)
            : 0;

        setTimeout(() => {
            // 播放合成音效
            playFusionSound();

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
                let { totalTargetsCleared, currentTarget, nextTarget, score, combo, numbersUsed, totalDraws, timePenaltyCount, dogAttackCount } = prev;
                numbersUsed += 2;

                // 目标匹配时减少惩罚计数
                const newTimePenaltyCount = isMatch ? Math.max(0, timePenaltyCount - 1) : timePenaltyCount;

                if (isMatch) {
                    // 播放成功音效并触发分数弹出
                    playSuccessSound();
                    // 触发分数弹出动画（位置在屏幕中心附近）
                    triggerScorePopup(roundScore, 50, 50);
                    // 连击加成最高160分（8次连击后不再增加）
                    const maxComboBonus = 160;
                    const comboBonus = FEATURES.COMBO ? Math.min(combo * GAME_PARAMS.COMBO_SCORE_BONUS, maxComboBonus) : 0;
                    score += (prev.currentTarget.core_base * GAME_PARAMS.BASE_SCORE_MULTIPLIER) + comboBonus;
                    if (FEATURES.COMBO) combo += 1;
                    totalTargetsCleared += 1;

                    // 检查难度是否提升（每10000分提升一次）
                    const currentDifficultyLevel = getDifficultyLevel(score);
                    if (currentDifficultyLevel > prev.lastDifficultyLevel) {
                        setMessage(t.difficulty_increase_msg);
                    }

                    // 检查是否完成了一个序列，完成后根据当前分数更新序列配置
                    const mainTargetsCleared = totalTargetsCleared - 3; // 去掉热身阶段的3个
                    if (mainTargetsCleared > 0) {
                        const currentSequenceOrder = getSequenceOrder(score);
                        const sequenceLength = currentSequenceOrder.reduce((sum, key) => sum + SEQUENCE_PATTERNS[key].length, 0);
                        if (mainTargetsCleared % sequenceLength === 0) {
                            // 序列完成，更新序列配置
                            setTargetScore(score);
                        }
                    }

                    if (prev.tutorialStep !== null) {
                        setMessage(t.tutorial_complete_msg);
                        setTimeout(() => {
                            localStorage.setItem('quest_visited', 'true');
                            resetGame();
                        }, 2300);
                        return { ...prev, tutorialStep: null };
                    }

                    currentTarget = nextTarget; nextTarget = getTargetForAbsoluteIndex(totalTargetsCleared + 1, totalDraws);

                    // 猎狗攻击：随机丢失一个数字（仅剩5个数字）
                    const isDogAttack = dogAttackCount > 0;
                    if (isDogAttack) {
                        const leftColIdx = 0;
                        const rightColIdx = 2;
                        const leftCol = processedGrid[leftColIdx].filter(c => c?.type === 'number');
                        const rightCol = processedGrid[rightColIdx].filter(c => c?.type === 'number');
                        const allNums = [...leftCol, ...rightCol];

                        // 随机移除一个数字
                        if (allNums.length > 0) {
                            const randomIdx = Math.floor(Math.random() * allNums.length);
                            const cellToRemove = allNums[randomIdx];
                            const colIdx = leftCol.includes(cellToRemove) ? leftColIdx : rightColIdx;
                            const actualIdx = processedGrid[colIdx].findIndex(c => c?.id === cellToRemove?.id);
                            if (actualIdx !== -1) processedGrid[colIdx][actualIdx] = null as any;

                            // 过滤掉 null 值
                            processedGrid[leftColIdx] = processedGrid[leftColIdx].filter(c => c !== null);
                            processedGrid[rightColIdx] = processedGrid[rightColIdx].filter(c => c !== null);
                        }
                    }

                    processedGrid = processedGrid.map((col, colIdx) => {
                        if (colIdx === 1) return col;
                        // 猎狗攻击后不填充数字，保持5个数字
                        if (isDogAttack) return col;
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
                    if (numPos2.source === 'grid') {
                        const rIdx = processedGrid[numPos2.col].findIndex(cell => cell?.id === resultId);
                        if (rIdx !== -1) newSelectedNum = { col: numPos2.col, row: rIdx, source: 'grid' };
                    } else {
                        newSelectedNum = { col: -1, row: -1, source: 'storage', storageIndex: numPos2.storageIndex };
                    }
                }

                // 正常情况下保存的 grid（6个数字），用于 resetLevel 恢复
                const normalGridForReset = processedGrid.map((col, colIdx) => {
                    if (colIdx === 1) return col; // 操作符列不变
                    const filled = [...col];
                    while (filled.length < NUM_HEIGHT) filled.unshift(createCell('number'));
                    return filled;
                });

                const levelStartState = isMatch
                    ? { grid: JSON.parse(JSON.stringify(normalGridForReset)), storage: JSON.parse(JSON.stringify(newStorage)), numbersUsed: numbersUsed }
                    : prev.levelStartState;

                return {
                    ...prev,
                    grid: processedGrid, storage: newStorage,
                    selectedNum: newSelectedNum, selectedOp: null,
                    score, combo,
                    currentTarget, nextTarget,
                    totalTargetsCleared, numbersUsed,
                    levelStartState,
                    tutorialStep: prev.tutorialStep !== null ? prev.tutorialStep + 1 : null,
                    timePenaltyCount: newTimePenaltyCount,
                    dogAttackCount: (isMatch && dogAttackCount > 0) ? 0 : dogAttackCount,
                    lastDifficultyLevel: isMatch ? getDifficultyLevel(score) : prev.lastDifficultyLevel,
                    timeLeft: isMatch ? 100 : prev.timeLeft // 目标匹配时重置时间
                };
            });
            setIsSynthesizing(false);
        }, 400);
    }, [gameState, t, resetGame, triggerScorePopup]);

    const handleCellClick = useCallback((col: number, row: number) => {
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
    }, [gameState, isSynthesizing, performSynthesis]);

    const handleStorageNumberClick = useCallback((index: number) => {
        if (!gameState) return;
        const item = gameState.storage[index];
        if (!item || item.type !== 'number') return;

        if (gameState.selectedNum?.source === 'storage' && gameState.selectedNum.storageIndex === index) {
            setGameState(p => p ? { ...p, selectedNum: null, selectedOp: null } : null);
            return;
        }
        if (gameState.selectedNum && gameState.selectedOp) {
            performSynthesis(gameState.selectedNum, gameState.selectedOp, { col: -1, row: -1, source: 'storage', storageIndex: index });
            return;
        }
        setGameState(p => p ? { ...p, selectedNum: { col: -1, row: -1, source: 'storage', storageIndex: index } } : null);
    }, [gameState, performSynthesis]);

    const resetLevel = useCallback(() => {
        if (!gameState?.levelStartState) return;
        setGameState(prev => {
            if (!prev) return null;
            // 恢复棋盘数字到目标出现时的状态
            const newGrid = JSON.parse(JSON.stringify(prev.levelStartState!.grid));
            // 从当前储物格中保留非数字道具（加时、刷新、幸运礼包），只恢复数字工具
            const restoredStorage = [...prev.storage];
            const savedStorage = prev.levelStartState!.storage;
            for (let i = 0; i < savedStorage.length; i++) {
                const savedItem = savedStorage[i];
                if (savedItem && savedItem.type === 'number') {
                    restoredStorage[i] = savedItem;
                }
            }
            return {
                ...prev,
                grid: newGrid,
                storage: restoredStorage,
                numbersUsed: prev.levelStartState!.numbersUsed,
                selectedNum: null,
                selectedOp: null,
                combo: 0
            };
        });
    }, [gameState?.levelStartState]);

    // 刷新目标数字（用简单的目标替换）
    const refreshTarget = useCallback(() => {
        if (!gameState) return;
        // 从难度0中随机获取一个简单目标
        const newTarget = getRandomEasyTarget();
        // 保持下一个目标不变
        const newNextTarget = gameState.nextTarget;
        // 保持当前棋盘数字不变，不重置
        setGameState(prev => prev ? ({
            ...prev,
            currentTarget: newTarget,
            nextTarget: newNextTarget,
            selectedNum: null,
            selectedOp: null,
            combo: 0
        }) : null);
    }, [gameState]);

    const useStorageItem = useCallback((index: number) => {
        setGameState(p => {
            if (!p) return null;
            const nextStorage = [...p.storage];
            nextStorage[index] = null;
            return { ...p, storage: nextStorage };
        });
    }, []);

    const drawProgress = useMemo(() => {
        if (!gameState) return 0;
        // 基于完成的目标数量计算进度，每完成6个目标触发一次抽卡
        const targetsSinceLastGacha = gameState.totalTargetsCleared - (gameState.lastGachaThreshold || 0);
        return Math.min(100, (targetsSinceLastGacha / GAME_PARAMS.GACHA_TARGETS_THRESHOLD) * 100);
    }, [gameState?.totalTargetsCleared, gameState?.lastGachaThreshold]);

    const currentDiff = useMemo(() => {
        if (!gameState) return null;
        return DIFF_UI[gameState.currentTarget.diff] || null;
    }, [gameState?.currentTarget.diff]);

    return {
        gameState, setGameState,
        isSynthesizing,
        message, setMessage,
        resetGame, startTutorial, nextTutorialStep, getTutorialHintText,
        handleCellClick, handleStorageNumberClick,
        resetLevel, useStorageItem, refreshTarget,
        drawProgress, currentDiff,
        scorePopups, triggerScorePopup,
    };
}
