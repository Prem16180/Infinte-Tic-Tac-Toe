/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Trophy, Copy, Check, Users, Wifi, ArrowLeft, Smartphone } from 'lucide-react';
import Square from './components/Square';
import WinLine from './components/WinLine';
import Lobby from './components/Lobby';
import { useGameStore } from './store';

export default function App() {
  const { room, role, mode, userId, makeMove, resetBoard, leaveGame } = useGameStore();
  const [copied, setCopied] = useState(false);

  const copyRoomCode = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-200">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-cyan/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-rose/10 rounded-full blur-[120px]" />
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 flex flex-col items-center gap-8 w-full max-w-md"
        >
          <div className="text-center space-y-2">
            <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-white">
              Infinite <span className="text-neon-cyan">Tic</span> <span className="text-neon-rose">Tac</span> Toe
            </h1>
            <p className="text-slate-400 text-sm sm:text-base font-medium">
              3 moves max. The oldest disappears.
            </p>
          </div>
          <Lobby />
        </motion.div>
      </div>
    );
  }

  const { gameState, winTarget } = room;
  
  // In single player, it's always "my turn"
  const isMyTurn = mode === 'single' || 
                   (role === 'player1' && gameState.currentPlayer === 'X') || 
                   (role === 'player2' && gameState.currentPlayer === 'O');
  
  const isOpponentThinking = mode === 'multi' && !isMyTurn && !gameState.winner;
  const finalWinner = gameState.scores.X >= winTarget ? 'X' : gameState.scores.O >= winTarget ? 'O' : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-200 selection:bg-neon-cyan/30">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-cyan/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-rose/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center gap-6 w-full max-w-md"
      >
        {/* Top Bar */}
        <div className="w-full flex items-center justify-between px-2">
          <button 
            onClick={leaveGame}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400"
          >
            <ArrowLeft size={20} />
          </button>
          
          {mode === 'multi' ? (
            <>
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Room:</span>
                <span className="text-xs font-mono font-bold text-white">{room.id}</span>
                <button onClick={copyRoomCode} className="text-neon-cyan hover:text-cyan-400 transition-colors">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-emerald-500">
                <Wifi size={14} />
                <span className="text-[10px] font-bold uppercase tracking-tighter hidden sm:inline">Online</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 text-slate-400">
              <Smartphone size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Pass & Play</span>
            </div>
          )}
        </div>

        {/* Score Board */}
        <div className="w-full grid grid-cols-2 gap-3">
          <div className={`glass-panel p-4 rounded-2xl border-l-4 border-neon-cyan transition-all duration-500 ${gameState.currentPlayer === 'X' ? 'ring-2 ring-neon-cyan/20 bg-neon-cyan/5' : 'opacity-60'}`}>
            <p className="text-[10px] uppercase font-bold tracking-widest text-neon-cyan">Player X</p>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-display font-bold text-white">{gameState.scores.X}</span>
              <span className="text-[10px] text-slate-500 font-bold mb-1">/ {winTarget}</span>
            </div>
          </div>
          <div className={`glass-panel p-4 rounded-2xl border-r-4 border-neon-rose transition-all duration-500 ${gameState.currentPlayer === 'O' ? 'ring-2 ring-neon-rose/20 bg-neon-rose/5' : 'opacity-60'}`}>
            <p className="text-[10px] uppercase font-bold tracking-widest text-neon-rose text-right">Player O</p>
            <div className="flex items-end justify-between flex-row-reverse">
              <span className="text-2xl font-display font-bold text-white">{gameState.scores.O}</span>
              <span className="text-[10px] text-slate-500 font-bold mb-1">/ {winTarget}</span>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="h-6">
          <AnimatePresence mode="wait">
            {isOpponentThinking && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs font-medium text-slate-500 italic flex items-center gap-2"
              >
                <motion.span 
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-1.5 h-1.5 bg-slate-500 rounded-full"
                />
                Opponent is thinking...
              </motion.p>
            )}
            {isMyTurn && mode === 'multi' && role !== 'spectator' && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs font-bold text-neon-cyan uppercase tracking-widest"
              >
                It's Your Turn!
              </motion.p>
            )}
            {mode === 'single' && !gameState.winner && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className={`text-xs font-bold uppercase tracking-widest ${gameState.currentPlayer === 'X' ? 'text-neon-cyan' : 'text-neon-rose'}`}
              >
                Player {gameState.currentPlayer}'s Turn
              </motion.p>
            )}
            {role === 'spectator' && mode === 'multi' && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2"
              >
                <Users size={14} /> Spectating Mode
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Game Board */}
        <div className="relative p-3 glass-panel rounded-3xl overflow-hidden">
          <div className="grid grid-cols-3 gap-3">
            {gameState.board.map((value, i) => (
              <Square
                key={i}
                value={value}
                onClick={() => makeMove(i)}
                isNextToDisappear={
                  (value === 'X' && gameState.movesX.length === 3 && gameState.movesX[0] === i && gameState.currentPlayer === 'X') ||
                  (value === 'O' && gameState.movesO.length === 3 && gameState.movesO[0] === i && gameState.currentPlayer === 'O')
                }
                disabled={!isMyTurn || !!gameState.winner || !!finalWinner}
              />
            ))}
          </div>
          <WinLine line={gameState.winningLine} />
        </div>

        {/* Board Controls */}
        <div className="flex gap-4">
          <button
            onClick={resetBoard}
            className="flex items-center gap-2 px-6 py-3 glass-panel hover:bg-white/10 rounded-xl text-sm font-semibold transition-colors"
          >
            <RotateCcw size={16} />
            Reset Board
          </button>
        </div>
      </motion.div>

      {/* Victory Overlay */}
      <AnimatePresence>
        {finalWinner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm glass-panel p-8 rounded-[40px] flex flex-col items-center text-center gap-6 border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className={`p-6 rounded-full ${finalWinner === 'X' ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-neon-rose/20 text-neon-rose'} animate-bounce`}>
                <Trophy size={64} />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-4xl font-display font-bold text-white">VICTORY!</h2>
                <p className="text-slate-400 font-medium">
                  Player {finalWinner} has reached the target of {winTarget} points.
                </p>
              </div>

              <div className="w-full grid grid-cols-2 gap-4 mt-4">
                <button
                  onClick={leaveGame}
                  className="py-4 glass-panel hover:bg-white/10 rounded-2xl font-bold transition-all"
                >
                  Lobby
                </button>
                <button
                  onClick={() => {
                    resetBoard();
                    // Reset scores locally since we don't have a backend to do it
                    useGameStore.setState(state => ({
                      room: state.room ? {
                        ...state.room,
                        gameState: {
                          ...state.room.gameState,
                          scores: { X: 0, O: 0 }
                        }
                      } : null
                    }));
                  }}
                  className={`py-4 rounded-2xl font-bold transition-all ${finalWinner === 'X' ? 'bg-neon-cyan text-slate-950' : 'bg-neon-rose text-white'}`}
                >
                  Rematch
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-8 text-slate-500 text-[10px] font-bold tracking-[0.2em] uppercase">
        Infinite Tic Tac Toe • v3.0
      </footer>
    </div>
  );
}
