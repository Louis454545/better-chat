import { mutation, query } from "../../_generated/server";
import { 
  stringReturnValidator,
  fileMetadataValidator,
  storageIdValidator,
  nullReturnValidator
} from "../../shared/types/validators";
import { requireAuth } from "../../shared/middleware";
import { FileService } from "./service";
import { logError } from "../../shared/errors";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  args: {},
  returns: stringReturnValidator,
  handler: async (ctx) => {
    try {
      const user = await requireAuth(ctx);
      return await FileService.generateUploadUrl(ctx, user);
    } catch (error: any) {
      logError(error, "generateUploadUrl");
      throw error;
    }
  },
});

export const getFileUrl = query({
  args: { storageId: storageIdValidator },
  returns: v.union(stringReturnValidator, nullReturnValidator),
  handler: async (ctx, args) => {
    try {
      const user = await requireAuth(ctx);
      
      // Check if user has access to this file through their messages
      const hasAccess = await FileService.checkUserAccess(ctx, args.storageId, user);
      if (!hasAccess) {
        throw new Error("File not found");
      }
      
      return await FileService.getUrl(ctx, args.storageId);
    } catch (error: any) {
      logError(error, "getFileUrl");
      throw error;
    }
  },
});

export const getFileMetadata = query({
  args: { storageId: storageIdValidator },
  returns: fileMetadataValidator,
  handler: async (ctx, args) => {
    try {
      const user = await requireAuth(ctx);
      
      // Check if user has access to this file through their messages
      const hasAccess = await FileService.checkUserAccess(ctx, args.storageId, user);
      if (!hasAccess) {
        throw new Error("File not found");
      }
      
      return await FileService.getMetadata(ctx, args.storageId);
    } catch (error: any) {
      logError(error, "getFileMetadata");
      throw error;
    }
  },
});