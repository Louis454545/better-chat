import { cronJobs } from "convex/server";
import { internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { nullReturnValidator } from "../shared/types/validators";
import { ConversationService } from "../domains/conversations/service";
import { MessageService } from "../domains/messages/service";
import { FileService } from "../domains/files/service";
import { logError } from "../shared/errors";

// Clean up conversations and files older than 30 days
export const cleanupOldData = internalMutation({
  args: {},
  returns: nullReturnValidator,
  handler: async (ctx) => {
    try {
      const oldConversations = await ConversationService.getOldConversations(ctx, 30);
      
      for (const conversation of oldConversations) {
        // Delete all files attached to messages in this conversation
        // Note: We need to get messages first to clean up files before deletion
        const messages = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", conversation._id)
          )
          .collect();

        for (const message of messages) {
          if (message.attachments) {
            for (const fileId of message.attachments) {
              try {
                await FileService.delete(ctx, fileId);
              } catch (error) {
                logError(error, `cleanup old file ${fileId}`);
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
    } catch (error: any) {
      logError(error, "cleanupOldData");
      throw error;
    }
  },
});

// Find orphaned files (files not referenced by any message)
export const cleanupOrphanedFiles = internalMutation({
  args: {},
  returns: nullReturnValidator,
  handler: async (ctx) => {
    try {
      const deletedCount = await FileService.cleanupOrphanedFiles(ctx);
      console.log(`Cleaned up ${deletedCount} orphaned files`);
      return null;
    } catch (error: any) {
      logError(error, "cleanupOrphanedFiles");
      throw error;
    }
  },
});

const crons = cronJobs();

// Run cleanup every day at 2 AM
crons.interval("cleanup old conversations and files", { hours: 24 }, internal.cron.index.cleanupOldData, {});

// Run orphaned file cleanup every week
crons.interval("cleanup orphaned files", { hours: 24 * 7 }, internal.cron.index.cleanupOrphanedFiles, {});

export default crons;