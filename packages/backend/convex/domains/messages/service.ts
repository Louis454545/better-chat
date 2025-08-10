import type { QueryCtx, MutationCtx } from "../../_generated/server";
import type { MessageType, UserIdentity } from "../../shared/types";
import type { Id } from "../../_generated/dataModel";
import { requireConversationOwnership, validateString } from "../../shared/middleware";
import { createNotFoundError } from "../../shared/errors";
import { ConversationService } from "../conversations/service";

export class MessageService {
  
  static async getByConversation(ctx: QueryCtx, conversationId: string, user: UserIdentity): Promise<MessageType[]> {
    // Verify conversation ownership
    await requireConversationOwnership(ctx, conversationId, user);
    
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", conversationId as Id<"conversations">)
      )
      .order("asc")
      .collect();
    
    return messages.map(msg => ({
      _id: msg._id,
      _creationTime: msg._creationTime,
      conversationId: msg.conversationId,
      role: msg.role,
      content: msg.content,
      attachments: msg.attachments,
      lastAccessedAt: msg.lastAccessedAt || msg._creationTime,
    }));
  }
  
  static async create(
    ctx: MutationCtx, 
    conversationId: string, 
    role: "user" | "assistant", 
    content: string,
    user: UserIdentity,
    attachments?: Id<"_storage">[]
  ): Promise<string> {
    // Verify conversation ownership
    await requireConversationOwnership(ctx, conversationId, user);
    
    const cleanContent = validateString(content, "Message content", 0, 10000);
    const now = Date.now();
    
    const messageId = await ctx.db.insert("messages", {
      conversationId: conversationId as Id<"conversations">,
      role,
      content: cleanContent,
      attachments,
      lastAccessedAt: now,
    });
    
    // Update conversation last accessed time
    await ConversationService.updateLastAccessed(ctx, conversationId, user);
    
    return messageId;
  }
  
  static async update(ctx: MutationCtx, messageId: string, content: string, user: UserIdentity): Promise<void> {
    const message = await ctx.db.get(messageId as Id<"messages">);
    if (!message) {
      throw createNotFoundError("Message");
    }
    
    // Verify conversation ownership
    await requireConversationOwnership(ctx, message.conversationId, user);
    
    const cleanContent = validateString(content, "Message content", 0, 10000);
    
    await ctx.db.patch(message._id, {
      content: cleanContent,
    });
  }
  
  static async delete(ctx: MutationCtx, messageId: string, user: UserIdentity): Promise<void> {
    const message = await ctx.db.get(messageId as Id<"messages">);
    if (!message) {
      throw createNotFoundError("Message");
    }
    
    // Verify conversation ownership
    await requireConversationOwnership(ctx, message.conversationId, user);
    
    await ctx.db.delete(message._id);
  }
  
  static async getById(ctx: QueryCtx, messageId: string, user: UserIdentity): Promise<MessageType> {
    const message = await ctx.db.get(messageId as Id<"messages">);
    if (!message) {
      throw createNotFoundError("Message");
    }
    
    // Verify conversation ownership
    await requireConversationOwnership(ctx, message.conversationId, user);
    
    return {
      _id: message._id,
      _creationTime: message._creationTime,
      conversationId: message.conversationId,
      role: message.role,
      content: message.content,
      attachments: message.attachments,
      lastAccessedAt: message.lastAccessedAt || message._creationTime,
    };
  }
  
  static async getByConversationForAI(ctx: QueryCtx, conversationId: string, user: UserIdentity) {
    // Get messages for AI context - this method specifically formats messages for AI consumption
    const messages = await this.getByConversation(ctx, conversationId, user);
    
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      attachments: msg.attachments || [],
      createdAt: msg._creationTime,
    }));
  }
}