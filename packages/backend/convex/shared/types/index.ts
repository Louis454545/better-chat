import { v } from "convex/values";
import type { Id } from "../../_generated/dataModel";

// Core domain types
export interface UserIdentity {
  subject: string;
  name?: string;
  email?: string;
}

export interface ConversationType {
  _id: Id<"conversations">;
  _creationTime: number;
  title: string;
  userId?: string;
  lastAccessedAt?: number;
}

export interface MessageType {
  _id: Id<"messages">;
  _creationTime: number;
  conversationId: Id<"conversations">;
  role: "user" | "assistant";
  content: string;
  attachments?: Id<"_storage">[];
  lastAccessedAt?: number;
}

export interface UserSettingsType {
  _id: Id<"userSettings">;
  _creationTime: number;
  googleApiKey: string;
  selectedModel: "gemini-2.5-flash" | "gemini-2.5-pro" | "gemini-1.5-flash" | "gemini-1.5-pro" | "";
  userId: string;
}

export interface FileMetadataType {
  _id: Id<"_storage">;
  _creationTime: number;
  contentType?: string;
  sha256: string;
  size: number;
}

// AI Provider types
export interface ProviderConfig {
  apiKey: string;
  model: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  description?: string;
}

export interface AIMessage {
  role: "user" | "assistant";
  content: string | Array<{
    type: 'text' | 'file';
    text?: string;
    file?: {
      url: string;
      mediaType?: string;
    };
  }>;
}

// Error types
export interface DomainError {
  type: 'authentication' | 'authorization' | 'validation' | 'not_found' | 'business_logic' | 'external_api' | 'unknown';
  message: string;
  details?: any;
}

// Pagination types
export interface PaginationOptions {
  cursor?: string;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
}