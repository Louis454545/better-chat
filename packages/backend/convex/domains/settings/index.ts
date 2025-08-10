import { query, mutation } from "../../_generated/server";
import { 
  userSettingsValidator,
  updateSettingsArgsValidator,
  settingsIdReturnValidator
} from "../../shared/types/validators";
import { requireAuth } from "../../shared/middleware";
import { SettingsService } from "./service";
import { logError } from "../../shared/errors";

export const getUserSettings = query({
  args: {},
  returns: userSettingsValidator,
  handler: async (ctx) => {
    try {
      const user = await requireAuth(ctx);
      return await SettingsService.getByUser(ctx, user);
    } catch (error: any) {
      logError(error, "getUserSettings");
      throw error;
    }
  },
});

export const updateUserSettings = mutation({
  args: updateSettingsArgsValidator,
  returns: settingsIdReturnValidator,
  handler: async (ctx, args) => {
    try {
      const user = await requireAuth(ctx);
      return await SettingsService.upsert(
        ctx, 
        user, 
        args.googleApiKey, 
        args.selectedModel
      );
    } catch (error: any) {
      logError(error, "updateUserSettings");
      throw error;
    }
  },
});