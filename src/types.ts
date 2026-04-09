/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Player = 'X' | 'O';

export interface Move {
  index: number;
  player: Player;
  timestamp: number;
}

export interface GameState {
  board: (Player | null)[];
  currentPlayer: Player;
  winner: Player | 'Draw' | null;
  winningLine: number[] | null;
  movesX: number[];
  movesO: number[];
  scores: { X: number; O: number };
}

export interface Room {
  id: string; // 4-digit code
  winTarget: number;
  players: { userId: string; name: string; role: string; symbol?: Player }[];
  gameState: GameState;
}

export type UserRole = 'player1' | 'player2' | 'spectator';
export type GameMode = 'single' | 'multi' | null;
