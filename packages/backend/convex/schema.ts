import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  conversations: defineTable({
    title: v.string(),
    userId: v.optional(v.string()), // Made optional for migration
    lastAccessedAt: v.optional(v.number()), // For cleanup tracking
    createdAt: v.optional(v.number()), // Legacy field - will be migrated to use _creationTime
  }).index("by_user", ["userId"])
    .index("by_last_accessed", ["lastAccessedAt"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    attachments: v.optional(v.array(v.id("_storage"))), // File attachments
    lastAccessedAt: v.optional(v.number()), // For cleanup tracking
    createdAt: v.optional(v.number()), // Legacy field - will be migrated to use _creationTime
  }).index("by_conversation", ["conversationId"]),

  userSettings: defineTable({
    googleApiKey: v.string(),
    selectedModel: v.string(),
    userId: v.string(), // Clerk user ID
  }).index("by_user_id", ["userId"]),
});
