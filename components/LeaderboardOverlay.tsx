import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Translations } from '../i18n';

interface LeaderboardOverlayProps {
    isOpen: boolean;
    leaderboard: any[];
    onClose: () => void;
    t: Translations;
}

const LeaderboardOverlay: React.FC<LeaderboardOverlayProps> = ({ isOpen, leaderboard, onClose, t }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-0 z-[2500] bg-white flex flex-col pt-safe">
                <div className="flex justify-between items-center p-6 border-b border-gray-50">
                    <h2 className="text-xl font-black tracking-tight text-gray-800">{t.global_leaderboard}</h2>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 active:scale-90"><i className="fas fa-xmark text-lg"></i></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-3 no-scrollbar">
                    {leaderboard.length > 0 ? leaderboard.map((entry, i) => (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            key={entry.id}
                            className="flex items-center justify-between bg-gray-50 p-5 rounded-3xl border border-gray-100"
                        >
                            <div className="flex items-center gap-5">
                                <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold ${i < 3 ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}>{i + 1}</span>
                                <span className="font-bold text-gray-700">{entry.username}</span>
                            </div>
                            <span className="font-black text-xl text-emerald-600 tracking-tight">{entry.score}</span>
                        </motion.div>
                    )) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-300">
                            <i className="fas fa-trophy text-6xl mb-4 opacity-10"></i>
                            <p className="font-bold">{t.leaderboard_empty}</p>
                        </div>
                    )}
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

export default LeaderboardOverlay;
