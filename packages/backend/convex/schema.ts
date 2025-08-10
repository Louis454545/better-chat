import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  conversations: defineTable({
    title: v.string(),
    createdAt: v.number(),
    userId: v.optional(v.string()), // Made optional for migration
  }).index("by_user_and_created_at", ["userId", "createdAt"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_conversation_and_created_at", ["conversationId", "createdAt"]),

  userSettings: defineTable({
    googleApiKey: v.string(),
    selectedModel: v.string(),
    userId: v.string(), // Clerk user ID
  }).index("by_user_id", ["userId"]),
});
