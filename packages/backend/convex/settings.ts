import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUserSettings = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("userSettings"),
      _creationTime: v.number(),
      googleApiKey: v.string(),
      selectedModel: v.string(),
      userId: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();
    return settings;
  },
});

export const updateUserSettings = mutation({
  args: {
    googleApiKey: v.string(),
    selectedModel: v.string(),
  },
  returns: v.id("userSettings"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existingSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (existingSettings) {
      await ctx.db.patch(existingSettings._id, {
        googleApiKey: args.googleApiKey,
        selectedModel: args.selectedModel,
      });
      return existingSettings._id;
    } else {
      const settingsId = await ctx.db.insert("userSettings", {
        userId: identity.subject,
        googleApiKey: args.googleApiKey,
        selectedModel: args.selectedModel,
      });
      return settingsId;
    }
  },
});