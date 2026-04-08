"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar } from "@/components/Avatar";
import { useGameStore } from "@/store/gameStore";
import { nakamaClient } from "@/lib/nakama";
import type { LeaderboardRecord } from "@/types";
import toast from "react-hot-toast";

const RANK_BADGES: Record<number, { label: string; className: string }> = {
  1: { label: "🥇", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  2: { label: "🥈", className: "bg-slate-400/20 text-slate-300 border-slate-400/30" },
  3: { label: "🥉", className: "bg-orange-600/20 text-orange-400 border-orange-600/30" },
};

export default function LeaderboardPage() {
  const router = useRouter();
  const session = useGameStore((s) => s.session);
  const [records, setRecords] = useState<LeaderboardRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);

  const fetchLeaderboard = useCallback(async () => {
    if (!session) return;
    try {
      const res = await nakamaClient.rpc(session, "get_leaderboard", {});
      const payload = res.payload;
      let data: LeaderboardRecord[];

      if (typeof payload === "string") {
        data = JSON.parse(payload);
      } else {
        data = payload as unknown as LeaderboardRecord[];
      }

      setRecords(
        data.map((r: Record<string, unknown>) => ({
          userId: (r.user_id ?? r.userId ?? "") as string,
          username: (r.username ?? "") as string,
          wins: (r.wins ?? r.score ?? 0) as number,
          losses: (r.losses ?? 0) as number,
          streak: (r.streak ?? 0) as number,
          score: (r.score ?? 0) as number,
        }))
      );
    } catch {
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (!session) {
      router.replace("/");
      return;
    }
    fetchLeaderboard();
  }, [session, router, fetchLeaderboard]);

  const visibleRecords = records.slice(0, limit);

  if (!session) return null;

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md sm:px-6">
        <Button
          id="leaderboard-back"
          variant="ghost"
          size="sm"
          onClick={() => router.push("/lobby")}
        >
          ← Back
        </Button>
        <h1 className="text-lg font-bold">Leaderboard</h1>
      </header>

      <main className="relative flex-1 px-4 py-6 sm:px-6">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-15" />

        <div className="relative z-10 mx-auto w-full max-w-2xl">
          {loading ? (
            <div className="flex flex-col items-center gap-4 py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Loading leaderboard...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16">
              <span className="text-4xl">🏆</span>
              <p className="text-muted-foreground">No records yet. Play a game to get started!</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-border bg-card/50 backdrop-blur-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="w-16 text-center">Rank</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead className="text-center">W</TableHead>
                      <TableHead className="text-center">L</TableHead>
                      <TableHead className="text-center">Streak</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleRecords.map((record, index) => {
                      const rank = index + 1;
                      const isCurrentUser = record.userId === session.user_id;
                      const badge = RANK_BADGES[rank];

                      return (
                        <TableRow
                          key={record.userId}
                          className={`border-border transition-colors ${
                            isCurrentUser
                              ? "bg-primary/10 font-semibold"
                              : ""
                          }`}
                        >
                          <TableCell className="text-center">
                            {badge ? (
                              <Badge
                                variant="outline"
                                className={`text-base ${badge.className}`}
                              >
                                {badge.label}
                              </Badge>
                            ) : (
                              <span className="font-mono text-muted-foreground">
                                {rank}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar
                                username={record.username}
                                size="sm"
                              />
                              <span className="truncate max-w-[120px]">
                                {record.username}
                              </span>
                              {isCurrentUser && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] text-primary border-primary/30"
                                >
                                  YOU
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-mono text-emerald-400">
                            {record.wins}
                          </TableCell>
                          <TableCell className="text-center font-mono text-rose-400">
                            {record.losses}
                          </TableCell>
                          <TableCell className="text-center font-mono text-amber-400">
                            {record.streak}
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold text-primary">
                            {record.score}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {records.length > limit && (
                <div className="mt-4 flex justify-center">
                  <Button
                    id="load-more"
                    variant="ghost"
                    onClick={() => setLimit((prev) => prev + 10)}
                  >
                    Load more
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
