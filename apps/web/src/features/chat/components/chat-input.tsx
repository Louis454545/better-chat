import React from "react";
import { Button } from "@/components/ui/button";
import { X, Paperclip } from "lucide-react";
import {
  PromptInput,
  PromptInputButton,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import type { 
  FileAttachment, 
  AIModel, 
  BaseComponentProps,
  MessageHandler,
  ModelChangeHandler,
  FileSelectHandler,
  FileRemoveHandler 
} from "@/shared/types";
import { GOOGLE_MODELS } from "@/shared/types";

interface AttachmentPreviewProps extends BaseComponentProps {
  attachments: FileAttachment[];
  onRemoveAttachment: FileRemoveHandler;
}

export function AttachmentPreview({ 
  attachments, 
  onRemoveAttachment,
  className = "" 
}: AttachmentPreviewProps) {
  if (attachments.length === 0) return null;

  return (
    <div className={`p-4 pb-0 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {attachments.map((attachment) => (
          <div 
            key={attachment.id} 
            className="flex items-center gap-2 bg-secondary rounded-md px-3 py-2"
          >
            <span className="text-sm text-foreground truncate max-w-32">
              {attachment.name}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemoveAttachment(attachment.id)}
              className="h-4 w-4 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ChatInputProps extends BaseComponentProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: MessageHandler;
  attachments: FileAttachment[];
  onFileSelect: FileSelectHandler;
  onRemoveAttachment: FileRemoveHandler;
  selectedModel: string;
  onModelChange: ModelChangeHandler;
  isGenerating?: boolean;
  isUploading?: boolean;
  placeholder?: string;
  models?: AIModel[];
  fileInputId?: string;
}

export function ChatInput({
  input,
  onInputChange,
  onSubmit,
  attachments,
  onFileSelect,
  onRemoveAttachment,
  selectedModel,
  onModelChange,
  isGenerating = false,
  isUploading = false,
  placeholder = "Type your message...",
  models = GOOGLE_MODELS,
  fileInputId = "file-upload",
  className = ""
}: ChatInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || attachments.length > 0) && !isGenerating && !isUploading) {
      onSubmit(input.trim(), attachments.map(a => a.id));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      await onFileSelect(files);
      // Reset the input
      e.target.value = '';
    }
  };

  const handleFileButtonClick = () => {
    document.getElementById(fileInputId)?.click();
  };

  return (
    <div className={className}>
      {/* Attachments preview */}
      <AttachmentPreview 
        attachments={attachments}
        onRemoveAttachment={onRemoveAttachment}
      />

      <PromptInput onSubmit={handleSubmit} className="mt-4">
        <PromptInputTextarea
          onChange={(e) => onInputChange(e.target.value)}
          value={input}
          placeholder={placeholder}
        />
        <PromptInputToolbar>
          <PromptInputTools>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf,.txt,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
              id={fileInputId}
            />
            <PromptInputButton
              type="button"
              variant="ghost"
              onClick={handleFileButtonClick}
              disabled={isUploading}
            >
              <Paperclip className="h-4 w-4" />
              <span>Attach</span>
            </PromptInputButton>
            
            <PromptInputModelSelect
              onValueChange={onModelChange}
              value={selectedModel}
            >
              <PromptInputModelSelectTrigger>
                <PromptInputModelSelectValue />
              </PromptInputModelSelectTrigger>
              <PromptInputModelSelectContent>
                {models.map((model) => (
                  <PromptInputModelSelectItem key={model.value} value={model.value}>
                    {model.name}
                  </PromptInputModelSelectItem>
                ))}
              </PromptInputModelSelectContent>
            </PromptInputModelSelect>
          </PromptInputTools>
          <PromptInputSubmit 
            disabled={(!input.trim() && attachments.length === 0) || isGenerating || isUploading}
            status={isGenerating ? 'streaming' : 'ready'}
          />
        </PromptInputToolbar>
      </PromptInput>
    </div>
  );
}