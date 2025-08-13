"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import type { Id, Doc } from "@my-better-t-app/backend/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Plus, Settings, Edit2, Trash2 } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppSidebarProps {
  selectedConversationId?: Id<"conversations">;
  onSelectConversation: (conversationId: Id<"conversations">) => void;
  onNewConversation: () => void;
}

export function AppSidebar({
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
}: AppSidebarProps) {
  const [editingId, setEditingId] = useState<Id<"conversations"> | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const conversations = useQuery(api.domains.conversations.index.getConversations);
  const updateConversationTitle = useMutation(api.domains.conversations.index.updateConversationTitle);
  const deleteConversation = useMutation(api.domains.conversations.index.deleteConversation);

  const handleEditStart = (conversation: { _id: Id<"conversations">; title: string }) => {
    setEditingId(conversation._id);
    setEditTitle(conversation.title);
  };

  const handleEditSave = async () => {
    if (editingId && editTitle.trim()) {
      try {
        await updateConversationTitle({
          conversationId: editingId,
          title: editTitle.trim(),
        });
        setEditingId(null);
        setEditTitle("");
        toast.success("Conversation title updated");
      } catch (error) {
        console.error("Failed to update title:", error);
        toast.error("Failed to update title");
      }
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const handleDelete = async (conversationId: Id<"conversations">) => {
    try {
      await deleteConversation({ conversationId });
      if (selectedConversationId === conversationId) {
        // If we're deleting the currently selected conversation, clear the selection
        onSelectConversation(undefined as any);
      }
      toast.success("Conversation deleted");
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      toast.error("Failed to delete conversation");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEditSave();
    } else if (e.key === "Escape") {
      handleEditCancel();
    }
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <SignedIn>
          <Button onClick={onNewConversation} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </SignedIn>
        <SignedOut>
          <div className="space-y-2">
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
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SignedIn>
                {conversations?.map((conversation: Doc<"conversations">) => (
                  <SidebarMenuItem key={conversation._id}>
                    {editingId === conversation._id ? (
                      <div className="flex items-center gap-2 p-2">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={handleKeyPress}
                          onBlur={handleEditSave}
                          className="flex-1"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <>
                        <SidebarMenuButton
                          isActive={selectedConversationId === conversation._id}
                          onClick={() => onSelectConversation(conversation._id)}
                          className="w-full justify-start"
                        >
                          <span className="truncate text-sm font-medium">
                            {conversation.title}
                          </span>
                        </SidebarMenuButton>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SidebarMenuAction showOnHover>
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">More</span>
                            </SidebarMenuAction>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditStart(conversation)}
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit title
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(conversation._id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </SidebarMenuItem>
                ))}
              </SignedIn>
              <SignedOut>
                <div className="text-center text-muted-foreground p-4">
                  <p className="text-sm">Please sign in to view your conversations</p>
                </div>
              </SignedOut>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center justify-between gap-2">
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
      </SidebarFooter>
    </Sidebar>
  );
}