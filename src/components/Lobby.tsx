/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Play, Plus, Users, Share2, Smartphone, Globe } from 'lucide-react';
import { useGameStore } from '../store';

export default function Lobby() {
  const [activeTab, setActiveTab] = useState<'single' | 'multi'>('single');
  const [roomCode, setRoomCode] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [winTarget, setWinTarget] = useState(7);

  const { startSinglePlayer, createRoom, joinRoom } = useGameStore();

  const generateCode = () => Math.floor(1000 + Math.random() * 9000).toString();

  const handleCreateRoom = () => {
    const code = customCode.trim() || generateCode();
    createRoom(code, winTarget);
  };

  return (
    <div className="w-full max-w-md space-y-6 p-6 glass-panel rounded-3xl">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-display font-bold text-white">Game Lobby</h2>
        <p className="text-slate-400 text-sm">Choose how you want to play</p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
        <button
          onClick={() => setActiveTab('single')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'single' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Smartphone size={16} />
          Pass & Play
        </button>
        <button
          onClick={() => setActiveTab('multi')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'multi' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Globe size={16} />
          Online
        </button>
      </div>

      <div className="space-y-6">
        {/* Win Target Slider (Shared) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Win Target</label>
            <span className="text-neon-cyan font-bold">{winTarget} Points</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="21" 
            value={winTarget} 
            onChange={(e) => setWinTarget(parseInt(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-cyan"
          />
        </div>

        {activeTab === 'single' ? (
          <button
            onClick={() => startSinglePlayer(winTarget)}
            className="w-full flex items-center justify-center gap-2 py-4 bg-neon-cyan text-slate-950 rounded-2xl font-bold hover:bg-cyan-400 transition-all active:scale-95"
          >
            <Play size={20} /> Start Local Game
          </button>
        ) : (
          <div className="space-y-6">
            {/* Create Room */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Create a Room</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={4}
                  placeholder="CUSTOM 4-DIGIT (OPTIONAL)"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-center font-mono font-bold tracking-widest focus:outline-none focus:border-neon-cyan/50 transition-all text-sm"
                />
                <button
                  onClick={handleCreateRoom}
                  className="px-6 bg-neon-cyan text-slate-950 rounded-2xl font-bold hover:bg-cyan-400 transition-all active:scale-95"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-950 px-4 text-slate-500 font-bold">Or Join Room</span>
              </div>
            </div>

            {/* Join Room */}
            <div className="space-y-3">
              <input
                type="text"
                maxLength={4}
                placeholder="ENTER 4-DIGIT CODE"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-center font-mono font-bold tracking-widest focus:outline-none focus:border-neon-rose/50 transition-all"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => joinRoom(roomCode, 'player2')}
                  disabled={roomCode.length !== 4}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-neon-rose text-white rounded-2xl font-bold hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Play size={18} /> Play
                </button>
                <button
                  onClick={() => joinRoom(roomCode, 'spectator')}
                  disabled={roomCode.length !== 4}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Users size={18} /> Spectate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
