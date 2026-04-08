import { create } from "zustand";
import type { Session } from "@heroiclabs/nakama-js";
import type { GameState, StoreStatus } from "@/types";

interface NakamaMatch {
  match_id: string;
  presences?: import("@heroiclabs/nakama-js").Presence[];
}

interface GameStore {
  // State
  session: Session | null;
  nickname: string;
  match: NakamaMatch | null;
  gameState: GameState | null;
  playerSymbol: "X" | "O" | null;
  status: StoreStatus;

  // ── Actions ──────────────────────────────────────────────────────
  setSession: (session: Session) => void;
  setNickname: (nickname: string) => void;
  setMatch: (match: NakamaMatch) => void;
  updateGameState: (state: GameState, userId: string) => void;
  setSearching: () => void;
  setFinished: () => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  session: null,
  nickname: "",
  match: null,
  gameState: null,
  playerSymbol: null,
  status: "idle",

  setSession: (session) => set({ session }),
  setNickname: (nickname) => set({ nickname }),
  setMatch: (match) => set({ match, status: "in_match" }),

  updateGameState: (gameState, userId) =>
    set(() => {
      const symbol = gameState.players[userId];
      return {
        gameState,
        playerSymbol: (symbol as "X" | "O") ?? null,
        status: gameState.status === "finished" ? "finished" : "in_match",
      };
    }),

  setSearching: () => set({ status: "searching" }),
  setFinished: () => set({ status: "finished" }),

  reset: () =>
    set({
      match: null,
      gameState: null,
      playerSymbol: null,
      status: "idle",
    }),
}));
