/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { supabase } from './lib/supabase';
import { GameState, Room, UserRole, Player, GameMode } from './types';
import { nanoid } from 'nanoid';
import confetti from 'canvas-confetti';

const initialGameState: GameState = {
  board: Array(9).fill(null),
  currentPlayer: 'X',
  winner: null,
  winningLine: null,
  movesX: [],
  movesO: [],
  scores: { X: 0, O: 0 }
};

interface GameStore {
  mode: GameMode;
  room: Room | null;
  role: UserRole | null;
  userId: string;
  channel: any | null;
  
  setMode: (mode: GameMode) => void;
  startSinglePlayer: (winTarget: number) => void;
  createRoom: (roomId: string, winTarget: number) => void;
  joinRoom: (roomId: string, requestedRole: UserRole) => void;
  makeMove: (index: number) => void;
  resetBoard: () => void;
  leaveGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  mode: null,
  room: null,
  role: null,
  userId: localStorage.getItem('tic-tac-toe-user-id') || (() => {
    const id = nanoid();
    localStorage.setItem('tic-tac-toe-user-id', id);
    return id;
  })(),
  channel: null,

  setMode: (mode) => set({ mode }),

  startSinglePlayer: (winTarget) => {
    set({
      mode: 'single',
      role: 'player1', // In single player, you control both, but we set a default
      room: {
        id: 'LOCAL',
        winTarget,
        players: [{ userId: get().userId, name: 'Local', role: 'player1', symbol: 'X' }],
        gameState: { ...initialGameState }
      }
    });
  },

  createRoom: (roomId, winTarget) => {
    if (!supabase) {
      alert("Supabase keys are missing! Please provide them in the Secrets panel.");
      return;
    }

    const channel = supabase.channel(`room-${roomId}`, {
      config: { broadcast: { self: true } }
    });

    const initialRoom: Room = {
      id: roomId,
      winTarget,
      players: [{ userId: get().userId, name: 'Player 1', role: 'player1', symbol: 'X' }],
      gameState: { ...initialGameState }
    };

    channel
      .on('broadcast', { event: 'sync-request' }, () => {
        // Someone joined, send them the current state
        channel.send({
          type: 'broadcast',
          event: 'sync-response',
          payload: { room: get().room }
        });
      })
      .on('broadcast', { event: 'join-request' }, (payload) => {
        const currentRoom = get().room;
        if (!currentRoom) return;
        
        const { userId, requestedRole } = payload.payload;
        let newPlayers = [...currentRoom.players];
        let assignedRole = requestedRole;

        if (requestedRole === 'player2') {
          if (newPlayers.some(p => p.role === 'player2')) {
            assignedRole = 'spectator'; // Fallback if full
          } else {
            newPlayers.push({ userId, name: 'Player 2', role: 'player2', symbol: 'O' });
          }
        } else if (requestedRole === 'spectator') {
          newPlayers.push({ userId, name: 'Spectator', role: 'spectator' });
        }

        const updatedRoom = { ...currentRoom, players: newPlayers };
        set({ room: updatedRoom });

        channel.send({
          type: 'broadcast',
          event: 'sync-response',
          payload: { room: updatedRoom }
        });
      })
      .on('broadcast', { event: 'state-update' }, (payload) => {
        set({ room: payload.payload.room });
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          set({
            mode: 'multi',
            role: 'player1',
            room: initialRoom,
            channel
          });
        }
      });
  },

  joinRoom: (roomId, requestedRole) => {
    if (!supabase) {
      alert("Supabase keys are missing! Please provide them in the Secrets panel.");
      return;
    }

    const channel = supabase.channel(`room-${roomId}`, {
      config: { broadcast: { self: true } }
    });

    channel
      .on('broadcast', { event: 'sync-response' }, (payload) => {
        const room = payload.payload.room;
        const myPlayer = room.players.find((p: any) => p.userId === get().userId);
        set({ room, role: myPlayer ? myPlayer.role : requestedRole });
      })
      .on('broadcast', { event: 'state-update' }, (payload) => {
        set({ room: payload.payload.room });
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          set({ mode: 'multi', channel });
          // Request to join
          channel.send({
            type: 'broadcast',
            event: 'join-request',
            payload: { userId: get().userId, requestedRole }
          });
        }
      });
  },

  makeMove: (index) => {
    const { room, role, mode, channel } = get();
    if (!room) return;

    // In single player, any click is valid if it's on an empty square
    // In multi player, check role
    if (mode === 'multi') {
      if (!role || role === 'spectator') return;
      const playerSymbol = role === 'player1' ? 'X' : 'O';
      if (room.gameState.currentPlayer !== playerSymbol) return;
    }

    if (room.gameState.board[index] || room.gameState.winner) return;

    const playerSymbol = room.gameState.currentPlayer;
    const newBoard = [...room.gameState.board];
    newBoard[index] = playerSymbol;

    let newMovesX = [...room.gameState.movesX];
    let newMovesO = [...room.gameState.movesO];

    if (playerSymbol === 'X') {
      newMovesX.push(index);
      if (newMovesX.length > 3) {
        const oldestMove = newMovesX.shift();
        if (oldestMove !== undefined) newBoard[oldestMove] = null;
      }
    } else {
      newMovesO.push(index);
      if (newMovesO.length > 3) {
        const oldestMove = newMovesO.shift();
        if (oldestMove !== undefined) newBoard[oldestMove] = null;
      }
    }

    // Check winner
    const WINNING_COMBINATIONS = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    let winner: Player | null = null;
    let winningLine: number[] | null = null;

    for (const combination of WINNING_COMBINATIONS) {
      const [a, b, c] = combination;
      if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
        winner = newBoard[a];
        winningLine = combination;
        break;
      }
    }

    const newScores = { ...room.gameState.scores };
    if (winner) {
      newScores[winner]++;
      if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: winner === 'X' ? ['#06b6d4', '#ffffff'] : ['#f43f5e', '#ffffff']
      });
    } else {
      if ('vibrate' in navigator) navigator.vibrate(50);
    }

    const nextGameState: GameState = {
      ...room.gameState,
      board: newBoard,
      currentPlayer: playerSymbol === 'X' ? 'O' : 'X',
      winner,
      winningLine,
      movesX: newMovesX,
      movesO: newMovesO,
      scores: newScores
    };

    const updatedRoom = { ...room, gameState: nextGameState };
    set({ room: updatedRoom });

    if (mode === 'multi' && channel) {
      channel.send({
        type: 'broadcast',
        event: 'state-update',
        payload: { room: updatedRoom }
      });
    }

    if (winner && newScores[winner] < room.winTarget) {
      setTimeout(() => {
        get().resetBoard();
      }, 2000);
    }
  },

  resetBoard: () => {
    const { room, mode, channel } = get();
    if (!room) return;

    const updatedRoom = {
      ...room,
      gameState: {
        ...room.gameState,
        board: Array(9).fill(null),
        currentPlayer: 'X' as Player,
        winner: null,
        winningLine: null,
        movesX: [],
        movesO: []
      }
    };

    set({ room: updatedRoom });

    if (mode === 'multi' && channel) {
      channel.send({
        type: 'broadcast',
        event: 'state-update',
        payload: { room: updatedRoom }
      });
    }
  },

  leaveGame: () => {
    const { channel } = get();
    if (channel) {
      supabase?.removeChannel(channel);
    }
    set({ room: null, role: null, mode: null, channel: null });
  }
}));
