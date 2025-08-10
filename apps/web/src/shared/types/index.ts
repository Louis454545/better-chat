import type { Id } from "@my-better-t-app/backend/convex/_generated/dataModel";

// Core domain types
export interface Message {
  _id: Id<"messages">;
  _creationTime: number;
  conversationId: Id<"conversations">;
  role: "user" | "assistant";
  content: string;
  attachments?: Id<"_storage">[];
  lastAccessedAt?: number;
}

export interface Conversation {
  _id: Id<"conversations">;
  _creationTime: number;
  title: string;
  userId?: string;
  lastAccessedAt?: number;
}

export interface UserSettings {
  _id: Id<"userSettings">;
  _creationTime: number;
  googleApiKey: string;
  selectedModel: string;
  userId: string;
}

export interface FileAttachment {
  id: Id<"_storage">;
  name: string;
  url: string;
  contentType?: string;
  size?: number;
}

export interface FileMetadata {
  contentType?: string;
  size: number;
}

// AI Model types
export interface AIModel {
  name: string;
  value: string;
  description?: string;
}

export const GOOGLE_MODELS: AIModel[] = [
  { name: 'Gemini 2.5 Flash', value: 'gemini-2.5-flash', description: 'Fast and efficient model for most conversations' },
  { name: 'Gemini 2.5 Pro', value: 'gemini-2.5-pro', description: 'More capable model for complex tasks and reasoning' },
  { name: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash', description: 'Previous generation fast model' },
  { name: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro', description: 'Previous generation pro model' },
];

// UI State types
export type LoadingState = 'idle' | 'loading' | 'error' | 'success';

export type GenerationStatus = 'ready' | 'streaming' | 'error';

export interface ChatState {
  selectedConversationId?: Id<"conversations">;
  selectedModel: string;
  input: string;
  attachments: FileAttachment[];
  uploading: boolean;
  generating: boolean;
}

// API Response types
export interface ApiError {
  message: string;
  code?: string;
}

export interface UploadResult {
  storageId: Id<"_storage">;
}

// Component Props types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Event handler types
export type MessageHandler = (content: string, attachments?: Id<"_storage">[]) => Promise<void>;
export type ConversationHandler = (conversationId: Id<"conversations">) => void;
export type ModelChangeHandler = (model: string) => Promise<void>;
export type FileSelectHandler = (files: FileList) => Promise<FileAttachment[]>;
export type FileRemoveHandler = (id: Id<"_storage">) => void;

// Form types
export interface SettingsFormData {
  googleApiKey: string;
  selectedModel: string;
}

// Error boundary types
export interface ErrorInfo {
  componentStack: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}