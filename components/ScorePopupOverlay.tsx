import React from 'react';
import { motion } from 'framer-motion';
import { ScorePopup } from '../hooks/useGameCore';

interface ScorePopupOverlayProps {
  popups: ScorePopup[];
}

const ScorePopupOverlay: React.FC<ScorePopupOverlayProps> = ({ popups }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {popups.map((popup) => (
        <motion.div
          key={popup.id}
          initial={{ opacity: 0, scale: 0.5, y: 0 }}
          animate={{ opacity: 1, scale: 1.2, y: -60 }}
          exit={{ opacity: 0, y: -80 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute"
          style={{
            left: '50%',
            top: '15%',
            transform: 'translateX(-50%)',
          }}
        >
          <div className="flex flex-col items-center">
            <motion.span
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="text-3xl font-black text-amber-500 drop-shadow-lg"
              style={{ textShadow: '0 2px 8px rgba(251, 191, 36, 0.4)' }}
            >
              +{popup.amount}
            </motion.span>
            <motion.div
              initial={{ opacity: 1, scale: 0.8 }}
              animate={{ opacity: 0, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="w-2 h-2 bg-amber-400 rounded-full mt-1"
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ScorePopupOverlay;
