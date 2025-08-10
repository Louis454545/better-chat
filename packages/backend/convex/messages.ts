import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  returns: v.array(
    v.object({
      _id: v.id("messages"),
      _creationTime: v.number(),
      conversationId: v.id("conversations"),
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
      createdAt: v.number(),
      attachments: v.optional(v.array(v.id("_storage"))),
      lastAccessedAt: v.optional(v.number()),
    })
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify the conversation belongs to the authenticated user
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.subject) {
      throw new Error("Conversation not found or unauthorized");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation_and_created_at", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();
    return messages;
  },
});

export const saveMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    attachments: v.optional(v.array(v.id("_storage"))),
  },
  returns: v.id("messages"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify the conversation belongs to the authenticated user
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.subject) {
      throw new Error("Conversation not found or unauthorized");
    }

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      role: args.role,
      content: args.content,
      createdAt: Date.now(),
      attachments: args.attachments,
      lastAccessedAt: Date.now(),
    });
    
    // Update conversation lastAccessedAt
    await ctx.db.patch(args.conversationId, {
      lastAccessedAt: Date.now(),
    });
    
    return messageId;
  },
});

export const updateMessage = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the message to verify ownership
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Verify the conversation belongs to the authenticated user
    const conversation = await ctx.db.get(message.conversationId);
    if (!conversation || conversation.userId !== identity.subject) {
      throw new Error("Conversation not found or unauthorized");
    }

    await ctx.db.patch(args.messageId, {
      content: args.content,
    });
    
    return null;
  },
});