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
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    // If not authenticated, return all conversations (for development)
    if (!identity) {
      const conversations = await ctx.db
        .query("conversations")
        .order("desc")
        .collect();
      return conversations;
    }

    // If authenticated, return user's conversations
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_user_and_created_at", (q) =>
        q.eq("userId", identity.subject)
      )
      .order("desc")
      .collect();
    return conversations;
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
    });
    return conversationId;
  },
});