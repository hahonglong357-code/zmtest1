import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState } from '../types';
import { Translations } from '../i18n';

interface TargetCardProps {
    gameState: GameState;
    timeLeft: number;
    maxTime: number;
    currentDiff: { label: string; color: string; bg: string; border: string } | null;
    t: Translations;
}

// 纸屑粒子组件
const ConfettiParticle: React.FC<{ delay: number; color: string; side: 'left' | 'right' }> = ({ delay, color, side }) => (
    <motion.div
        initial={{
            opacity: 1,
            x: side === 'left' ? -20 : 20,
            y: -30,
            rotate: 0,
            scale: 0.5
        }}
        animate={{
            opacity: 0,
            x: side === 'left' ? -80 - Math.random() * 40 : 80 + Math.random() * 40,
            y: 60 + Math.random() * 40,
            rotate: Math.random() * 360 * (side === 'left' ? 1 : -1),
            scale: 0
        }}
        transition={{
            duration: 0.8 + Math.random() * 0.4,
            delay: delay,
            ease: "easeOut"
        }}
        className="absolute top-0 pointer-events-none z-30"
        style={{
            width: 8,
            height: 8,
            backgroundColor: color,
            borderRadius: Math.random() > 0.5 ? '2px' : '50%'
        }}
    />
);

const TargetCard: React.FC<TargetCardProps> = ({ gameState, timeLeft, maxTime, currentDiff, t }) => {
    // 确保timeLeft不超过maxTime，避免进度条显示异常
    const effectiveTimeLeft = Math.min(timeLeft, maxTime);
    const progress = maxTime > 0 ? (effectiveTimeLeft / maxTime) * 100 : 0;
    const diffKey = `diff_${gameState.currentTarget.diff}` as keyof Translations;

    // 检测目标值变化，用于触发动画
    const [prevTarget, setPrevTarget] = useState(gameState.currentTarget.value);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (gameState.currentTarget.value !== prevTarget) {
            setShowConfetti(true);
            setPrevTarget(gameState.currentTarget.value);
            const timer = setTimeout(() => setShowConfetti(false), 1500);
            return () => clearTimeout(timer);
        }
    }, [gameState.currentTarget.value, prevTarget]);

    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <motion.div layout id="target-card" className={`relative w-full bg-white/80 ios-blur ios-shadow rounded-2xl p-4 flex flex-col items-center border border-white/50 transition-all duration-300 ${gameState.tutorialStep !== null && gameState.tutorialStep < 3 ? 'z-[1001] !bg-white scale-105 ring-4 ring-blue-400 shadow-2xl' : ''}`}>
            {/* 纸屑效果 */}
            <AnimatePresence>
                {showConfetti && (
                    <>
                        {colors.map((color, i) => (
                            <React.Fragment key={i}>
                                <ConfettiParticle delay={i * 0.03} color={color} side="left" />
                                <ConfettiParticle delay={i * 0.03 + 0.02} color={color} side="right" />
                            </React.Fragment>
                        ))}
                    </>
                )}
            </AnimatePresence>

            {/* 目标数字 */}
            <div className={`flex flex-col items-center transition-all ${gameState.tutorialStep === 0 ? 'scale-110' : ''}`}>
                <motion.div
                    key={gameState.currentTarget.value}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{
                        scale: 1,
                        opacity: 1,
                        transition: {
                            type: "spring",
                            stiffness: 300,
                            damping: 15
                        }
                    }}
                    whileInView={{ scale: [1, 1.2, 1] }}
                    viewport={{ once: false }}
                    className={`text-5xl font-black tracking-tighter leading-none ${currentDiff ? currentDiff.color : 'text-blue-600'}`}
                >
                    {gameState.currentTarget.value}
                </motion.div>
                <AnimatePresence mode="wait">
                    {currentDiff && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className={`mt-2 px-3 py-1 rounded-full text-xs font-black tracking-widest border ${currentDiff.bg} ${currentDiff.color} ${currentDiff.border}`}
                        >
                            {t[diffKey] as string}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 下一个目标 */}
            <div className={`mt-3 flex items-center gap-2 px-3 py-1 rounded-full transition-all ${gameState.tutorialStep === 1 ? 'bg-blue-600 !text-white ring-4 ring-blue-300 scale-105' : 'text-gray-400 bg-gray-100/50'}`}>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${gameState.tutorialStep === 1 ? 'text-blue-100' : 'text-gray-400'}`}>NEXT</span>
                <span className="text-sm font-bold">{gameState.nextTarget.value}</span>
            </div>

            {/* 倒计时进度条 */}
            <div className="w-full mt-4">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-500">Time</span>
                    <span className="text-xs font-mono font-bold text-gray-700">{effectiveTimeLeft.toFixed(1)}s</span>
                </div>
                <div className="w-full h-2 bg-gray-200/50 rounded-full overflow-hidden border border-gray-100/50">
                    <motion.div
                        className="h-full rounded-full"
                        initial={{ width: '100%' }}
                        animate={{
                            width: `${progress}%`,
                            background: progress < 30
                                ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                                : 'linear-gradient(90deg, #3b82f6, #2563eb)'
                        }}
                        transition={{ duration: 0.1, ease: "linear" }}
                        style={{
                            boxShadow: '0 0 8px rgba(37, 99, 235, 0.4)'
                        }}
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default TargetCard;
