"use client";

import { useQuery } from "convex/react";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, Plus, Settings } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import type { Id, Doc } from "@my-better-t-app/backend/convex/_generated/dataModel";

interface ConversationListProps {
  selectedConversationId?: Id<"conversations">;
  onSelectConversation: (conversationId: Id<"conversations">) => void;
  onNewConversation: () => void;
}

export function ConversationList({
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationListProps) {
  const conversations = useQuery(api.domains.conversations.index.getConversations);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <SignedIn>
          <Button onClick={onNewConversation} className="flex-1 mr-2">
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </SignedIn>
        <SignedOut>
          <div className="flex-1 mr-2 space-y-2">
            <SignInButton mode="modal">
              <Button variant="outline" className="w-full">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button className="w-full">
                Sign Up
              </Button>
            </SignUpButton>
          </div>
        </SignedOut>
        <div className="flex gap-2">
          <SignedIn>
            <Link href="/settings">
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <UserButton />
          </SignedIn>
          <ModeToggle />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <SignedIn>
          {conversations?.map((conversation: Doc<"conversations">) => (
            <Card
              key={conversation._id}
              className={`p-3 cursor-pointer transition-colors hover:bg-accent ${
                selectedConversationId === conversation._id
                  ? "bg-accent"
                  : ""
              }`}
              onClick={() => onSelectConversation(conversation._id)}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {conversation.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(conversation._creationTime).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </SignedIn>
        <SignedOut>
          <div className="text-center text-muted-foreground p-4">
            <p className="text-sm">Please sign in to view your conversations</p>
          </div>
        </SignedOut>
      </div>
    </div>
  );
}