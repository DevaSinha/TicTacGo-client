"use client";

import { cn } from "@/lib/utils";

interface AvatarProps {
  username: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export function Avatar({ username, size = "md", className }: AvatarProps) {
  const initial = username.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground ring-2 ring-primary/30",
        sizeMap[size],
        className
      )}
      aria-label={`Avatar for ${username}`}
    >
      {initial}
    </div>
  );
}
