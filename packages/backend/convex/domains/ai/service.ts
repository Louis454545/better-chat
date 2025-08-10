"use node";

import type { ActionCtx } from "../../_generated/server";
import type { AIMessage, UserIdentity, ProviderConfig } from "../../shared/types";
import type { Id } from "../../_generated/dataModel";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { createApiError, createBusinessError, createValidationError } from "../../shared/errors";
import { MessageService } from "../messages/service";
import { FileService } from "../files/service";
import { SettingsService } from "../settings/service";

export class AIService {
  
  private static readonly SUPPORTED_MODELS = [
    'gemini-2.5-flash',
    'gemini-2.5-pro', 
    'gemini-1.5-flash',
    'gemini-1.5-pro'
  ];
  
  static async validateModel(modelId: string): Promise<void> {
    if (!this.SUPPORTED_MODELS.includes(modelId)) {
      throw createValidationError(
        `Invalid model: ${modelId}. Supported models: ${this.SUPPORTED_MODELS.join(', ')}`
      );
    }
  }
  
  static async createProvider(config: ProviderConfig) {
    await this.validateModel(config.model);
    
    const google = createGoogleGenerativeAI({
      apiKey: config.apiKey,
    });
    
    return google(config.model);
  }
  
  static async buildMessagesContext(
    ctx: ActionCtx, 
    conversationId: string, 
    user: UserIdentity
  ): Promise<any[]> {
    // Get messages using direct API calls instead of service methods
    // since actions need to use runQuery
    const { api } = await import("../../_generated/api");
    const messages = await ctx.runQuery(api.messages.getMessages, { 
      conversationId: conversationId as Id<"conversations"> 
    });
    
    const aiMessages: any[] = [];
    
    for (const msg of messages) {
      if (msg.attachments && msg.attachments.length > 0) {
        // Message with attachments - create content array
        const content: any[] = [];
        
        // Add text content if exists
        if (msg.content && typeof msg.content === 'string' && msg.content.trim()) {
          content.push({
            type: 'text',
            text: msg.content,
          });
        }
        
        // Add file attachments concurrently with size limits
        const filePromises = msg.attachments.map(async (fileId: Id<"_storage">) => {
          try {
            const metadata = await ctx.runQuery(api.files.getFileMetadata, { storageId: fileId });
            
            if (metadata) {
              // Check file size limit (10MB max)
              const maxSizeBytes = 10 * 1024 * 1024;
              if (metadata.size > maxSizeBytes) {
                console.warn(`File ${fileId} too large (${metadata.size} bytes), skipping`);
                return null;
              }
              
              // Get file data from storage
              const fileBlob = await ctx.storage.get(fileId);
              if (fileBlob) {
                const fileUrl = await ctx.storage.getUrl(fileId);
                if (fileUrl) {
                  // Check if it's an image to use proper AI SDK format
                  const contentType = metadata.contentType || 'application/octet-stream';
                  if (contentType.startsWith('image/')) {
                    return {
                      type: 'image',
                      image: fileUrl,
                    };
                  } else {
                    // For non-images, convert to text description
                    return {
                      type: 'text',
                      text: `[File attachment: ${contentType}]`,
                    };
                  }
                }
              }
            }
            return null;
          } catch (error: any) {
            console.error(`Failed to load file ${fileId}:`, error);
            return null;
          }
        });
        
        const fileContents = await Promise.all(filePromises);
        content.push(...fileContents.filter(Boolean));
        
        aiMessages.push({
          role: msg.role,
          content: content,
        });
      } else {
        // Message without attachments - simple text
        aiMessages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }
    
    return aiMessages;
  }
  
  static parseProviderError(error: any) {
    console.error('AI Provider error details:', {
      name: error.name,
      message: error.message,
      status: error.status,
      code: error.code,
      cause: error.cause,
    });

    if (error.status === 401 || error.code === 'UNAUTHENTICATED') {
      throw createApiError('Google AI', 'Invalid API key provided');
    }

    if (error.status === 400 && error.message?.toLowerCase().includes('model')) {
      throw createApiError('Google AI', 'Invalid model specified');
    }

    if (error.status === 429 || error.code === 'RESOURCE_EXHAUSTED') {
      throw createApiError('Google AI', 'API quota exceeded. Please check your usage limits.');
    }

    if (error.status === 402 || error.message?.toLowerCase().includes('billing')) {
      throw createApiError('Google AI', 'Billing issue detected. Please check your account status.');
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      throw createApiError('Google AI', 'Network connectivity issue. Please try again.');
    }

    throw createApiError('Google AI', `AI generation failed: ${error.message || 'Unknown error'}`);
  }
  
  static async generateResponse(
    ctx: ActionCtx,
    conversationId: string,
    apiKey: string,
    selectedModel: string,
    user: UserIdentity,
    temperature: number = 0.7
  ): Promise<string> {
    try {
      // Build context from conversation messages
      const aiMessages = await this.buildMessagesContext(ctx, conversationId, user);
      
      // Create provider instance
      const model = await this.createProvider({
        apiKey,
        model: selectedModel,
      });
      
      // Stream AI response
      const result: any = await streamText({
        model: model,
        messages: aiMessages,
        temperature,
      });
      
      // Create assistant message placeholder using API call
      const { api } = await import("../../_generated/api");
      const messageId = await ctx.runMutation(api.messages.saveMessage, {
        conversationId: conversationId as Id<"conversations">,
        role: "assistant",
        content: "",
      });
      
      let fullText: string = "";
      let updateCount = 0;
      const batchSize = 5; // Update every 5 tokens
      
      // Process stream and batch updates for efficiency
      for await (const textPart of result.textStream) {
        fullText += textPart;
        updateCount++;
        
        // Update the message every batchSize tokens to reduce API calls
        if (updateCount >= batchSize) {
          await ctx.runMutation(api.messages.updateMessage, {
            messageId: messageId,
            content: fullText,
          });
          updateCount = 0;
        }
      }
      
      // Final update to ensure all content is saved
      if (updateCount > 0) {
        await ctx.runMutation(api.messages.updateMessage, {
          messageId: messageId,
          content: fullText,
        });
      }
      
      return fullText;
    } catch (error: any) {
      this.parseProviderError(error);
      throw error; // This won't actually be reached due to parseProviderError throwing
    }
  }
}