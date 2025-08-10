import type { QueryCtx, MutationCtx } from "../../_generated/server";
import type { ConversationType, UserIdentity } from "../../shared/types";
import type { Id } from "../../_generated/dataModel";
import { requireOwnership, validateString } from "../../shared/middleware";
import { createNotFoundError, createBusinessError } from "../../shared/errors";

export class ConversationService {
  
  static async getByUser(ctx: QueryCtx, user: UserIdentity): Promise<ConversationType[]> {
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) =>
        q.eq("userId", user.subject)
      )
      .order("desc")
      .collect();
    
    // Update last accessed time for all conversations
    return conversations.map(conv => ({
      _id: conv._id,
      _creationTime: conv._creationTime,
      title: conv.title,
      userId: conv.userId || user.subject,
      lastAccessedAt: conv.lastAccessedAt || conv._creationTime,
    }));
  }
  
  static async getById(ctx: QueryCtx, conversationId: string, user: UserIdentity): Promise<ConversationType> {
    const conversation = await ctx.db.get(conversationId as Id<"conversations">);
    const validated = await requireOwnership(ctx, conversation, user, "Conversation");
    
    return {
      _id: validated._id,
      _creationTime: validated._creationTime,
      title: validated.title,
      userId: validated.userId || user.subject,
      lastAccessedAt: validated.lastAccessedAt || validated._creationTime,
    };
  }
  
  static async create(ctx: MutationCtx, user: UserIdentity, title?: string): Promise<string> {
    const now = Date.now();
    const conversationTitle = title?.trim() || `Chat ${new Date().toLocaleDateString()}`;
    
    validateString(conversationTitle, "Title", 1, 200);
    
    const conversationId = await ctx.db.insert("conversations", {
      title: conversationTitle,
      userId: user.subject,
      lastAccessedAt: now,
    });
    
    return conversationId;
  }
  
  static async updateTitle(ctx: MutationCtx, conversationId: string, title: string, user: UserIdentity): Promise<void> {
    const conversation = await this.getById(ctx, conversationId, user);
    
    const cleanTitle = validateString(title, "Title", 1, 200);
    
    await ctx.db.patch(conversation._id, {
      title: cleanTitle,
    });
  }
  
  static async delete(ctx: MutationCtx, conversationId: string, user: UserIdentity): Promise<void> {
    const conversation = await this.getById(ctx, conversationId, user);
    
    // Delete all messages in the conversation in parallel
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", conversation._id))
      .collect();

    // Delete all messages concurrently for better performance
    await Promise.all(messages.map(message => ctx.db.delete(message._id)));

    // Delete the conversation
    await ctx.db.delete(conversation._id);
  }
  
  static async updateLastAccessed(ctx: MutationCtx, conversationId: string, user: UserIdentity): Promise<void> {
    const conversation = await this.getById(ctx, conversationId, user);
    
    await ctx.db.patch(conversation._id, {
      lastAccessedAt: Date.now(),
    });
  }
  
  static async getOldConversations(ctx: QueryCtx, daysOld: number = 30): Promise<ConversationType[]> {
    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    
    return await ctx.db
      .query("conversations")
      .withIndex("by_last_accessed", (q) => 
        q.lt("lastAccessedAt", cutoffTime)
      )
      .collect();
  }
}