"use client";

import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isAssistant = role === "assistant";

  return (
    <div
      className={cn(
        "flex w-full gap-3 p-4",
        isAssistant ? "bg-muted/50" : "bg-background"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow",
          isAssistant
            ? "bg-primary text-primary-foreground"
            : "bg-background"
        )}
      >
        {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="prose max-w-none break-words dark:prose-invert">
          {content}
        </div>
        <div className="text-xs text-muted-foreground">
          {new Date(timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}