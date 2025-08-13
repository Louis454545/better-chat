import React from "react";
import { useQuery } from "convex/react";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import type { Id } from "@my-better-t-app/backend/convex/_generated/dataModel";
import type { Message, BaseComponentProps } from "@/shared/types";
import { 
  Message as PromptKitMessage, 
  MessageContent 
} from '@/components/ui/message';

interface AttachmentDisplayProps {
  storageId: Id<"_storage">;
}

export function AttachmentDisplay({ storageId }: AttachmentDisplayProps) {
  const fileUrl = useQuery(api.domains.files.index.getFileUrl, { storageId });
  const metadata = useQuery(api.domains.files.index.getFileMetadata, { storageId });

  if (!fileUrl || !metadata) return null;

  const isImage = metadata.contentType?.startsWith('image/');
  
  return (
    <div className="border rounded-md p-2 bg-secondary/50">
      {isImage ? (
        <img 
          src={fileUrl} 
          alt="Uploaded image" 
          className="max-w-xs max-h-48 rounded object-cover"
        />
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="text-sm font-medium truncate">
              File attachment
            </div>
            <div className="text-xs text-muted-foreground">
              {metadata.contentType} • {(metadata.size / 1024).toFixed(1)} KB
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface MessageItemProps extends BaseComponentProps {
  message: Message;
}

export function MessageItem({ message, className = "" }: MessageItemProps) {
  const isUser = message.role === "user";
  
  return (
    <PromptKitMessage className={`${isUser ? "justify-end" : "justify-start"} ${className}`}>
      <div className={`rounded-lg p-3 ${isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
        {/* Show attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="space-y-2 mb-2">
            {message.attachments.map((storageId: Id<"_storage">) => (
              <AttachmentDisplay key={storageId} storageId={storageId} />
            ))}
          </div>
        )}
        
        {/* Show message content */}
        {message.content && (
          <MessageContent markdown className="bg-transparent p-0 text-inherit">
            {message.content}
          </MessageContent>
        )}
      </div>
    </PromptKitMessage>
  );
}

interface MessageListProps extends BaseComponentProps {
  messages: Message[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading = false, className = "" }: MessageListProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {messages.map((message) => (
        <MessageItem key={message._id} message={message} />
      ))}
    </div>
  );
}