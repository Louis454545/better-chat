import React from "react";
import { 
  ChatContainerRoot,
  ChatContainerContent,
  ChatContainerScrollAnchor
} from '@/components/ui/chat-container';
import { MessageList } from './message-display';
import type { Message, BaseComponentProps } from "@/shared/types";

interface ConversationViewProps extends BaseComponentProps {
  messages: Message[];
  isGenerating?: boolean;
  isEmpty?: boolean;
  emptyStateContent?: React.ReactNode;
}

export function ConversationView({ 
  messages, 
  isGenerating = false,
  isEmpty = false,
  emptyStateContent,
  className = "" 
}: ConversationViewProps) {
  if (isEmpty && emptyStateContent) {
    return (
      <div className={`flex-1 flex items-center justify-center ${className}`}>
        {emptyStateContent}
      </div>
    );
  }

  return (
    <ChatContainerRoot className={`h-full ${className}`}>
      <ChatContainerContent>
        <MessageList messages={messages} />
        <ChatContainerScrollAnchor />
      </ChatContainerContent>
    </ChatContainerRoot>
  );
}

interface EmptyConversationStateProps extends BaseComponentProps {
  title?: string;
  description?: string;
}

export function EmptyConversationState({ 
  title = "Start a new conversation",
  description = "Type a message below to begin chatting with AI",
  className = ""
}: EmptyConversationStateProps) {
  return (
    <div className={`text-center text-muted-foreground ${className}`}>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="mb-8">{description}</p>
    </div>
  );
}