import { action } from "../../_generated/server";
import { 
  generateAIArgsValidator,
  stringReturnValidator
} from "../../shared/types/validators";
import { requireAuth, RateLimit } from "../../shared/middleware";
import { AIService } from "./service";
import { logError } from "../../shared/errors";

export const generateAIResponseStream = action({
  args: generateAIArgsValidator,
  returns: stringReturnValidator,
  handler: async (ctx, args) => {
    try {
      const user = await requireAuth(ctx);
      
      // Rate limit AI requests per user (10 requests per minute)
      await RateLimit.check(user.subject, 10, 60000);
      
      return await AIService.generateResponse(
        ctx,
        args.conversationId,
        args.apiKey,
        args.selectedModel,
        user
      );
    } catch (error: any) {
      logError(error, "generateAIResponseStream");
      throw error;
    }
  },
});