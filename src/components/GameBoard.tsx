"use client";

import { cn } from "@/lib/utils";

interface GameBoardProps {
  board: string[];
  winningCells: number[];
  isMyTurn: boolean;
  isFinished: boolean;
  onCellClick: (index: number) => void;
}

export function GameBoard({
  board,
  winningCells,
  isMyTurn,
  isFinished,
  onCellClick,
}: GameBoardProps) {
  return (
    <div className="mx-auto grid w-full max-w-[320px] grid-cols-3 gap-2 sm:max-w-[360px] sm:gap-3">
      {board.map((cell, i) => {
        const isWinner = winningCells.includes(i);
        const isEmpty = cell === "";
        const canClick = isEmpty && isMyTurn && !isFinished;

        return (
          <button
            key={i}
            id={`cell-${i}`}
            disabled={!canClick}
            onClick={() => onCellClick(i)}
            className={cn(
              "flex aspect-square min-h-[80px] items-center justify-center rounded-xl border-2 text-4xl font-bold transition-all duration-200 sm:min-h-[100px] sm:text-5xl",
              isWinner
                ? "border-primary bg-primary/20 text-primary scale-[1.03] shadow-lg shadow-primary/20"
                : "border-border bg-card text-card-foreground",
              canClick &&
                "cursor-pointer hover:border-primary/50 hover:bg-primary/5 active:scale-95",
              !canClick && isEmpty && !isFinished && "cursor-not-allowed opacity-60",
              isFinished && !isWinner && "opacity-40"
            )}
            aria-label={
              cell
                ? `Cell ${i + 1}: ${cell}`
                : `Cell ${i + 1}: empty${canClick ? ", click to place" : ""}`
            }
          >
            {cell === "X" && (
              <span className={cn("text-sky-400", isWinner && "text-primary animate-pulse")}>
                ✕
              </span>
            )}
            {cell === "O" && (
              <span className={cn("text-rose-400", isWinner && "text-primary animate-pulse")}>
                ○
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
