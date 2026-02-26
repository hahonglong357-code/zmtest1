import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UI_CONFIG } from '../gameConfig';

interface ToastProps {
    message: string | null;
    onDismiss: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, onDismiss, duration }) => {
    const isError = useMemo(() => {
        if (!message) return false;
        const errorKeywords = ['不能', '零', 'err', 'Not', 'Cannot', 'Invalid'];
        return errorKeywords.some(kw => message.includes(kw));
    }, [message]);

    const displayDuration = duration ?? (isError ? 1500 : UI_CONFIG.TOAST_DISPLAY_MS);

    return (
        <AnimatePresence>
            {message && (
                <div className="absolute inset-0 flex items-center justify-center z-[5000] pointer-events-none p-4">
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1.02,
                        }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30
                        }}
                        className="pointer-events-auto flex items-center gap-3 px-6 py-3 rounded-2xl shadow-xl backdrop-blur-3xl border border-white/10 bg-[#1c1c1e]/90 text-white"
                        onAnimationComplete={() => {
                            const timer = setTimeout(onDismiss, displayDuration);
                            return () => clearTimeout(timer);
                        }}
                    >
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-blue-500/20">
                            <i className="fas fa-info-circle text-blue-400 text-sm"></i>
                        </div>
                        <span className="text-[15px] font-bold tracking-tight whitespace-nowrap">{message}</span>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Toast;
