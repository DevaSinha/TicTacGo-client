"use client";

import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Session, Socket, MatchData } from "@heroiclabs/nakama-js";
import toast from "react-hot-toast";

import { nakamaClient } from "@/lib/nakama";
import { useGameStore } from "@/store/gameStore";
import { OpCode, GameStateSchema, TimerUpdateSchema } from "@/types";

let globalSocket: Socket | null = null;
let globalSession: Session | null = null;

function getDeviceId(): string {
  if (typeof window === "undefined") return uuidv4();
  let id = localStorage.getItem("nakama_device_id");
  if (!id) {
    id = uuidv4();
    localStorage.setItem("nakama_device_id", id);
  }
  return id;
}

export function useNakama() {
  const {
    setSession,
    setNickname,
    setMatch,
    updateGameState,
    setSearching,
    setFinished,
    reset,
  } = useGameStore();

  // ── Message handler (one place) ──────────────────────────────────
  const handleMatchData = useCallback(
    (matchData: MatchData) => {
      const opCode = matchData.op_code;
      const rawData = matchData.data;

      let parsed: unknown;
      try {
        const decoded =
          typeof rawData === "string"
            ? rawData
            : new TextDecoder().decode(rawData as Uint8Array);
        parsed = JSON.parse(decoded);
      } catch {
        return;
      }

      const userId = globalSession?.user_id ?? "";

      switch (opCode) {
        case OpCode.StateUpdate: {
          const result = GameStateSchema.safeParse(parsed);
          if (result.success) {
            updateGameState(result.data, userId);
            if (result.data.current_turn === userId) {
              toast("It\u2019s your turn", { icon: "\u2728" });
            }
          }
          break;
        }
        case OpCode.GameOver: {
          const result = GameStateSchema.safeParse(parsed);
          if (result.success) {
            updateGameState(result.data, userId);
            setFinished();
          }
          break;
        }
        case OpCode.TimerUpdate: {
          const result = TimerUpdateSchema.safeParse(parsed);
          if (result.success) {
            const store = useGameStore.getState();
            if (store.gameState) {
              updateGameState(
                { ...store.gameState, timer: result.data.timer },
                userId
              );
            }
          }
          break;
        }
        case OpCode.OpponentLeft: {
          toast("Opponent left the match", { icon: "\u26A0\uFE0F" });
          const result = GameStateSchema.safeParse(parsed);
          if (result.success) {
            updateGameState(result.data, userId);
            setFinished();
          }
          break;
        }
      }
    },
    [updateGameState, setFinished]
  );

  // ── Connect ──────────────────────────────────────────────────────
  const connect = useCallback(
    async (nickname: string): Promise<Session> => {
      const deviceId = getDeviceId();

      const session = await nakamaClient.authenticateDevice(
        deviceId,
        true,
        nickname
      );
      globalSession = session;
      setSession(session);
      setNickname(nickname);

      const socket = nakamaClient.createSocket(
        process.env.NEXT_PUBLIC_NAKAMA_USE_SSL === "true",
        false
      );

      socket.onmatchdata = handleMatchData;

      socket.onmatchpresence = (presences) => {
        const store = useGameStore.getState();
        if (store.match) {
          const current = store.match.presences || [];
          const newPresences = [...current];
          presences.joins?.forEach((j) => {
            if (!newPresences.find((p) => p.user_id === j.user_id)) newPresences.push(j);
          });
          presences.leaves?.forEach((l) => {
            const idx = newPresences.findIndex((p) => p.user_id === l.user_id);
            if (idx !== -1) newPresences.splice(idx, 1);
          });
          store.setMatch({ ...store.match, presences: newPresences });
        }
      };

      socket.onmatchmakermatched = async (matched) => {
        if (!matched.match_id) return;
        toast.success("Match found!");
        const match = await socket.joinMatch(matched.match_id);
        const presences = [...(match.presences || [])];
        if (match.self && !presences.find((p) => p.user_id === match.self?.user_id)) {
          presences.push(match.self);
        }
        setMatch({ match_id: match.match_id, presences });
      };

      socket.ondisconnect = () => {
        globalSocket = null;
      };

      socket.onerror = (err) => {
        console.error("Nakama socket error:", err);
        toast.error("Connection error");
      };

      await socket.connect(session, true);
      globalSocket = socket;

      return session;
    },
    [handleMatchData, setSession, setNickname, setMatch]
  );

  // ── Disconnect ───────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    globalSocket?.disconnect(false);
    globalSocket = null;
    globalSession = null;
    reset();
  }, [reset]);

  // ── Send Move ────────────────────────────────────────────────────
  const sendMove = useCallback((position: number) => {
    const socket = globalSocket;
    const match = useGameStore.getState().match;
    if (!socket || !match) return;
    socket.sendMatchState(match.match_id, OpCode.Move, JSON.stringify({ position }));
  }, []);

  // ── Matchmaker ───────────────────────────────────────────────────
  const joinMatchmaker = useCallback(
    async (mode: "classic" | "timed") => {
      const socket = globalSocket;
      if (!socket) {
        toast.error("Socket not connected");
        return;
      }
      setSearching();
      await socket.addMatchmaker("*", 2, 2, {
        mode: mode,
      });
    },
    [setSearching]
  );

  const leaveMatchmaker = useCallback(
    async (ticket: string) => {
      const socket = globalSocket;
      if (!socket) return;
      await socket.removeMatchmaker(ticket);
      reset();
    },
    [reset]
  );

  // ── Private Rooms ────────────────────────────────────────────────
  const createMatch = useCallback(async (): Promise<string | null> => {
    const session = globalSession;
    if (!session) {
      toast.error("Not authenticated");
      return null;
    }

    const rpcResponse = await nakamaClient.rpc(session, "create_match", {
      mode: "classic",
    });
    const payload = rpcResponse.payload as string | Record<string, string>;
    let matchId: string;

    if (typeof payload === "string") {
      matchId = JSON.parse(payload).match_id;
    } else {
      matchId = (payload as Record<string, string>).match_id;
    }

    const socket = globalSocket;
    if (!socket) {
      toast.error("Socket not connected");
      return null;
    }

    const match = await socket.joinMatch(matchId);
    const presences = [...(match.presences || [])];
    if (match.self && !presences.find((p) => p.user_id === match.self?.user_id)) {
      presences.push(match.self);
    }
    setMatch({ match_id: match.match_id, presences });
    return match.match_id;
  }, [setMatch]);

  const joinMatch = useCallback(
    async (matchId: string) => {
      const socket = globalSocket;
      if (!socket) {
        toast.error("Socket not connected");
        return;
      }

      const match = await socket.joinMatch(matchId);
      const presences = [...(match.presences || [])];
      if (match.self && !presences.find((p) => p.user_id === match.self?.user_id)) {
        presences.push(match.self);
      }
      setMatch({ match_id: match.match_id, presences });
    },
    [setMatch]
  );

  const leaveMatch = useCallback(
    async (matchId: string) => {
      const socket = globalSocket;
      if (socket) {
        try {
          await socket.leaveMatch(matchId);
        } catch (e) {
          console.error("Failed to leave match cleanly", e);
        }
      }
      reset();
    },
    [reset]
  );

  return {
    connect,
    disconnect,
    sendMove,
    joinMatchmaker,
    leaveMatchmaker,
    createMatch,
    joinMatch,
    leaveMatch,
  };
}
