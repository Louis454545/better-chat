"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { streamText } from 'ai';
import { api } from "./_generated/api";
import { createProvider, isValidModel, parseProviderError } from './providers';

export const generateAIResponseStream = action({
  args: {
    conversationId: v.id("conversations"),
    apiKey: v.string(),
    selectedModel: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("Not authenticated");
      }

      // Verify the conversation belongs to the authenticated user
      const conversation = await ctx.runQuery(api.conversations.getConversations);
      const userConversation = conversation.find((c: any) => c._id === args.conversationId);
      if (!userConversation) {
        throw new Error("Conversation not found or unauthorized");
      }

      // Get conversation messages for context
      const messages = await ctx.runQuery(api.messages.getMessages, {
        conversationId: args.conversationId,
      });

      // Transform messages for AI SDK with file support
      const aiMessages: any[] = [];
      
      for (const msg of messages) {
        if (msg.attachments && msg.attachments.length > 0) {
          // Message with attachments - create content array
          const content: any[] = [];
          
          // Add text content if exists
          if (msg.content.trim()) {
            content.push({
              type: 'text',
              text: msg.content,
            });
          }
          
          // Add file attachments
          for (const fileId of msg.attachments) {
            try {
              // Get file metadata from query
              const metadata: any = await ctx.runQuery(api.files.getFileMetadata, { storageId: fileId });
              
              if (metadata) {
                // Get file data from storage (actions can access storage directly)
                const fileBlob = await ctx.storage.get(fileId);
                if (fileBlob) {
                  // Convert blob to array buffer then to buffer
                  const arrayBuffer = await fileBlob.arrayBuffer();
                  const buffer = Buffer.from(arrayBuffer);
                  
                  content.push({
                    type: 'file',
                    data: buffer,
                    mediaType: metadata.contentType || 'application/octet-stream',
                  });
                }
              }
            } catch (error: any) {
              console.error(`Failed to load file ${fileId}:`, error);
            }
          }
          
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

      // Validate model
      if (!isValidModel(args.selectedModel)) {
        throw new Error(`Invalid model: ${args.selectedModel}. Please select a supported model.`);
      }

      // Create provider instance with API key
      const model = createProvider({
        apiKey: args.apiKey,
        model: args.selectedModel,
      });

      // Stream AI response
      const result: any = await streamText({
        model: model,
        messages: aiMessages,
        temperature: 0.7,
      });

      // Create assistant message placeholder
      const messageId = await ctx.runMutation(api.messages.saveMessage, {
        conversationId: args.conversationId,
        role: "assistant",
        content: "",
      });

      let fullText: string = "";
      
      // Process stream and update message
      for await (const textPart of result.textStream) {
        fullText += textPart;
        
        // Update the message with accumulated text
        await ctx.runMutation(api.messages.updateMessage, {
          messageId: messageId,
          content: fullText,
        });
      }

      return fullText;
    } catch (error: any) {
      const providerError = parseProviderError(error);
      
      switch (providerError.type) {
        case 'api_key_invalid':
          throw new Error('Invalid Google AI API key');
        case 'model_invalid':
          throw new Error(`Invalid model: ${args.selectedModel}`);
        case 'quota_exceeded':
          throw new Error('Google AI API quota exceeded');
        case 'billing_issue':
          throw new Error('Google AI API billing issue');
        case 'network_error':
          throw new Error('Network connectivity issue. Please try again.');
        default:
          throw new Error(providerError.message);
      }
    }
  },
});

