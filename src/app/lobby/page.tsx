"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar } from "@/components/Avatar";
import { SearchingState } from "@/components/SearchingState";
import { useGameStore } from "@/store/gameStore";
import { useNakama } from "@/hooks/useNakama";
import toast from "react-hot-toast";

type GameMode = "classic" | "timed";

export default function LobbyPage() {
  const router = useRouter();
  const { nickname, status, match, session } = useGameStore();
  const { joinMatchmaker, leaveMatchmaker, createMatch, joinMatch } =
    useNakama();

  const [mode, setMode] = useState<GameMode>("classic");
  const [joinCode, setJoinCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [matchmakerTicket, setMatchmakerTicket] = useState("");

  // Redirect to login if no session
  useEffect(() => {
    if (!session) {
      router.replace("/");
    }
  }, [session, router]);

  // Navigate to game when match is found
  useEffect(() => {
    if (match && status === "in_match") {
      router.push(`/game/${match.match_id}`);
    }
  }, [match, status, router]);

  const handleFindMatch = async () => {
    try {
      await joinMatchmaker(mode);
    } catch {
      toast.error("Failed to join matchmaker");
    }
  };

  const handleCancelSearch = async () => {
    try {
      if (matchmakerTicket) {
        await leaveMatchmaker(matchmakerTicket);
      }
      useGameStore.getState().reset();
    } catch {
      toast.error("Failed to cancel search");
    }
  };

  const handleCreateRoom = async () => {
    setCreating(true);
    try {
      const matchId = await createMatch();
      if (matchId) {
        toast.success(`Room created! Code: ${matchId.slice(0, 8)}...`);
        router.push(`/game/${matchId}`);
      }
    } catch {
      toast.error("Failed to create room");
    } finally {
      setCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    const code = joinCode.trim();
    if (!code) {
      toast.error("Enter a room code");
      return;
    }
    setJoining(true);
    try {
      await joinMatch(code);
    } catch {
      toast.error("Failed to join room. Check the code and try again.");
    } finally {
      setJoining(false);
    }
  };

  if (!session) return null;

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight text-primary">
            TicTacGo
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{nickname}</span>
          <Avatar username={nickname || "?"} size="sm" />
        </div>
      </header>

      <main className="relative flex flex-1 flex-col items-center px-4 py-8 sm:px-6">
        {/* Background grid */}
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-20" />

        <div className="relative z-10 w-full max-w-3xl space-y-6">
          {/* Cards row */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Quick Match Card */}
            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Match</CardTitle>
                <CardDescription>
                  Jump in and play against a random opponent
                </CardDescription>
              </CardHeader>
              <CardContent>
                {status === "searching" ? (
                  <SearchingState onCancel={handleCancelSearch} />
                ) : (
                  <div className="flex flex-col gap-4">
                    {/* Mode toggle */}
                    <div className="flex rounded-lg bg-muted p-1">
                      <button
                        id="mode-classic"
                        onClick={() => setMode("classic")}
                        className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                          mode === "classic"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Classic
                      </button>
                      <button
                        id="mode-timed"
                        onClick={() => setMode("timed")}
                        className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                          mode === "timed"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Timed (30s)
                      </button>
                    </div>

                    <Button
                      id="find-match"
                      size="lg"
                      onClick={handleFindMatch}
                      className="h-11 w-full font-semibold"
                    >
                      Find Match
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Create Room Card */}
            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Create Room</CardTitle>
                <CardDescription>
                  Create a private room and share the code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  id="create-room"
                  size="lg"
                  variant="secondary"
                  onClick={handleCreateRoom}
                  disabled={creating}
                  className="h-11 w-full font-semibold"
                >
                  {creating ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
                      Creating...
                    </span>
                  ) : (
                    "Create Room"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Join a Room */}
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Join a Room</CardTitle>
              <CardDescription>
                Enter the room code shared by your friend
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  id="join-code-input"
                  type="text"
                  placeholder="Paste room code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="h-11 flex-1 font-mono"
                />
                <Button
                  id="join-room"
                  size="lg"
                  onClick={handleJoinRoom}
                  disabled={joining || !joinCode.trim()}
                  className="h-11 font-semibold"
                >
                  {joining ? "Joining..." : "Join"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard link */}
          <div className="flex justify-center">
            <Button
              id="view-leaderboard"
              variant="ghost"
              onClick={() => router.push("/leaderboard")}
              className="text-muted-foreground hover:text-primary"
            >
              View Leaderboard →
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
