"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { api } from "./_generated/api";

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

      // Create Google provider instance with API key
      const google = createGoogleGenerativeAI({
        apiKey: args.apiKey,
      });

      // Create model
      const model = google(args.selectedModel);

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
      if (error.message?.includes('API key')) {
        throw new Error('Invalid Google AI API key');
      } else if (error.message?.includes('model')) {
        throw new Error(`Invalid model: ${args.selectedModel}`);
      } else if (error.message?.includes('quota') || error.message?.includes('billing')) {
        throw new Error('Google AI API quota exceeded or billing issue');
      } else {
        throw new Error(`AI generation failed: ${error.message}`);
      }
    }
  },
});

// Keep the original non-streaming function as fallback
export const generateAIResponse = action({
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

      // Create Google provider instance with API key
      const google = createGoogleGenerativeAI({
        apiKey: args.apiKey,
      });

      // Create model
      const model = google(args.selectedModel);

      // Generate AI response
      const result: any = await streamText({
        model: model,
        messages: aiMessages,
        temperature: 0.7,
      });

      // Get the full text
      const fullText: string = await result.text;

      // Save the AI response to the database
      await ctx.runMutation(api.messages.saveMessage, {
        conversationId: args.conversationId,
        role: "assistant",
        content: fullText,
      });

      return fullText;
    } catch (error: any) {
      if (error.message?.includes('API key')) {
        throw new Error('Invalid Google AI API key');
      } else if (error.message?.includes('model')) {
        throw new Error(`Invalid model: ${args.selectedModel}`);
      } else if (error.message?.includes('quota') || error.message?.includes('billing')) {
        throw new Error('Google AI API quota exceeded or billing issue');
      } else {
        throw new Error(`AI generation failed: ${error.message}`);
      }
    }
  },
});