import { v } from "convex/values";

// Common validators
export const userIdValidator = v.string();
export const timestampValidator = v.number();
export const optionalTimestampValidator = v.optional(v.number());

// Conversation validators
export const conversationIdValidator = v.id("conversations");
export const conversationValidator = v.object({
  _id: conversationIdValidator,
  _creationTime: timestampValidator,
  title: v.string(),
  userId: v.optional(userIdValidator),
  lastAccessedAt: optionalTimestampValidator,
});

export const createConversationArgsValidator = v.object({
  title: v.optional(v.string()),
});

export const updateConversationArgsValidator = v.object({
  conversationId: conversationIdValidator,
  title: v.string(),
});

export const deleteConversationArgsValidator = v.object({
  conversationId: conversationIdValidator,
});

// Message validators
export const messageIdValidator = v.id("messages");
export const messageRoleValidator = v.union(v.literal("user"), v.literal("assistant"));
export const attachmentsValidator = v.optional(v.array(v.id("_storage")));

export const messageValidator = v.object({
  _id: messageIdValidator,
  _creationTime: timestampValidator,
  conversationId: conversationIdValidator,
  role: messageRoleValidator,
  content: v.string(),
  attachments: attachmentsValidator,
  lastAccessedAt: optionalTimestampValidator,
});

export const saveMessageArgsValidator = v.object({
  conversationId: conversationIdValidator,
  role: messageRoleValidator,
  content: v.string(),
  attachments: attachmentsValidator,
});

export const updateMessageArgsValidator = v.object({
  messageId: messageIdValidator,
  content: v.string(),
});

// File validators
export const storageIdValidator = v.id("_storage");
export const fileMetadataValidator = v.union(
  v.object({
    _id: storageIdValidator,
    _creationTime: timestampValidator,
    contentType: v.optional(v.string()),
    sha256: v.string(),
    size: v.number(),
  }),
  v.null()
);

// Settings validators
export const userSettingsIdValidator = v.id("userSettings");
export const modelValidator = v.union(
  v.literal("gemini-2.5-flash"),
  v.literal("gemini-2.5-pro"),
  v.literal("gemini-1.5-flash"),
  v.literal("gemini-1.5-pro"),
  v.literal("") // Allow empty string for migration/default handling
);
export const apiKeyValidator = v.string();

export const userSettingsValidator = v.union(
  v.object({
    _id: userSettingsIdValidator,
    _creationTime: timestampValidator,
    googleApiKey: apiKeyValidator,
    selectedModel: modelValidator,
    userId: userIdValidator,
  }),
  v.null()
);

export const updateSettingsArgsValidator = v.object({
  googleApiKey: apiKeyValidator,
  selectedModel: modelValidator,
});

// AI validators
export const generateAIArgsValidator = v.object({
  conversationId: conversationIdValidator,
  apiKey: apiKeyValidator,
  selectedModel: modelValidator,
});

// Array validators
export const conversationArrayValidator = v.array(conversationValidator);
export const messageArrayValidator = v.array(messageValidator);

// Pagination validators
export const paginationOptsValidator = v.object({
  cursor: v.optional(v.string()),
  limit: v.number(),
});

// Apply bounds to pagination limit
export const boundedPaginationOptsValidator = v.object({
  cursor: v.optional(v.string()),
  limit: v.number(), // Will be validated in middleware to be between 1 and 100
});

// Return type validators
export const nullReturnValidator = v.null();
export const stringReturnValidator = v.string();
export const conversationIdReturnValidator = stringReturnValidator;
export const messageIdReturnValidator = stringReturnValidator;
export const settingsIdReturnValidator = stringReturnValidator;