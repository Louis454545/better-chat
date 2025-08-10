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
    });
    return messageId;
  },
});