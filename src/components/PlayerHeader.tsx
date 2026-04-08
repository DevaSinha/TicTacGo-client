"use client";

import { Avatar } from "@/components/Avatar";
import { cn } from "@/lib/utils";

interface PlayerHeaderProps {
  username: string;
  label: "you" | "opp";
  isActive: boolean;
  symbol: "X" | "O" | null;
  className?: string;
}

export function PlayerHeader({
  username,
  label,
  isActive,
  symbol,
  className,
}: PlayerHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-300",
        isActive
          ? "bg-primary/10 ring-1 ring-primary/30"
          : "opacity-60",
        className
      )}
    >
      <Avatar username={username} size="sm" />
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold truncate max-w-[80px] sm:max-w-[120px]">
          {username}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
          {symbol && (
            <span
              className={cn(
                "ml-1 font-bold",
                symbol === "X" ? "text-sky-400" : "text-rose-400"
              )}
            >
              {symbol}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
