/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { X, Circle } from 'lucide-react';
import { Player } from '../types';

interface SquareProps {
  value: Player | null;
  onClick: () => void;
  isNextToDisappear: boolean;
  disabled: boolean;
  key?: string | number;
}

export default function Square({ value, onClick, isNextToDisappear, disabled }: SquareProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || value !== null}
      className={`
        relative h-24 w-24 sm:h-32 sm:w-32 flex items-center justify-center
        glass-panel rounded-xl transition-all duration-300
        ${value === null && !disabled ? 'hover:bg-white/10 cursor-pointer' : 'cursor-default'}
        ${isNextToDisappear ? 'ring-2 ring-white/20' : ''}
      `}
      id={`square-${Math.random().toString(36).substr(2, 9)}`}
    >
      <AnimatePresence mode="wait">
        {value === 'X' && (
          <motion.div
            key="X"
            initial={{ scale: 0, rotate: -45, opacity: 0 }}
            animate={{ 
              scale: 1, 
              rotate: 0, 
              opacity: isNextToDisappear ? 0.5 : 1,
            }}
            exit={{ scale: 0, rotate: 45, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="neon-shadow-cyan"
          >
            <motion.div
              animate={isNextToDisappear ? {
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.05, 1],
              } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <X size={64} className="text-neon-cyan stroke-[3px]" />
            </motion.div>
          </motion.div>
        )}
        {value === 'O' && (
          <motion.div
            key="O"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: isNextToDisappear ? 0.5 : 1,
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="neon-shadow-rose"
          >
            <motion.div
              animate={isNextToDisappear ? {
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.05, 1],
              } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Circle size={56} className="text-neon-rose stroke-[3px]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
