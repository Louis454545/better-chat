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
    title: v.string(),
  },
  returns: v.id("conversations"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const conversationId = await ctx.db.insert("conversations", {
      title: args.title,
      createdAt: Date.now(),
      userId: identity.subject,
      lastAccessedAt: Date.now(),
    });
    return conversationId;
  },
});

