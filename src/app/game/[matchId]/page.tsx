"use client";

import { useEffect, useMemo, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GameBoard } from "@/components/GameBoard";
import { PlayerHeader } from "@/components/PlayerHeader";
import { Timer } from "@/components/Timer";
import { MiniLeaderboard } from "@/components/MiniLeaderboard";
import { useGameStore } from "@/store/gameStore";
import { useNakama } from "@/hooks/useNakama";

// ── Helpers ────────────────────────────────────────────────────────
const WIN_PATTERNS: [number, number, number][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function getWinningCells(board: string[]): number[] {
  for (const [a, b, c] of WIN_PATTERNS) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return [a, b, c];
    }
  }
  return [];
}

export default function GamePage() {
  const { matchId } = useParams<{ matchId: string }>();
  const router = useRouter();
  const { sendMove, joinMatch, leaveMatch } = useNakama();
  const [copied, setCopied] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const session = useGameStore((s) => s.session);
  const gameState = useGameStore((s) => s.gameState);
  const playerSymbol = useGameStore((s) => s.playerSymbol);
  const status = useGameStore((s) => s.status);
  const match = useGameStore((s) => s.match);
  const nickname = useGameStore((s) => s.nickname);
  const reset = useGameStore((s) => s.reset);

  const userId = session?.user_id ?? "";

  // Auto-join if navigated directly with a matchId but not in match
  useEffect(() => {
    if (isLeaving) return;
    if (!session) {
      router.replace("/");
      return;
    }
    if (!match && matchId) {
      joinMatch(matchId);
    }
  }, [session, match, matchId, joinMatch, router, isLeaving]);

  const board = gameState?.board ?? Array(9).fill("");
  const isMyTurn = gameState?.current_turn === userId;
  const isFinished = gameState?.status === "finished";
  const isTimed = gameState?.mode === "timed";
  const winningCells = useMemo(() => getWinningCells(board), [board]);

  // ── Opponent info ────────────────────────────────────────────────
  const opponentInfo = useMemo(() => {
    if (!gameState?.players) return { username: "Waiting...", symbol: null as "X" | "O" | null };
    for (const [uid, sym] of Object.entries(gameState.players)) {
      if (uid !== userId) {
        const presence = match?.presences?.find((p) => p.user_id === uid);
        const username = presence?.username || "Opponent";
        return { username, symbol: sym as "X" | "O" };
      }
    }
    return { username: "Waiting...", symbol: null as "X" | "O" | null };
  }, [gameState?.players, userId, match?.presences]);

  // ── Game over result ─────────────────────────────────────────────
  const gameResult = useMemo(() => {
    if (!isFinished || !gameState) return null;
    const winner = gameState.winner;
    if (winner === "draw") return { text: "Draw!", symbol: "🏆", delta: "" };
    if (winner === userId) return { text: "You won!", symbol: "✕", delta: "" };
    return { text: "You lost!", symbol: "○", delta: "" };
  }, [isFinished, gameState, userId]);

  const handleCellClick = useCallback(
    (index: number) => {
      if (!isMyTurn || isFinished || board[index] !== "") return;
      sendMove(index);
    },
    [isMyTurn, isFinished, board, sendMove]
  );

  const handlePlayAgain = () => {
    reset();
    router.push("/lobby");
  };

  const handleBackToLobby = async () => {
    setIsLeaving(true);
    if (matchId && leaveMatch) {
      await leaveMatch(matchId);
    } else {
      reset();
    }
    router.push("/lobby");
  };

  // ── Turn status text ─────────────────────────────────────────────
  const turnText = useMemo(() => {
    if (!gameState) return "Waiting for opponent...";
    if (gameState.status === "waiting") return "Waiting for opponent...";
    if (isFinished) return gameResult?.text ?? "Game Over";
    return isMyTurn ? "Your turn" : "Opponent's turn";
  }, [gameState, isMyTurn, isFinished, gameResult]);

  if (!session) return null;

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          {/* Opponent */}
          <PlayerHeader
            username={opponentInfo.username}
            label="opp"
            isActive={!isMyTurn && !isFinished && gameState?.status === "playing"}
            symbol={opponentInfo.symbol}
          />

          {/* Center status */}
          <div className="flex flex-col items-center">
            <span
              className={`text-xs font-semibold uppercase tracking-wide ${isMyTurn && !isFinished
                ? "text-primary"
                : "text-muted-foreground"
                }`}
            >
              {turnText}
            </span>
          </div>

          {/* You */}
          <PlayerHeader
            username={nickname || "You"}
            label="you"
            isActive={isMyTurn && !isFinished}
            symbol={playerSymbol}
          />
        </div>

        { }

        {/* Timer (timed mode only) */}
        {isTimed && gameState && gameState.status === "playing" && (
          <div className="mx-auto mt-3 flex max-w-lg justify-center">
            <Timer seconds={gameState.timer} />
          </div>
        )}
      </header>

      {/* Game board */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-8">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-15" />

        <div className="relative z-10 w-full max-w-lg">
          {!gameState || gameState.status === "waiting" ? (
            <div className="flex flex-col items-center gap-4 py-16">
              <div className="relative flex items-center justify-center">
                <div className="absolute h-16 w-16 animate-ping rounded-full bg-primary/20" />
                <div className="h-8 w-8 rounded-full bg-primary shadow-lg shadow-primary/40" />
              </div>
              <p className="text-lg font-semibold">Waiting for opponent...</p>
              {match && (
                <div className="mt-4 flex w-full max-w-sm flex-col gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-center text-sm font-medium text-muted-foreground">
                      Room Code
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <div className="flex h-12 flex-1 items-center justify-center rounded-md border border-input bg-card/50 px-3 font-mono text-xl tracking-widest text-primary select-all backdrop-blur-md">
                        {match.match_id}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 shrink-0 bg-card/50 backdrop-blur-md"
                        onClick={() => {
                          navigator.clipboard.writeText(match.match_id);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                      >
                        {copied ? (
                          <span className="text-xs font-bold text-primary">Copied!</span>
                        ) : (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleBackToLobby}
                    className="text-muted-foreground hover:text-foreground mt-2"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <GameBoard
              board={board}
              winningCells={winningCells}
              isMyTurn={isMyTurn}
              isFinished={isFinished}
              onCellClick={handleCellClick}
            />
          )}

          {/* Status bar */}
          {gameState?.status === "playing" && (
            <div className="mt-6 flex justify-center">
              <div
                className={`rounded-full px-4 py-1.5 text-sm font-medium ${isMyTurn
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
                  }`}
              >
                {isMyTurn
                  ? `You are ${playerSymbol} — tap to place`
                  : `Opponent is thinking...`}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Game over overlay */}
      {isFinished && gameResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
          <div className="mx-4 flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-border bg-card p-8 shadow-2xl shadow-primary/10">
            {/* Result symbol */}
            <div className="text-6xl">
              {gameResult.text === "Draw!" ? "🏆" : gameResult.text === "You won!" ? "🎉" : "😔"}
            </div>

            {/* Result text */}
            <div className="text-center">
              <h2 className="text-glow text-3xl font-black">{gameResult.text}</h2>
              <p className="mt-1 text-lg font-semibold text-primary">
                {gameResult.delta}
              </p>
            </div>

            {/* Actions */}
            <div className="flex w-full flex-col gap-3">
              <Button
                id="play-again"
                size="lg"
                onClick={handlePlayAgain}
                className="h-12 w-full font-semibold"
              >
                Play Again
              </Button>
              <Button
                id="back-to-lobby"
                variant="ghost"
                size="lg"
                onClick={handleBackToLobby}
                className="h-10 w-full"
              >
                Back to Lobby
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
