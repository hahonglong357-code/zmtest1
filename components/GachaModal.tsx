import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GachaResult, GachaItemResult, GachaEventResult } from '../types';
import { Translations } from '../i18n';
import { GACHA_EVENTS } from '../gameConfig';

interface GachaModalProps {
    isOpen: boolean;
    isDrawing: boolean;
    drawResult: GachaResult | null;
    onDraw: () => void;
    onClaim: () => void;
    t: Translations;
}

// 获取道具图标
const getItemIcon = (type: string) => {
    switch (type) {
        case 'number': return { icon: 'fa-user-secret', bg: 'bg-blue-50', text: 'text-blue-500' };
        case 'timer': return { icon: 'fa-stopwatch', bg: 'bg-rose-50', text: 'text-rose-500' };
        case 'refresh': return { icon: 'fa-sync-alt', bg: 'bg-emerald-50', text: 'text-emerald-500' };
        case 'score': return { icon: 'fa-gift', bg: 'bg-amber-50', text: 'text-amber-500' };
        default: return { icon: 'fa-question', bg: 'bg-gray-50', text: 'text-gray-500' };
    }
};

const GachaModal: React.FC<GachaModalProps> = ({ isOpen, isDrawing, drawResult, onDraw, onClaim, t }) => {
    const hasStartedRef = useRef(false);

    // 打开弹窗时自动开始抽卡
    useEffect(() => {
        if (isOpen && !hasStartedRef.current) {
            hasStartedRef.current = true;
            onDraw();
        }
        // 弹窗关闭时重置标记
        if (!isOpen) {
            hasStartedRef.current = false;
        }
    }, [isOpen, onDraw]);

    // 渲染道具内容
    const renderItemContent = (result: GachaItemResult) => {
        const itemInfo = getItemIcon(result.item.type);

        return (
            <>
                {/* 叙事文案 */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4"
                >
                    <p className="text-gray-600 text-sm leading-relaxed font-medium">
                        {result.narrativeText}
                    </p>
                </motion.div>

                {/* 道具图标 */}
                <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
                    className={`w-24 h-24 ${itemInfo.bg} rounded-3xl flex items-center justify-center mb-4 ios-shadow`}
                >
                    {result.item.type === 'number' ? (
                        <span className="text-5xl font-black text-blue-600">{result.item.value}</span>
                    ) : (
                        <i className={`fas ${itemInfo.icon} ${itemInfo.text} text-4xl`}></i>
                    )}
                </motion.div>

                {/* 道具名称 */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-3"
                >
                    <span className="text-xl font-black text-gray-900">{result.itemName}</span>
                    {result.item.type === 'number' && result.item.value && (
                        <span className="text-blue-500 ml-2">×{result.item.value}</span>
                    )}
                </motion.div>
            </>
        );
    };

    // 渲染事件内容
    const renderEventContent = (result: GachaEventResult) => {
        const event = GACHA_EVENTS.find(e => e.id === result.eventId);
        if (!event) return null;

        return (
            <>
                {/* 事件图标 */}
                <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
                    className={`w-24 h-24 ${event.iconColor.replace('text', 'bg')} bg-opacity-20 rounded-3xl flex items-center justify-center mb-4 ios-shadow`}
                >
                    <i className={`fas ${event.icon} ${event.iconColor} text-4xl`}></i>
                </motion.div>

                {/* 事件文案 */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="px-4 py-3 bg-amber-50 rounded-xl mb-4"
                >
                    <p className="text-gray-700 text-sm leading-relaxed font-medium">
                        {result.eventText}
                    </p>
                </motion.div>

                {/* 事件标记 */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-2 text-amber-600"
                >
                    <i className="fas fa-exclamation-triangle text-xs"></i>
                    <span className="text-xs font-bold uppercase tracking-widest">
                        {result.eventId === 'time_half' ? '时间惩罚' : '道具损失'}
                    </span>
                </motion.div>
            </>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[2000] bg-black/60 ios-blur flex items-center justify-center p-6"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 30 }}
                        animate={{ scale: 1, y: 0 }}
                        className="bg-white rounded-[32px] p-8 w-full max-w-xs ios-shadow text-center relative overflow-hidden"
                    >
                        {/* 标题 */}
                        <motion.h2
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-2xl font-black mb-6 tracking-tight"
                        >
                            刚刚发生了
                        </motion.h2>

                        {/* 内容区域 */}
                        <div className="min-h-[220px] flex flex-col items-center justify-center">
                            {isDrawing ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 0.5, ease: 'linear' }}
                                    className="text-5xl text-blue-600"
                                >
                                    <i className="fas fa-spinner"></i>
                                </motion.div>
                            ) : drawResult ? (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex flex-col items-center w-full"
                                >
                                    {drawResult.resultType === 'item'
                                        ? renderItemContent(drawResult as GachaItemResult)
                                        : renderEventContent(drawResult as GachaEventResult)
                                    }
                                </motion.div>
                            ) : null}
                        </div>

                        {/* 按钮 */}
                        {!isDrawing && drawResult && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mt-6"
                            >
                                <button
                                    onClick={onClaim}
                                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold active:scale-95"
                                >
                                    OK
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default GachaModal;
