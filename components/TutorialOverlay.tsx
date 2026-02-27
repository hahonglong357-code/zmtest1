import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Translations } from '../i18n';

interface TutorialOverlayProps {
    tutorialStep: number;
    hintText: string;
    onNextStep: () => void;
    t: Translations;
    position?: 'top' | 'bottom'; // 提示框是在高亮区上方还是下方
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ tutorialStep, hintText, onNextStep, t, position = 'bottom' }) => (
    <AnimatePresence mode="wait">
        <motion.div
            key={tutorialStep}
            initial={{ opacity: 0, y: position === 'bottom' ? 20 : -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`absolute ${position === 'bottom' ? 'top-full mt-6' : 'bottom-full mb-6'} left-0 right-0 z-[2000] flex justify-center pointer-events-none`}
        >
            {/* 提示卡片内容容器 */}
            <div className={`relative w-[calc(100vw-32px)] max-w-[320px] ${tutorialStep >= 4 ? 'pointer-events-none' : 'pointer-events-auto'}`}>
                {/* 气泡尖角 */}
                <div
                    className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-tr-sm rotate-45 border-black/5 ${position === 'bottom' ? '-top-2 bg-white/95 border-l border-t' : '-bottom-2 bg-[#1c1c1e] border-r border-b'}`}
                    style={{
                        backdropFilter: 'blur(12px)',
                        background: position === 'bottom' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(28, 28, 30, 0.95)'
                    }}
                />

                {/* 提示主卡片 */}
                <div className={`relative overflow-hidden p-5 rounded-[24px] ios-shadow border ${position === 'bottom' ? 'bg-white/95 border-white text-gray-900' : 'bg-[#1c1c1e]/95 border-white/10 text-white'}`} style={{ backdropFilter: 'blur(16px)' }}>
                    {/* 装饰性背景光晕 */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -translate-y-12 translate-x-12" />

                    <div className="flex gap-4 items-start relative z-10">
                        {/* 导师头像 */}
                        <div className={`w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 ${position === 'bottom' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`}>
                            <i className={`fas ${tutorialStep < 4 ? 'fa-lightbulb' : 'fa-robot'} text-lg`}></i>
                        </div>

                        <div className="flex-grow">
                            <h3 className={`text-[13px] font-black uppercase tracking-widest mb-1 ${position === 'bottom' ? 'text-blue-600' : 'text-blue-400'}`}>
                                {tutorialStep < 4 ? t.tutorial_title : t.tutorial_follow}
                            </h3>
                            <p className={`text-[14px] font-medium leading-[1.4] mb-4 ${position === 'bottom' ? 'text-gray-600' : 'text-gray-300'}`}>
                                {hintText}
                            </p>

                            {tutorialStep < 4 ? (
                                <button
                                    onClick={onNextStep}
                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[13px] active:scale-95 transition-all shadow-lg shadow-blue-500/20 uppercase tracking-wide"
                                >
                                    {t.tutorial_next}
                                </button>
                            ) : (
                                <div className="flex items-center gap-2 text-white font-black animate-pulse text-[12px] uppercase tracking-wider">
                                    <i className="fas fa-hand-point-down"></i>
                                    <span>{t.tutorial_click_hint}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    </AnimatePresence>
);

export default TutorialOverlay;
