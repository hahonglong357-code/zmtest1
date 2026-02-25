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
    // 移除数字显示的逻辑截断，允许显示超过 maxTime 的数值
    const effectiveTimeLeft = timeLeft;
    // 进度条依然受限在 0-100% 之间，防止超出容器
    const progress = maxTime > 0 ? Math.min(100, (effectiveTimeLeft / maxTime) * 100) : 0;
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
        <motion.div layout id="target-card" className={`relative w-full bg-white/80 ios-blur ios-shadow rounded-2xl p-3 flex flex-col items-center border border-white/50 transition-all duration-300 ${gameState.tutorialStep !== null && gameState.tutorialStep < 3 ? 'z-[1001] !bg-white scale-105 ring-4 ring-blue-400 shadow-2xl' : ''}`}>
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
            <div className={`flex flex-col items-center transition-all ${gameState.tutorialStep === 0 ? 'scale-105' : ''}`}>
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
                    whileInView={{ scale: [1, 1.1, 1] }}
                    viewport={{ once: false }}
                    className={`text-6xl font-black tracking-tighter leading-none ${currentDiff ? currentDiff.color : 'text-blue-600'}`}
                >
                    {gameState.currentTarget.value}
                </motion.div>
                {/* 移除难度标识 (普通/困难等) */}
            </div>

            {/* 下一个目标 */}
            <div className={`mt-2 flex items-center gap-2 px-3 py-1 rounded-full transition-all ${gameState.tutorialStep === 1 ? 'bg-blue-600 !text-white ring-4 ring-blue-300 scale-105' : 'text-gray-400 bg-gray-100/40'}`}>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${gameState.tutorialStep === 1 ? 'text-blue-100' : 'text-gray-400'}`}>NEXT</span>
                <span className="text-base font-bold">{gameState.nextTarget.value}</span>
            </div>

            {/* 倒计时进度条 - 优化设计 */}
            <div className="w-full mt-3 px-1">
                <div className="flex justify-between items-end mb-1">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1 mt-0.5">
                            <i className={`fas fa-bolt text-[9px] ${progress > 70 ? 'text-blue-500' : progress > 40 ? 'text-purple-500' : 'text-red-400'}`}></i>
                            <span className="text-[9px] font-black text-gray-500 uppercase">
                                {progress > 70 ? 'Super Fast' : progress > 40 ? 'Fast' : 'Normal'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-base font-mono font-black tracking-tighter ${effectiveTimeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-gray-900'}`}>
                            {effectiveTimeLeft.toFixed(1)}
                        </span>
                        <span className="text-[9px] font-black text-gray-400">SEC</span>
                    </div>
                </div>

                <div className="relative w-full h-2 bg-gray-100 rounded-full border border-gray-200/30 ios-shadow-inner group">
                    {/* 倍率关键点刻度 */}
                    <div className="absolute inset-0 z-10 pointer-events-none">
                        {/* 70% 刻度 */}
                        <div className="absolute left-[70%] top-[-4px] bottom-[-4px] w-[2px] bg-white shadow-sm z-20">
                            <span className="absolute bottom-[-14px] left-1/2 -translate-x-1/2 text-[8px] font-black text-blue-500/60">x1.5</span>
                        </div>
                        {/* 40% 刻度 */}
                        <div className="absolute left-[40%] top-[-4px] bottom-[-4px] w-[2px] bg-white shadow-sm z-20">
                            <span className="absolute bottom-[-14px] left-1/2 -translate-x-1/2 text-[8px] font-black text-purple-500/60">x1.2</span>
                        </div>
                        {/* 起始点标识 */}
                        <span className="absolute bottom-[-14px] left-0 text-[8px] font-black text-red-400/60 text-left">x1.0</span>
                    </div>

                    {/* 进度主条 */}
                    <div className="absolute inset-0 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full"
                            initial={{ width: '100%' }}
                            animate={{
                                width: `${progress}%`,
                                background: progress < 40
                                    ? 'linear-gradient(90deg, #f87171, #ef4444)' // Normal
                                    : progress < 70
                                        ? 'linear-gradient(90deg, #a78bfa, #8b5cf6)' // Fast
                                        : 'linear-gradient(90deg, #60a5fa, #3b82f6)' // Super Fast
                            }}
                            transition={{ duration: 0.1, ease: "linear" }}
                        />
                    </div>

                    {/* 光晕追随器 */}
                    <motion.div
                        className="absolute top-0 bottom-0 w-4 z-20"
                        animate={{
                            left: `${progress}%`,
                            opacity: progress > 0 ? 1 : 0
                        }}
                        style={{
                            background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
                            transform: 'translateX(-50%)'
                        }}
                    />
                </div>
                {/* 增加一些底部边距防止遮挡 */}
                <div className="h-4"></div>
            </div>
        </motion.div>
    );
};

export default TargetCard;
