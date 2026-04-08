"use client";

import { Button } from "@/components/ui/button";

interface SearchingStateProps {
  onCancel: () => void;
}

export function SearchingState({ onCancel }: SearchingStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      {/* Pulsing indicator */}
      <div className="relative flex items-center justify-center">
        <div className="absolute h-16 w-16 animate-ping rounded-full bg-primary/20" />
        <div className="absolute h-12 w-12 animate-pulse rounded-full bg-primary/30" />
        <div className="relative h-8 w-8 rounded-full bg-primary shadow-lg shadow-primary/40" />
      </div>

      <div className="mt-2 text-center">
        <p className="text-lg font-semibold text-foreground">
          Finding a match...
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          It usually takes few seconds
        </p>
      </div>

      <Button
        id="cancel-search"
        variant="ghost"
        size="lg"
        onClick={onCancel}
        className="mt-2"
      >
        Cancel
      </Button>
    </div>
  );
}
