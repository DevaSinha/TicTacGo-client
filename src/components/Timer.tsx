"use client";

import { cn } from "@/lib/utils";

interface TimerProps {
  seconds: number;
}

export function Timer({ seconds }: TimerProps) {
  const isUrgent = seconds <= 10;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1 rounded-lg px-4 py-2 font-mono text-3xl font-bold tabular-nums tracking-wider transition-all duration-300",
        isUrgent
          ? "animate-pulse bg-destructive/20 text-destructive ring-2 ring-destructive/40"
          : "bg-muted text-foreground"
      )}
      role="timer"
      aria-label={`${seconds} seconds remaining`}
    >
      <span>{String(minutes).padStart(1, "0")}</span>
      <span className={cn("animate-pulse", !isUrgent && "text-muted-foreground")}>:</span>
      <span>{String(secs).padStart(2, "0")}</span>
    </div>
  );
}
