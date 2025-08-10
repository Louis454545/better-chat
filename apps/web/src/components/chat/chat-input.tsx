"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, X } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import type { Id } from "@my-better-t-app/backend/convex/_generated/dataModel";

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: Id<"_storage">[]) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Array<{ id: Id<"_storage">; name: string; url: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        // Generate upload URL
        const uploadUrl = await generateUploadUrl();
        
        // Upload file
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        
        const { storageId } = await result.json();
        
        // Create a temporary URL for preview
        const tempUrl = URL.createObjectURL(file);
        
        setAttachments(prev => [...prev, {
          id: storageId,
          name: file.name,
          url: tempUrl
        }]);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = (id: Id<"_storage">) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id);
      if (attachment?.url.startsWith('blob:')) {
        URL.revokeObjectURL(attachment.url);
      }
      return prev.filter(a => a.id !== id);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || attachments.length > 0) && !disabled && !uploading) {
      onSendMessage(input.trim(), attachments.map(a => a.id));
      setInput("");
      
      // Clean up blob URLs
      attachments.forEach(attachment => {
        if (attachment.url.startsWith('blob:')) {
          URL.revokeObjectURL(attachment.url);
        }
      });
      setAttachments([]);
    }
  };

  return (
    <div className="border-t">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="p-4 pb-0">
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center gap-2 bg-secondary rounded-md px-3 py-2">
                <span className="text-sm text-foreground truncate max-w-32">
                  {attachment.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttachment(attachment.id)}
                  className="h-4 w-4 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-2 p-4">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf,.txt,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="shrink-0"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={disabled || uploading}
          className="flex-1"
        />
        
        <Button 
          type="submit" 
          disabled={disabled || uploading || (!input.trim() && attachments.length === 0)}
          className="shrink-0"
        >
          {uploading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}