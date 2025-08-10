import { query, mutation } from "../../_generated/server";
import { 
  conversationArrayValidator,
  conversationIdReturnValidator,
  createConversationArgsValidator,
  updateConversationArgsValidator,
  deleteConversationArgsValidator,
  nullReturnValidator
} from "../../shared/types/validators";
import { requireAuth, optionalAuth } from "../../shared/middleware";
import { ConversationService } from "./service";
import { logError } from "../../shared/errors";

export const getConversations = query({
  args: {},
  returns: conversationArrayValidator,
  handler: async (ctx) => {
    try {
      const user = await optionalAuth(ctx);
      
      if (!user) {
        return [];
      }
      
      return await ConversationService.getByUser(ctx, user);
    } catch (error: any) {
      logError(error, "getConversations");
      throw error;
    }
  },
});

export const createConversation = mutation({
  args: createConversationArgsValidator,
  returns: conversationIdReturnValidator,
  handler: async (ctx, args) => {
    try {
      const user = await requireAuth(ctx);
      return await ConversationService.create(ctx, user, args.title);
    } catch (error: any) {
      logError(error, "createConversation");
      throw error;
    }
  },
});

export const updateConversationTitle = mutation({
  args: updateConversationArgsValidator,
  returns: nullReturnValidator,
  handler: async (ctx, args) => {
    try {
      const user = await requireAuth(ctx);
      await ConversationService.updateTitle(ctx, args.conversationId, args.title, user);
      return null;
    } catch (error: any) {
      logError(error, "updateConversationTitle");
      throw error;
    }
  },
});

export const deleteConversation = mutation({
  args: deleteConversationArgsValidator,
  returns: nullReturnValidator,
  handler: async (ctx, args) => {
    try {
      const user = await requireAuth(ctx);
      await ConversationService.delete(ctx, args.conversationId, user);
      return null;
    } catch (error: any) {
      logError(error, "deleteConversation");
      throw error;
    }
  },
});