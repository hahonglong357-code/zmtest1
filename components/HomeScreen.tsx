import React from 'react';
import { motion } from 'framer-motion';
import { Language, Translations } from '../i18n';

interface HomeScreenProps {
    personalHighScore: number;
    language: Language;
    onLanguageToggle: () => void;
    onShowTutorial: () => void;
    t: Translations;
    onStartGame: () => void;
    onShowLeaderboard: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
    personalHighScore, language, onLanguageToggle, onShowTutorial, t, onStartGame, onShowLeaderboard
}) => (
    <div className="h-dvh flex flex-col items-center justify-center bg-[#FDFDFD] p-8 text-center safe-top safe-bottom overflow-hidden relative">
        <div className="absolute top-8 right-8 z-20 flex gap-2">
            <button
                onClick={onShowTutorial}
                className="px-4 py-2 bg-white border border-gray-100 rounded-full text-[10px] font-black text-gray-300 shadow-sm active:scale-95 transition-all"
                title={t.tutorial_title}
            >
                <i className="fas fa-question mr-1"></i>
                {t.tutorial_title}
            </button>
            <button
                onClick={onLanguageToggle}
                className="px-4 py-2 bg-white border border-gray-100 rounded-full text-[10px] font-black text-gray-300 shadow-sm active:scale-95 transition-all"
            >
                {language === 'zh' ? 'EN' : '中文'}
            </button>
        </div>

        <div className="relative z-10 w-full flex flex-col items-center">
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-16 relative w-full max-w-xs"
            >
                <h1 className="text-6xl font-black tracking-tighter text-[#1E293B] leading-none mb-4 whitespace-nowrap">
                    BEYOND <span className="text-[#34D399]">24</span>
                </h1>

                <div className="flex items-center gap-4 mb-4">
                    <div className="h-[1px] flex-1 bg-gray-100"></div>
                    <div className="flex items-center gap-2 text-yellow-500">
                        <i className="fas fa-crown text-xs"></i>
                        <span className="text-[11px] font-bold text-gray-400 tracking-widest">{t.high_score}</span>
                    </div>
                    <div className="h-[1px] flex-1 bg-gray-100"></div>
                </div>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center"
                >
                    <div className="text-6xl font-black text-[#1E293B] tracking-tighter drop-shadow-sm">
                        {personalHighScore}
                    </div>
                </motion.div>
            </motion.div>

            <div className="flex flex-col gap-6 w-full max-w-[280px]">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onStartGame}
                    className="w-full py-5 bg-gradient-to-r from-[#A7F3D0] to-[#6EE7B7] text-[#065F46] rounded-[32px] font-black text-xl shadow-lg shadow-emerald-200/50 transition-all"
                >
                    {t.enter_game}
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onShowLeaderboard}
                    className="w-full py-5 bg-white text-[#1E293B] rounded-[32px] font-black text-xl shadow-sm border border-gray-100 active:bg-gray-50 transition-all"
                >
                    {t.leaderboard}
                </motion.button>
            </div>
        </div>

        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-12 text-[10px] text-gray-300 font-bold uppercase tracking-widest"
        >
            Powered by Gemini &amp; Supabase
        </motion.div>
    </div>
);

export default HomeScreen;
