import React from "react";
import { useQuery } from "convex/react";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import type { Id } from "@my-better-t-app/backend/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { X, FileText, Image as ImageIcon } from "lucide-react";
import type { FileAttachment, BaseComponentProps } from "@/shared/types";

interface FileDisplayProps extends BaseComponentProps {
  storageId: Id<"_storage">;
  showActions?: boolean;
  onRemove?: (id: Id<"_storage">) => void;
}

export function FileDisplay({ 
  storageId, 
  showActions = false,
  onRemove,
  className = "" 
}: FileDisplayProps) {
  const fileUrl = useQuery(api.domains.files.index.getFileUrl, { storageId });
  const metadata = useQuery(api.domains.files.index.getFileMetadata, { storageId });

  if (!fileUrl || !metadata) {
    return (
      <div className={`border rounded-md p-4 bg-secondary/50 animate-pulse ${className}`}>
        <div className="h-4 bg-secondary rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-secondary rounded w-1/2"></div>
      </div>
    );
  }

  const isImage = metadata.contentType?.startsWith('image/');
  const fileSize = (metadata.size / 1024).toFixed(1);
  
  return (
    <div className={`border rounded-md p-2 bg-secondary/50 relative group ${className}`}>
      {showActions && onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(storageId)}
          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
      
      {isImage ? (
        <div className="space-y-2">
          <img 
            src={fileUrl} 
            alt="Uploaded image" 
            className="max-w-xs max-h-48 rounded object-cover w-full"
          />
          <div className="text-xs text-muted-foreground">
            {fileSize} KB
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              File attachment
            </div>
            <div className="text-xs text-muted-foreground">
              {metadata.contentType} • {fileSize} KB
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface FileAttachmentPreviewProps extends BaseComponentProps {
  attachment: FileAttachment;
  onRemove?: (id: Id<"_storage">) => void;
  showRemoveButton?: boolean;
}

export function FileAttachmentPreview({ 
  attachment, 
  onRemove,
  showRemoveButton = true,
  className = "" 
}: FileAttachmentPreviewProps) {
  const isImage = attachment.contentType?.startsWith('image/');
  
  return (
    <div className={`flex items-center gap-2 bg-secondary rounded-md px-3 py-2 ${className}`}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {isImage ? (
          <ImageIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
        <span className="text-sm text-foreground truncate">
          {attachment.name}
        </span>
      </div>
      
      {showRemoveButton && onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(attachment.id)}
          className="h-4 w-4 p-0 flex-shrink-0"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

interface FileAttachmentListProps extends BaseComponentProps {
  attachments: FileAttachment[];
  onRemove?: (id: Id<"_storage">) => void;
  showRemoveButtons?: boolean;
  maxDisplayCount?: number;
}

export function FileAttachmentList({ 
  attachments, 
  onRemove,
  showRemoveButtons = true,
  maxDisplayCount,
  className = "" 
}: FileAttachmentListProps) {
  if (attachments.length === 0) return null;

  const displayAttachments = maxDisplayCount 
    ? attachments.slice(0, maxDisplayCount)
    : attachments;
  
  const hasMore = maxDisplayCount && attachments.length > maxDisplayCount;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {displayAttachments.map((attachment) => (
          <FileAttachmentPreview
            key={attachment.id}
            attachment={attachment}
            onRemove={onRemove}
            showRemoveButton={showRemoveButtons}
          />
        ))}
      </div>
      
      {hasMore && (
        <div className="text-xs text-muted-foreground">
          +{attachments.length - maxDisplayCount} more files
        </div>
      )}
    </div>
  );
}

interface FileUploadZoneProps extends BaseComponentProps {
  onFileSelect: (files: FileList) => void;
  isUploading?: boolean;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
}

export function FileUploadZone({
  onFileSelect,
  isUploading = false,
  accept = "image/*,application/pdf,.txt,.doc,.docx",
  multiple = true,
  disabled = false,
  className = "",
  children
}: FileUploadZoneProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      onFileSelect(files);
      e.target.value = ''; // Reset input
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files?.length && !disabled) {
      onFileSelect(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={`border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      <input
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
        id="file-upload-zone"
      />
      
      <label 
        htmlFor="file-upload-zone" 
        className={`block ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {children || (
          <div className="space-y-2">
            <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              {isUploading ? "Uploading..." : "Drop files here or click to upload"}
            </div>
          </div>
        )}
      </label>
    </div>
  );
}