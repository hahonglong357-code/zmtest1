import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScorePopup } from '../hooks/useGameCore';

interface ScorePopupOverlayProps {
  popups: ScorePopup[];
}

const ScorePopupOverlay: React.FC<ScorePopupOverlayProps> = ({ popups }) => {
  const getTypeStyles = (type: ScorePopup['type']) => {
    switch (type) {
      case 'combo': return { color: '#3b82f6', fontSize: 'text-sm', icon: 'fa-fire' };
      case 'perfect': return { color: '#10b981', fontSize: 'text-lg', icon: 'fa-check-circle' };
      case 'speed': return { color: '#8b5cf6', fontSize: 'text-xs', icon: 'fa-bolt' };
      default: return { color: '#f59e0b', fontSize: 'text-xl', icon: 'fa-coins' };
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {popups.map((popup) => {
          const style = getTypeStyles(popup.type);
          return (
            <motion.div
              key={popup.id}
              initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
              animate={{ opacity: 1, scale: 1.1, x: 0, y: -40 }}
              exit={{ opacity: 0, scale: 0.8, x: 0, y: -60 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="absolute pointer-events-none"
              style={{
                left: `${popup.x}%`,
                top: `${popup.y}%`,
              }}
            >
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1.5 drop-shadow-md">
                  {style.icon && <i className={`fas ${style.icon} ${style.fontSize} opacity-80`} style={{ color: style.color }}></i>}
                  <span
                    className={`${style.fontSize} font-black drop-shadow-lg`}
                    style={{
                      color: style.color,
                      textShadow: `0 2px 10px ${style.color}44`
                    }}
                  >
                    {typeof popup.amount === 'number' ? `+${popup.amount}` : popup.amount}
                  </span>
                </div>
                {popup.label && (
                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-[10px] font-black tracking-tighter uppercase whitespace-nowrap"
                    style={{ color: style.color }}
                  >
                    {popup.label}
                  </motion.span>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ScorePopupOverlay;
