import { cronJobs } from "convex/server";
import { internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Clean up conversations and files older than 30 days
export const cleanupOldData = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 days in ms
    
    // Find conversations that haven't been accessed in 30 days
    const oldConversations = await ctx.db
      .query("conversations")
      .withIndex("by_last_accessed", (q) => 
        q.lt("lastAccessedAt", thirtyDaysAgo)
      )
      .collect();

    for (const conversation of oldConversations) {
      // Get all messages in this conversation
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversation_and_created_at", (q) =>
          q.eq("conversationId", conversation._id)
        )
        .collect();

      // Delete all files attached to messages in this conversation
      for (const message of messages) {
        if (message.attachments) {
          for (const fileId of message.attachments) {
            try {
              await ctx.storage.delete(fileId);
            } catch (error) {
              console.error(`Failed to delete file ${fileId}:`, error);
            }
          }
        }
        // Delete the message
        await ctx.db.delete(message._id);
      }

      // Delete the conversation
      await ctx.db.delete(conversation._id);
    }

    console.log(`Cleaned up ${oldConversations.length} old conversations`);
    return null;
  },
});

// Find orphaned files (files not referenced by any message)
export const cleanupOrphanedFiles = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Get all file IDs referenced in messages
    const messages = await ctx.db.query("messages").collect();
    const referencedFiles = new Set<string>();
    
    for (const message of messages) {
      if (message.attachments) {
        for (const fileId of message.attachments) {
          referencedFiles.add(fileId);
        }
      }
    }

    // Get all files in storage
    const allFiles = await ctx.db.system.query("_storage").collect();
    
    let deletedCount = 0;
    for (const file of allFiles) {
      if (!referencedFiles.has(file._id)) {
        try {
          await ctx.storage.delete(file._id);
          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete orphaned file ${file._id}:`, error);
        }
      }
    }

    console.log(`Cleaned up ${deletedCount} orphaned files`);
    return null;
  },
});

const crons = cronJobs();

// Run cleanup every day at 2 AM
crons.interval("cleanup old conversations and files", { hours: 24 }, internal.cleanup.cleanupOldData, {});

// Run orphaned file cleanup every week
crons.interval("cleanup orphaned files", { hours: 24 * 7 }, internal.cleanup.cleanupOrphanedFiles, {});

export default crons;