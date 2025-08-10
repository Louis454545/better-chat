import type { QueryCtx, MutationCtx } from "../../_generated/server";
import type { FileMetadataType, UserIdentity } from "../../shared/types";
import type { Id } from "../../_generated/dataModel";
import { requireAuth } from "../../shared/middleware";
import { createNotFoundError, createBusinessError } from "../../shared/errors";

export class FileService {
  
  static async generateUploadUrl(ctx: MutationCtx, user: UserIdentity): Promise<string> {
    // Rate limiting could be implemented here
    return await ctx.storage.generateUploadUrl();
  }
  
  static async getUrl(ctx: QueryCtx, storageId: Id<"_storage">): Promise<string | null> {
    // Note: File access is not restricted by user for simplicity
    // In a production app, you might want to verify file ownership
    return await ctx.storage.getUrl(storageId);
  }
  
  static async getMetadata(ctx: QueryCtx, storageId: Id<"_storage">): Promise<FileMetadataType | null> {
    return await ctx.db.system.get(storageId);
  }
  
  static async checkUserAccess(ctx: QueryCtx, storageId: Id<"_storage">, user: UserIdentity): Promise<boolean> {
    // Check if the file is referenced in any of the user's conversations
    const userConversations = await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", user.subject))
      .collect();
    
    for (const conversation of userConversations) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) => 
          q.eq("conversationId", conversation._id)
        )
        .collect();
      
      for (const message of messages) {
        if (message.attachments?.includes(storageId)) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  static async delete(ctx: MutationCtx, storageId: Id<"_storage">): Promise<void> {
    try {
      await ctx.storage.delete(storageId);
    } catch (error) {
      console.error(`Failed to delete file ${storageId}:`, error);
      throw createBusinessError("Failed to delete file");
    }
  }
  
  static async getAllFiles(ctx: QueryCtx): Promise<FileMetadataType[]> {
    return await ctx.db.system.query("_storage").collect();
  }
  
  static async getReferencedFiles(ctx: QueryCtx): Promise<Set<Id<"_storage">>> {
    const messages = await ctx.db.query("messages").collect();
    const referencedFiles = new Set<Id<"_storage">>();
    
    for (const message of messages) {
      if (message.attachments) {
        for (const fileId of message.attachments) {
          referencedFiles.add(fileId);
        }
      }
    }
    
    return referencedFiles;
  }
  
  static async getOrphanedFiles(ctx: QueryCtx): Promise<FileMetadataType[]> {
    const allFiles = await this.getAllFiles(ctx);
    const referencedFiles = await this.getReferencedFiles(ctx);
    
    return allFiles.filter(file => !referencedFiles.has(file._id));
  }
  
  static async cleanupOrphanedFiles(ctx: MutationCtx): Promise<number> {
    const orphanedFiles = await this.getOrphanedFiles(ctx);
    let deletedCount = 0;
    
    for (const file of orphanedFiles) {
      try {
        await this.delete(ctx, file._id);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete orphaned file ${file._id}:`, error);
      }
    }
    
    return deletedCount;
  }
  
  static async validateFileSize(metadata: FileMetadataType, maxSizeMB: number = 10): Promise<void> {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    if (metadata.size > maxSizeBytes) {
      throw createBusinessError(`File too large. Maximum size is ${maxSizeMB}MB`);
    }
  }
  
  static async validateFileType(metadata: FileMetadataType, allowedTypes: string[]): Promise<void> {
    if (!metadata.contentType) {
      throw createBusinessError("File type could not be determined");
    }
    
    const isAllowed = allowedTypes.some(type => 
      metadata.contentType!.startsWith(type)
    );
    
    if (!isAllowed) {
      throw createBusinessError(`File type ${metadata.contentType} is not allowed`);
    }
  }
}