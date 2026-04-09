/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';

interface WinLineProps {
  line: number[] | null;
}

export default function WinLine({ line }: WinLineProps) {
  if (!line) return null;

  // Calculate coordinates for the line based on the 3x3 grid
  // Indices:
  // 0 1 2
  // 3 4 5
  // 6 7 8
  
  const getCoords = (index: number) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    // Each square is roughly 33.33% of the board
    return {
      x: col * 33.33 + 16.66,
      y: row * 33.33 + 16.66
    };
  };

  const start = getCoords(line[0]);
  const end = getCoords(line[2]);

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100">
      <motion.line
        x1={`${start.x}%`}
        y1={`${start.y}%`}
        x2={`${end.x}%`}
        y2={`${end.y}%`}
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.8 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </svg>
  );
}
