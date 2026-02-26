import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cell, GameState } from '../types';
import { playTapSound } from '../services/soundEffects';
import Toast from './Toast';
import { DIFFICULTY_BANNER_CONFIG } from '../gameConfig';

interface GameBoardProps {
    gameState: GameState;
    onCellClick: (col: number, row: number) => void;
    message: string | null;
    onDismissMessage: () => void;
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

const GameBoard: React.FC<GameBoardProps> = ({ gameState, onCellClick, message, onDismissMessage }) => {
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
        <div className={`relative grid grid-cols-3 gap-2 px-1 transition-all duration-700 p-2 rounded-3xl ${gameState.tutorialStep === 3 ? 'z-[1001] bg-blue-50/30 ring-1 ring-blue-500/20 scale-[1.01] shadow-[0_0_50px_rgba(59,130,246,0.15)]' : ''}`}>
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
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{
                                    opacity: 1,
                                    scale: isSelected ? 1.08 : 1,
                                    backgroundColor: isSelected ? '#2563eb' : (cell.type === 'operator' ? '#fffaf0' : '#ffffff')
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 800, // 高刚性，极其迅速
                                    damping: 35,    // 足够阻尼，防止过度晃动
                                    mass: 1
                                }}
                                whileTap={{ scale: 0.92 }}
                                onClick={() => handleClick(colIdx, rowIdx, cell)}
                                className={`relative h-12 sm:h-16 w-full flex items-center justify-center rounded-[18px] text-lg font-bold ios-shadow ${cell.type === 'operator' ? 'text-orange-500 border border-orange-100' : 'text-black border border-white/50'} ${isSelected ? 'ring-4 ring-blue-500/30 !text-white !border-blue-600 shadow-lg' : ''} ${isGuided ? 'z-[1001] !border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]' : ''}`}
                            >
                                {cell.value}
                                {isGuided && (
                                    <>
                                        {/* 引导声呐环 */}
                                        <motion.div
                                            initial={{ scale: 1, opacity: 0.5 }}
                                            animate={{ scale: 1.4, opacity: 0 }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            className="absolute inset-0 rounded-[18px] border-4 border-blue-500"
                                        />
                                        {/* 指导小手 */}
                                        <motion.div
                                            animate={{ y: [0, -8, 0], scale: [1, 1.1, 1] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                            className="absolute -top-10 left-1/2 -translate-x-1/2 text-blue-600 text-3xl drop-shadow-md z-20"
                                        >
                                            <i className="fas fa-hand-point-down"></i>
                                        </motion.div>
                                    </>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            ))}

            {/* 中心提示框 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[2000]">
                <Toast
                    message={message}
                    onDismiss={onDismissMessage}
                    duration={DIFFICULTY_BANNER_CONFIG.DISPLAY_SECONDS * 1000}
                />
            </div>
        </div>
    );
};

export default GameBoard;
