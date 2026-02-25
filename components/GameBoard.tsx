import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cell, GameState } from '../types';
import { playTapSound } from '../services/soundEffects';

interface GameBoardProps {
    gameState: GameState;
    onCellClick: (col: number, row: number) => void;
}

// 粒子组件
const Particles: React.FC<{ x: number; y: number }> = ({ x, y }) => (
    <motion.div
        initial={{ opacity: 1, scale: 0 }}
        animate={{
            opacity: 0,
            scale: 0,
            x: [0, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 80],
            y: [0, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 80],
        }}
        transition={{ duration: 0.4 }}
        className="absolute pointer-events-none z-20"
        style={{ left: x, top: y }}
    >
        {[...Array(5)].map((_, i) => (
            <div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                    background: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'][i % 5],
                    transform: `translate(${(Math.random() - 0.5) * 30}px, ${(Math.random() - 0.5) * 30}px)`,
                }}
            />
        ))}
    </motion.div>
);

const GameBoard: React.FC<GameBoardProps> = ({ gameState, onCellClick }) => {
    const [particles, setParticles] = useState<{ id: number; x: string; y: string }[]>([]);

    // 清理粒子
    useEffect(() => {
        if (particles.length > 0) {
            const timer = setTimeout(() => {
                setParticles(prev => prev.slice(1));
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [particles]);

    const handleClick = (col: number, row: number, cell: Cell) => {
        playTapSound();
        onCellClick(col, row);

        // 显示粒子效果
        setParticles(prev => [...prev, { id: Date.now(), x: `${col * 33 + 16}%`, y: `${row * 25 + 12}%` }]);
    };

    return (
        <div className={`relative grid grid-cols-3 gap-2 px-1 transition-all duration-500 ${gameState.tutorialStep === 3 ? 'z-[1001] bg-white/20 p-4 rounded-3xl ring-4 ring-blue-400 scale-105 shadow-2xl' : ''}`}>
            {/* 粒子效果 */}
            <AnimatePresence>
                {particles.map(p => (
                    <Particles key={p.id} x={p.x} y={p.y} />
                ))}
            </AnimatePresence>

            {gameState.grid.map((column, colIdx) => (
                <div key={`col-${colIdx}`} className="flex flex-col gap-2 justify-center">
                    {column.map((cell: Cell, rowIdx: number) => {
                        if (!cell) return null;
                        const isSelected = (gameState.selectedNum?.source === 'grid' && gameState.selectedNum?.col === colIdx && gameState.selectedNum?.row === rowIdx) || (gameState.selectedOp?.col === colIdx && gameState.selectedOp?.row === rowIdx);
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
                            <motion.button
                                key={cell.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{
                                    opacity: 1,
                                    scale: isSelected ? 1.08 : 1,
                                    backgroundColor: isSelected ? '#2563eb' : (cell.type === 'operator' ? undefined : '#ffffff')
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleClick(colIdx, rowIdx, cell)}
                                className={`relative h-12 sm:h-16 w-full flex items-center justify-center rounded-[18px] text-lg font-bold ios-shadow ${cell.type === 'operator' ? 'bg-orange-50/80 text-orange-500 border border-orange-100' : 'bg-white text-black border border-white/50'} ${isSelected ? 'ring-4 ring-blue-500/30 !text-white !border-blue-600 shadow-lg' : ''} ${isGuided ? 'z-[1001] ring-4 ring-blue-500 animate-pulse !shadow-2xl' : ''}`}
                            >
                                {cell.value}
                            </motion.button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default GameBoard;
