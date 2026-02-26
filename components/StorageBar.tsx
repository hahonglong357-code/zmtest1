import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, StorageItem, GachaResult, GachaItemResult, GachaEventResult } from '../types';
import { Translations } from '../i18n';
import { GACHA_NARRATIVES } from '../gameConfig';
import { playTapSound } from '../services/soundEffects';

interface StorageBarProps {
    gameState: GameState;
    drawProgress: number;
    lastResult: GachaResult | null;
    onStorageClick: (index: number) => void;
    t: Translations;
}

const StorageBar: React.FC<StorageBarProps> = ({ gameState, drawProgress, lastResult, onStorageClick, t }) => {
    // 随机选择一段闲聊文案作为默认值
    const idleNarrative = React.useMemo(() => {
        return GACHA_NARRATIVES.IDLE_NARRATIVES[Math.floor(Math.random() * GACHA_NARRATIVES.IDLE_NARRATIVES.length)];
    }, [gameState.totalTargetsCleared]); // 每次目标完成后可能更换，或者保持固定

    const handleClick = (index: number, hasItem: boolean) => {
        if (hasItem) {
            playTapSound();
        }
        onStorageClick(index);
    };

    return (
        <div className={`w-full max-w-md mt-1 px-2 shrink-0 ${gameState.tutorialStep !== null ? 'opacity-10 pointer-events-none' : ''}`}>
            <div className="w-full h-1 bg-gray-200 rounded-full mb-2 overflow-hidden">
                <motion.div animate={{ width: `${drawProgress}%` }} className="h-full bg-blue-600" transition={{ duration: 0.3 }} />
            </div>

            {/* Inline Event Narrative - 压缩高度 */}
            <div className="min-h-[36px] mb-2 px-1 relative">
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={lastResult ? JSON.stringify(lastResult) : `idle-${gameState.totalTargetsCleared}`}
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 8 }}
                        animate={lastResult ? {
                            opacity: 1,
                            y: 0,
                            scale: [0.9, 1.08, 1],
                            filter: ["brightness(1)", "brightness(1.4)", "brightness(1)"]
                        } : {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            filter: "brightness(1)"
                        }}
                        exit={{ opacity: 0, scale: 0.9, y: -8, transition: { duration: 0.2 } }}
                        transition={{
                            duration: 0.35,
                            times: [0, 0.4, 1],
                            ease: "easeOut"
                        }}
                        className="w-full bg-white/30 rounded-xl py-2 px-3 border border-white/40 flex items-start gap-1.5 ios-shadow-sm"
                    >
                        <div className="flex items-center gap-1.5 overflow-hidden py-0.5">
                            {lastResult && (
                                <span className="text-[12px] font-bold text-gray-500 shrink-0 leading-none">
                                    {t.just_now}：
                                </span>
                            )}
                            <span className="text-[12px] font-medium text-gray-600 leading-none">
                                {lastResult ? (
                                    lastResult.resultType === 'item'
                                        ? (<>{(lastResult as GachaItemResult).narrativeText} —— <span className="text-blue-600 font-bold">{(lastResult as GachaItemResult).itemName}</span></>)
                                        : (<>{(lastResult as GachaEventResult).eventText}</>)
                                ) : idleNarrative}
                            </span>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
                {gameState.storage.map((item: StorageItem | null, i: number) => (
                    <button
                        key={item?.id || `empty-${i}`}
                        onClick={() => handleClick(i, !!item)}
                        className={`aspect-square rounded-[14px] ios-shadow border flex items-center justify-center transition-all ${item ? 'bg-white border-white/50 active:scale-90' : 'bg-gray-100/30 border-dashed border-gray-200'} ${gameState.selectedNum?.source === 'storage' && gameState.selectedNum.storageIndex === i ? 'ring-2 ring-blue-500 scale-105' : ''}`}
                    >
                        {item?.type === 'number' && <span className="text-base font-black">{item.value}</span>}
                        {item?.type === 'timer' && <i className="fas fa-stopwatch text-rose-500 text-base"></i>}
                        {item?.type === 'refresh' && <i className="fas fa-sync-alt text-emerald-500 text-base"></i>}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default StorageBar;
