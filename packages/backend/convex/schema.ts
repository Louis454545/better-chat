import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  conversations: defineTable({
    title: v.string(),
    createdAt: v.number(),
    userId: v.optional(v.string()), // Made optional for migration
    lastAccessedAt: v.optional(v.number()), // For cleanup tracking
  }).index("by_user_and_created_at", ["userId", "createdAt"])
    .index("by_last_accessed", ["lastAccessedAt"])
    .index("by_created_at", ["createdAt"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    createdAt: v.number(),
    attachments: v.optional(v.array(v.id("_storage"))), // File attachments
    lastAccessedAt: v.optional(v.number()), // For cleanup tracking
  }).index("by_conversation_and_created_at", ["conversationId", "createdAt"])
    .index("by_conversation", ["conversationId"]),

  userSettings: defineTable({
    googleApiKey: v.string(),
    selectedModel: v.string(),
    userId: v.string(), // Clerk user ID
  }).index("by_user_id", ["userId"]),
});
