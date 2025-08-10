import { api } from "@my-better-t-app/backend/convex/_generated/api";
import type { Id } from "@my-better-t-app/backend/convex/_generated/dataModel";
import type { 
  Conversation, 
  Message, 
  UserSettings, 
  FileAttachment, 
  UploadResult, 
  FileMetadata,
  SettingsFormData 
} from "@/shared/types";

// Conversation service
export class ConversationService {
  static async createConversation(
    createConversation: any,
    title?: string
  ): Promise<Id<"conversations">> {
    return await createConversation({ title });
  }

  static async updateConversationTitle(
    updateConversationTitle: any,
    conversationId: Id<"conversations">,
    title: string
  ): Promise<void> {
    return await updateConversationTitle({ conversationId, title });
  }

  static async deleteConversation(
    deleteConversation: any,
    conversationId: Id<"conversations">
  ): Promise<void> {
    return await deleteConversation({ conversationId });
  }
}

// Message service
export class MessageService {
  static async saveMessage(
    saveMessage: any,
    params: {
      conversationId: Id<"conversations">;
      role: "user" | "assistant";
      content: string;
      attachments?: Id<"_storage">[];
    }
  ): Promise<void> {
    return await saveMessage(params);
  }

  static async generateAIResponse(
    generateAIResponseStream: any,
    params: {
      conversationId: Id<"conversations">;
      apiKey: string;
      selectedModel: string;
    }
  ): Promise<void> {
    return await generateAIResponseStream(params);
  }
}

// File service
export class FileService {
  static async generateUploadUrl(generateUploadUrl: any): Promise<string> {
    return await generateUploadUrl();
  }

  static async uploadFile(uploadUrl: string, file: File): Promise<UploadResult> {
    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    
    if (!result.ok) {
      throw new Error(`Upload failed: ${result.statusText}`);
    }
    
    return await result.json();
  }

  static async createFileAttachment(file: File, storageId: Id<"_storage">): Promise<FileAttachment> {
    const tempUrl = URL.createObjectURL(file);
    return {
      id: storageId,
      name: file.name,
      url: tempUrl,
      contentType: file.type,
      size: file.size,
    };
  }

  static cleanupBlobUrl(url: string): void {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  static cleanupAttachments(attachments: FileAttachment[]): void {
    attachments.forEach(attachment => {
      this.cleanupBlobUrl(attachment.url);
    });
  }
}

// Settings service
export class SettingsService {
  static async updateSettings(
    updateUserSettings: any,
    settings: SettingsFormData
  ): Promise<void> {
    return await updateUserSettings({
      googleApiKey: settings.googleApiKey,
      selectedModel: settings.selectedModel,
    });
  }

  static validateApiKey(apiKey: string): boolean {
    return apiKey.trim().length > 0;
  }

  static createInitialChatState(): {
    selectedConversationId?: Id<"conversations">;
    selectedModel: string;
    input: string;
    attachments: FileAttachment[];
    uploading: boolean;
    generating: boolean;
  } {
    return {
      selectedConversationId: undefined,
      selectedModel: 'gemini-2.5-flash',
      input: '',
      attachments: [],
      uploading: false,
      generating: false,
    };
  }
}

// Error service
export class ErrorService {
  static handleUploadError(error: unknown): string {
    console.error("Upload failed:", error);
    return "Failed to upload file";
  }

  static handleMessageError(error: unknown): string {
    console.error("Error sending message:", error);
    return "Failed to send message";
  }

  static handleConversationError(error: unknown): string {
    console.error("Error with conversation:", error);
    return "Failed to manage conversation";
  }

  static handleSettingsError(error: unknown): string {
    console.error("Error saving settings:", error);
    return "Failed to save settings";
  }
}