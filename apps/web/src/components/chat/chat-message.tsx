"use client";

import { cn } from "@/lib/utils";
import { Bot, User, Download } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import type { Id } from "@my-better-t-app/backend/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  attachments?: Id<"_storage">[];
}

function AttachmentPreview({ storageId }: { storageId: Id<"_storage"> }) {
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(fileUrl, '_blank')}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function ChatMessage({ role, content, timestamp, attachments }: ChatMessageProps) {
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
        {/* Attachments */}
        {attachments && attachments.length > 0 && (
          <div className="space-y-2">
            {attachments.map((storageId) => (
              <AttachmentPreview key={storageId} storageId={storageId} />
            ))}
          </div>
        )}
        
        {/* Message content */}
        {content && (
          <div className="prose max-w-none break-words dark:prose-invert">
            {content}
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          {new Date(timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}