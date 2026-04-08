import { z } from "zod";

// ── OpCodes (must match server) ──────────────────────────────────────
export enum OpCode {
  Move = 1,
  StateUpdate = 2,
  GameOver = 3,
  TimerUpdate = 4,
  OpponentLeft = 5,
}

// ── Zod schemas for incoming WebSocket payloads ──────────────────────
export const GameStateSchema = z.object({
  board: z.array(z.string()).length(9),
  players: z.record(z.string(), z.string()),
  current_turn: z.string(),
  status: z.enum(["waiting", "playing", "finished"]),
  winner: z.string(),
  timer: z.number(),
  mode: z.enum(["classic", "timed"]),
});

export const MoveMessageSchema = z.object({
  position: z.number().int().min(0).max(8),
});

export const TimerUpdateSchema = z.object({
  timer: z.number(),
});

// ── Derived TypeScript types ─────────────────────────────────────────
export type GameState = z.infer<typeof GameStateSchema>;

export type MoveMessage = z.infer<typeof MoveMessageSchema>;

export type TimerUpdate = z.infer<typeof TimerUpdateSchema>;

export type LeaderboardRecord = {
  userId: string;
  username: string;
  wins: number;
  losses: number;
  streak: number;
  score: number;
};

// ── Store status ─────────────────────────────────────────────────────
export type StoreStatus = "idle" | "searching" | "in_match" | "finished";
