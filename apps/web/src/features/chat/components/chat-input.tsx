import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, Paperclip, Square, X } from "lucide-react";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputAction,
} from "@/components/ui/prompt-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const handleSubmit = () => {
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
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="bg-secondary flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
              onClick={e => e.stopPropagation()}
            >
              <Paperclip className="size-4" />
              <span className="max-w-[120px] truncate">{attachment.name}</span>
              <button
                onClick={() => onRemoveAttachment(attachment.id)}
                className="hover:bg-secondary/50 rounded-full p-1"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <PromptInput
        value={input}
        onValueChange={onInputChange}
        isLoading={isGenerating || isUploading}
        onSubmit={handleSubmit}
        className="w-full"
      >
        <PromptInputTextarea placeholder={placeholder} />

        <PromptInputActions className="flex items-center justify-between gap-2 pt-2">
          <div className="flex items-center gap-2">
            <PromptInputAction tooltip="Attach files">
              <label
                htmlFor={fileInputId}
                className="hover:bg-secondary-foreground/10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-2xl"
              >
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf,.txt,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id={fileInputId}
                />
                <Paperclip className="text-primary size-5" />
              </label>
            </PromptInputAction>

            <Select value={selectedModel} onValueChange={onModelChange}>
              <SelectTrigger className="w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <PromptInputAction
            tooltip={isGenerating ? "Stop generation" : "Send message"}
          >
            <Button
              variant="default"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleSubmit}
              disabled={(!input.trim() && attachments.length === 0) || isUploading}
            >
              {isGenerating ? (
                <Square className="size-5 fill-current" />
              ) : (
                <ArrowUp className="size-5" />
              )}
            </Button>
          </PromptInputAction>
        </PromptInputActions>
      </PromptInput>
    </div>
  );
}