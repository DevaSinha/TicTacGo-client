"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface MiniLeaderboardEntry {
  rank: number;
  username: string;
  wins: number;
  losses: number;
  draws: number;
  time: string;
  score: number;
  isCurrentUser: boolean;
}

interface MiniLeaderboardProps {
  entries: MiniLeaderboardEntry[];
}

export function MiniLeaderboard({ entries }: MiniLeaderboardProps) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-12 text-center">#</TableHead>
            <TableHead>Player</TableHead>
            <TableHead className="text-center">W/L/D</TableHead>
            <TableHead className="text-center">Time</TableHead>
            <TableHead className="text-right">Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow
              key={entry.rank}
              className={cn(
                "border-border transition-colors",
                entry.isCurrentUser &&
                  "bg-primary/10 font-semibold text-primary"
              )}
            >
              <TableCell className="text-center font-mono">
                {entry.rank}
              </TableCell>
              <TableCell className="truncate max-w-[100px]">
                {entry.username}
              </TableCell>
              <TableCell className="text-center font-mono text-xs">
                {entry.wins}/{entry.losses}/{entry.draws}
              </TableCell>
              <TableCell className="text-center font-mono text-xs">
                {entry.time}
              </TableCell>
              <TableCell className="text-right font-mono font-bold">
                {entry.score}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
