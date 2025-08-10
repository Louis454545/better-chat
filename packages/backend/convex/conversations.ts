import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getConversations = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("conversations"),
      _creationTime: v.number(),
      title: v.string(),
      createdAt: v.number(),
      userId: v.optional(v.string()),
      lastAccessedAt: v.optional(v.number()),
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    // If not authenticated, only allow in development
    if (!identity) {
      // In production, return empty array for security
      if (process.env.NODE_ENV === "production") {
        return [];
      }
      
      // In development, return all conversations with proper index
      const conversations = await ctx.db
        .query("conversations")
        .withIndex("by_created_at")
        .order("desc")
        .collect();
      
      // Project only the fields defined in the return validator
      return conversations.map(conv => ({
        _id: conv._id,
        _creationTime: conv._creationTime,
        title: conv.title,
        createdAt: conv.createdAt,
        userId: conv.userId,
        lastAccessedAt: conv.lastAccessedAt,
      }));
    }

    // If authenticated, return user's conversations
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_user_and_created_at", (q) =>
        q.eq("userId", identity.subject)
      )
      .order("desc")
      .collect();
    
    // Project only the fields defined in the return validator
    return conversations.map(conv => ({
      _id: conv._id,
      _creationTime: conv._creationTime,
      title: conv.title,
      createdAt: conv.createdAt,
      userId: conv.userId,
      lastAccessedAt: conv.lastAccessedAt,
    }));
  },
});

export const createConversation = mutation({
  args: {
    title: v.optional(v.string()),
  },
  returns: v.id("conversations"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const conversationId = await ctx.db.insert("conversations", {
      title: args.title || `Chat ${new Date().toLocaleDateString()}`,
      createdAt: Date.now(),
      userId: identity.subject,
      lastAccessedAt: Date.now(),
    });
    return conversationId;
  },
});

export const updateConversationTitle = mutation({
  args: {
    conversationId: v.id("conversations"),
    title: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (conversation.userId !== identity.subject) {
      throw new Error("Not authorized to update this conversation");
    }

    await ctx.db.patch(args.conversationId, {
      title: args.title,
    });
  },
});

export const deleteConversation = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (conversation.userId !== identity.subject) {
      throw new Error("Not authorized to delete this conversation");
    }

    // Delete all messages in the conversation
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete the conversation
    await ctx.db.delete(args.conversationId);
  },
});

