import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import { toast } from "sonner";
import type { FileAttachment } from "@/shared/types";
import { FileService, ErrorService } from "@/shared/services";

export function useFileManagement() {
  const generateUploadUrl = useMutation(api.domains.files.index.generateUploadUrl);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const uploadFiles = useCallback(async (files: FileList): Promise<FileAttachment[]> => {
    if (!files?.length) return [];

    setUploading(true);
    const uploadedAttachments: FileAttachment[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileId = `${file.name}-${Date.now()}`;
        
        // Update progress
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
        
        try {
          const uploadUrl = await FileService.generateUploadUrl(generateUploadUrl);
          setUploadProgress(prev => ({ ...prev, [fileId]: 50 }));
          
          const result = await FileService.uploadFile(uploadUrl, file);
          setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
          
          const attachment = await FileService.createFileAttachment(file, result.storageId);
          uploadedAttachments.push(attachment);
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          toast.error(`Failed to upload ${file.name}`);
        } finally {
          // Clean up progress
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
          });
        }
      }
      
      return uploadedAttachments;
    } catch (error) {
      const errorMessage = ErrorService.handleUploadError(error);
      toast.error(errorMessage);
      return [];
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  }, [generateUploadUrl]);

  const removeFile = useCallback((attachments: FileAttachment[], fileId: string) => {
    const attachment = attachments.find(a => a.id === fileId);
    if (attachment) {
      FileService.cleanupBlobUrl(attachment.url);
    }
    return attachments.filter(a => a.id !== fileId);
  }, []);

  const cleanupFiles = useCallback((attachments: FileAttachment[]) => {
    FileService.cleanupAttachments(attachments);
  }, []);

  return {
    uploading,
    uploadProgress,
    uploadFiles,
    removeFile,
    cleanupFiles,
  };
}

export function useFileValidation() {
  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    // Size limit: 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { 
        isValid: false, 
        error: `File ${file.name} is too large. Maximum size is 10MB.` 
      };
    }

    // Type validation
    const allowedTypes = [
      'image/',
      'application/pdf',
      'text/',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const isAllowedType = allowedTypes.some(type => file.type.startsWith(type));
    if (!isAllowedType) {
      return { 
        isValid: false, 
        error: `File type ${file.type} is not supported.` 
      };
    }

    return { isValid: true };
  }, []);

  const validateFiles = useCallback((files: FileList): { validFiles: File[]; errors: string[] } => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateFile(file);
      
      if (validation.isValid) {
        validFiles.push(file);
      } else if (validation.error) {
        errors.push(validation.error);
      }
    }

    return { validFiles, errors };
  }, [validateFile]);

  return {
    validateFile,
    validateFiles,
  };
}