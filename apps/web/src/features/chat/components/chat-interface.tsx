import React, { memo } from "react";
import { ConversationView, EmptyConversationState } from "./conversation-view";
import { ChatInput } from "./chat-input";
import type { 
  Message, 
  FileAttachment,
  BaseComponentProps,
  MessageHandler,
  ModelChangeHandler,
  FileSelectHandler,
  FileRemoveHandler 
} from "@/shared/types";
import { GOOGLE_MODELS } from "@/shared/types";

interface ChatInterfaceProps extends BaseComponentProps {
  // Conversation data
  messages?: Message[];
  hasSelectedConversation: boolean;
  
  // Input state
  input: string;
  onInputChange: (value: string) => void;
  attachments: FileAttachment[];
  
  // Model selection
  selectedModel: string;
  onModelChange: ModelChangeHandler;
  
  // File handling
  onFileSelect: FileSelectHandler;
  onRemoveAttachment: FileRemoveHandler;
  
  // Actions
  onSendMessage: MessageHandler;
  
  // Loading states
  isGenerating?: boolean;
  isUploading?: boolean;
  
  // Customization
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  newConversationPlaceholder?: string;
}

export const ChatInterface = memo(function ChatInterface({
  messages = [],
  hasSelectedConversation,
  input,
  onInputChange,
  attachments,
  selectedModel,
  onModelChange,
  onFileSelect,
  onRemoveAttachment,
  onSendMessage,
  isGenerating = false,
  isUploading = false,
  emptyStateTitle,
  emptyStateDescription,
  newConversationPlaceholder,
  className = ""
}: ChatInterfaceProps) {
  if (hasSelectedConversation) {
    return (
      <div className={`max-w-4xl mx-auto p-6 relative flex-1 w-full ${className}`}>
        <div className="flex flex-col h-full">
          <ConversationView 
            messages={messages}
            isGenerating={isGenerating}
          />
          
          <ChatInput
            input={input}
            onInputChange={onInputChange}
            onSubmit={onSendMessage}
            attachments={attachments}
            onFileSelect={onFileSelect}
            onRemoveAttachment={onRemoveAttachment}
            selectedModel={selectedModel}
            onModelChange={onModelChange}
            isGenerating={isGenerating}
            isUploading={isUploading}
            placeholder="Type your message..."
            models={GOOGLE_MODELS}
            fileInputId="file-upload"
          />
        </div>
      </div>
    );
  }

  // New conversation state
  return (
    <div className={`flex-1 flex flex-col ${className}`}>
      <ConversationView
        messages={[]}
        isEmpty={true}
        emptyStateContent={
          <EmptyConversationState 
            title={emptyStateTitle}
            description={emptyStateDescription}
          />
        }
      />
      
      {/* Chat input for starting new conversations */}
      <div className="max-w-4xl mx-auto w-full p-6">
        <ChatInput
          input={input}
          onInputChange={onInputChange}
          onSubmit={onSendMessage}
          attachments={attachments}
          onFileSelect={onFileSelect}
          onRemoveAttachment={onRemoveAttachment}
          selectedModel={selectedModel}
          onModelChange={onModelChange}
          isGenerating={isGenerating}
          isUploading={isUploading}
          placeholder={newConversationPlaceholder || "Type your message to start a new conversation..."}
          models={GOOGLE_MODELS}
          fileInputId="file-upload-new"
        />
      </div>
    </div>
  );
});