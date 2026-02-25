import React from 'react';
import { motion } from 'framer-motion';
import { GameState, StorageItem } from '../types';
import { Translations } from '../i18n';
import { playTapSound } from '../services/soundEffects';

interface StorageBarProps {
    gameState: GameState;
    drawProgress: number;
    onStorageClick: (index: number) => void;
    t: Translations;
}

const StorageBar: React.FC<StorageBarProps> = ({ gameState, drawProgress, onStorageClick, t }) => {
    const handleClick = (index: number, hasItem: boolean) => {
        if (hasItem) {
            playTapSound();
        }
        onStorageClick(index);
    };

    return (
        <div className={`w-full max-w-md mt-1 px-2 shrink-0 ${gameState.tutorialStep !== null ? 'opacity-10 pointer-events-none' : ''}`}>
            <div className="flex justify-between items-end mb-1.5">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.draw_progress}</span>
                <span className="text-[10px] font-bold text-blue-400">{Math.floor(drawProgress)}%</span>
            </div>
            <div className="w-full h-1 bg-gray-200 rounded-full mb-2 overflow-hidden">
                <motion.div animate={{ width: `${drawProgress}%` }} className="h-full bg-blue-600" transition={{ duration: 0.3 }} />
            </div>
            <div className="grid grid-cols-4 gap-3">
                {gameState.storage.map((item: StorageItem | null, i: number) => (
                    <button
                        key={item?.id || `empty-${i}`}
                        onClick={() => handleClick(i, !!item)}
                        className={`aspect-square rounded-[16px] ios-shadow border flex items-center justify-center transition-all ${item ? 'bg-white border-white/50 active:scale-90' : 'bg-gray-100/50 border-dashed border-gray-200'} ${gameState.selectedNum?.source === 'storage' && gameState.selectedNum.storageIndex === i ? 'ring-2 ring-blue-500 scale-105' : ''}`}
                    >
                        {item?.type === 'number' && <span className="text-lg font-black">{item.value}</span>}
                        {item?.type === 'timer' && <i className="fas fa-stopwatch text-rose-500 text-lg"></i>}
                        {item?.type === 'refresh' && <i className="fas fa-sync-alt text-emerald-500 text-lg"></i>}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default StorageBar;
