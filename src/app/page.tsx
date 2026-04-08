"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNakama } from "@/hooks/useNakama";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const { connect } = useNakama();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed || trimmed.length < 1) {
      toast.error("Nickname must be at least 1 characters");
      return;
    }
    if (trimmed.length > 16) {
      toast.error("Nickname must be 16 characters or less");
      return;
    }

    setLoading(true);
    try {
      await connect(trimmed);
      router.push("/lobby");
    } catch (err: any) {
      console.error("Connection failed:", err);
      const errorMessage = err.message || "Failed to connect to the server. Please try again later.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4">
      {/* Background grid */}
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-30" />

      {/* Gradient glow */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-8">
        {/* Logo / App name */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-2xl font-black text-primary-foreground shadow-lg shadow-primary/30">
              ✕
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-primary text-2xl font-black text-primary shadow-lg shadow-primary/30">
              ○
            </div>
          </div>
          <h1 className="text-glow mt-4 text-4xl font-black tracking-tight">
            TicTacGo
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time multiplayer Tic-Tac-Toe
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
          <Input
            id="nickname-input"
            type="text"
            placeholder="Enter your nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={16}
            autoFocus
            className="h-12 text-center text-lg"
          />
          <Button
            id="continue-button"
            type="submit"
            size="lg"
            disabled={loading || nickname.trim().length < 2}
            className="h-12 text-base font-semibold"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Connecting...
              </span>
            ) : (
              "Continue"
            )}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground/60">
          No account needed — just pick a name and play
        </p>
      </div>
    </main>
  );
}
