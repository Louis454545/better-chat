"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { api } from "./_generated/api";

export const generateAIResponse = action({
  args: {
    conversationId: v.id("conversations"),
    apiKey: v.string(),
    selectedModel: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("Not authenticated");
      }

      // Verify the conversation belongs to the authenticated user
      const conversation = await ctx.runQuery(api.conversations.getConversations);
      const userConversation = conversation.find(c => c._id === args.conversationId);
      if (!userConversation) {
        throw new Error("Conversation not found or unauthorized");
      }

      // Get conversation messages for context
      const messages = await ctx.runQuery(api.messages.getMessages, {
        conversationId: args.conversationId,
      });

      // Create Google provider instance with API key
      const google = createGoogleGenerativeAI({
        apiKey: args.apiKey,
      });

      // Create model
      const model = google(args.selectedModel);

      // Generate AI response
      const result = await generateText({
        model: model,
        messages: messages,
        temperature: 0.7,
        maxTokens: 2000,
      });

      // Save the AI response to the database
      await ctx.runMutation(api.messages.saveMessage, {
        conversationId: args.conversationId,
        role: "assistant",
        content: result.text,
      });

      return result.text;
    } catch (error) {
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