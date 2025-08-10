import type { QueryCtx, MutationCtx } from "../../_generated/server";
import type { UserSettingsType, UserIdentity } from "../../shared/types";
import { requireOwnership, validateString } from "../../shared/middleware";
import { createNotFoundError } from "../../shared/errors";

export class SettingsService {
  
  static async getByUser(ctx: QueryCtx, user: UserIdentity): Promise<UserSettingsType | null> {
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user_id", (q) => q.eq("userId", user.subject))
      .unique();
    
    if (!settings) {
      return null;
    }
    
    // Handle empty selectedModel by setting default
    const processedSettings = {
      ...settings,
      selectedModel: settings.selectedModel || "gemini-2.5-flash"
    };
    
    return processedSettings as UserSettingsType;
  }
  
  static async upsert(
    ctx: MutationCtx, 
    user: UserIdentity, 
    googleApiKey: string, 
    selectedModel: string
  ): Promise<string> {
    const cleanApiKey = validateString(googleApiKey, "API Key", 1, 500);
    // Handle empty selectedModel by setting default
    const cleanModel = selectedModel.trim() || "gemini-2.5-flash";
    
    const existingSettings = await this.getByUser(ctx, user);
    
    if (existingSettings) {
      await ctx.db.patch(existingSettings._id, {
        googleApiKey: cleanApiKey,
        selectedModel: cleanModel,
      });
      return existingSettings._id;
    } else {
      const settingsId = await ctx.db.insert("userSettings", {
        userId: user.subject,
        googleApiKey: cleanApiKey,
        selectedModel: cleanModel,
      });
      return settingsId;
    }
  }
  
  static async delete(ctx: MutationCtx, user: UserIdentity): Promise<void> {
    const settings = await this.getByUser(ctx, user);
    
    if (settings) {
      await ctx.db.delete(settings._id);
    }
  }
  
  static async validateApiKey(apiKey: string): Promise<boolean> {
    // Basic validation - in a real app, you might want to test the API key
    return apiKey.trim().length > 0;
  }
  
  static async getAvailableModels(): Promise<Array<{ id: string; name: string; description?: string }>> {
    return [
      { 
        id: 'gemini-2.5-flash', 
        name: 'Gemini 2.5 Flash', 
        description: 'Fast and efficient model for most conversations' 
      },
      { 
        id: 'gemini-2.5-pro', 
        name: 'Gemini 2.5 Pro', 
        description: 'More capable model for complex tasks and reasoning' 
      },
      { 
        id: 'gemini-1.5-flash', 
        name: 'Gemini 1.5 Flash', 
        description: 'Previous generation fast model' 
      },
      { 
        id: 'gemini-1.5-pro', 
        name: 'Gemini 1.5 Pro', 
        description: 'Previous generation pro model' 
      },
    ];
  }
  
  static async isValidModel(modelId: string): Promise<boolean> {
    const availableModels = await this.getAvailableModels();
    return availableModels.some(model => model.id === modelId);
  }
}