import { query, mutation } from "../../_generated/server";
import { 
  messageArrayValidator,
  messageIdReturnValidator,
  saveMessageArgsValidator,
  updateMessageArgsValidator,
  nullReturnValidator,
  conversationIdValidator
} from "../../shared/types/validators";
import { requireAuth } from "../../shared/middleware";
import { MessageService } from "./service";
import { logError } from "../../shared/errors";
import { v } from "convex/values";

export const getMessages = query({
  args: {
    conversationId: conversationIdValidator,
  },
  returns: messageArrayValidator,
  handler: async (ctx, args) => {
    try {
      const user = await requireAuth(ctx);
      return await MessageService.getByConversation(ctx, args.conversationId, user);
    } catch (error: any) {
      logError(error, "getMessages");
      throw error;
    }
  },
});

export const saveMessage = mutation({
  args: saveMessageArgsValidator,
  returns: messageIdReturnValidator,
  handler: async (ctx, args) => {
    try {
      const user = await requireAuth(ctx);
      return await MessageService.create(
        ctx, 
        args.conversationId, 
        args.role, 
        args.content, 
        user, 
        args.attachments
      );
    } catch (error: any) {
      logError(error, "saveMessage");
      throw error;
    }
  },
});

export const updateMessage = mutation({
  args: updateMessageArgsValidator,
  returns: nullReturnValidator,
  handler: async (ctx, args) => {
    try {
      const user = await requireAuth(ctx);
      await MessageService.update(ctx, args.messageId, args.content, user);
      return null;
    } catch (error: any) {
      logError(error, "updateMessage");
      throw error;
    }
  },
});