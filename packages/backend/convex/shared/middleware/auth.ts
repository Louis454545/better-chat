import type { QueryCtx, MutationCtx, ActionCtx } from "../../_generated/server";
import type { UserIdentity } from "../types";
import type { Id } from "../../_generated/dataModel";
import { createAuthError, createAuthzError, createNotFoundError, createValidationError } from "../errors";

// Context type that includes authentication
export interface AuthenticatedContext {
  user: UserIdentity;
}

// Authentication middleware
export async function requireAuth(ctx: QueryCtx | MutationCtx | ActionCtx): Promise<UserIdentity> {
  const identity = await ctx.auth.getUserIdentity();
  
  if (!identity) {
    throw createAuthError("Authentication required");
  }
  
  return {
    subject: identity.subject,
    name: identity.name,
    email: identity.email,
  };
}

// Development authentication bypass
export async function optionalAuth(ctx: QueryCtx | MutationCtx | ActionCtx): Promise<UserIdentity | null> {
  const identity = await ctx.auth.getUserIdentity();
  
  if (!identity) {
    // Allow in development, block in production
    if (process.env.NODE_ENV === "production") {
      return null;
    }
    
    // Return a default dev identity
    return {
      subject: "dev-user",
      name: "Development User",
      email: "dev@example.com",
    };
  }
  
  return {
    subject: identity.subject,
    name: identity.name,
    email: identity.email,
  };
}

// Ownership verification middleware
export async function requireOwnership<T extends { userId?: string }>(
  ctx: QueryCtx | MutationCtx,
  resource: T | null,
  user: UserIdentity,
  resourceName: string = "Resource"
): Promise<T> {
  if (!resource) {
    throw createNotFoundError(resourceName);
  }
  
  if (resource.userId !== user.subject) {
    throw createAuthzError(`Not authorized to access this ${resourceName.toLowerCase()}`);
  }
  
  return resource;
}

// Conversation ownership verification
export async function requireConversationOwnership(
  ctx: QueryCtx | MutationCtx,
  conversationId: string,
  user: UserIdentity
) {
  const conversation = await ctx.db.get(conversationId as Id<"conversations">);
  return requireOwnership(ctx, conversation, user, "Conversation");
}

// Message ownership verification (through conversation)
export async function requireMessageOwnership(
  ctx: QueryCtx | MutationCtx,
  messageId: string,
  user: UserIdentity
) {
  const message = await ctx.db.get(messageId as Id<"messages">);
  if (!message) {
    throw createNotFoundError("Message");
  }
  
  // Verify conversation ownership instead of direct message ownership
  const conversation = await ctx.db.get(message.conversationId);
  await requireOwnership(ctx, conversation, user, "Conversation");
  
  return message;
}

// Rate limiting middleware (basic implementation)
export class RateLimit {
  private static requests = new Map<string, { count: number; resetTime: number }>();
  
  static async check(userId: string, limit: number = 100, windowMs: number = 60000): Promise<void> {
    const now = Date.now();
    const userRequests = this.requests.get(userId);
    
    if (!userRequests || now > userRequests.resetTime) {
      this.requests.set(userId, { count: 1, resetTime: now + windowMs });
      return;
    }
    
    if (userRequests.count >= limit) {
      throw createAuthzError("Rate limit exceeded. Please try again later.");
    }
    
    userRequests.count++;
  }
}

// Input validation middleware
export function validateRequired<T>(value: T, fieldName: string): T {
  if (value === null || value === undefined || value === '') {
    throw createValidationError(`${fieldName} is required`);
  }
  return value;
}

export function validateString(value: string, fieldName: string, minLength: number = 1, maxLength: number = 1000): string {
  // Only call validateRequired if minLength > 0, otherwise allow empty strings
  if (minLength > 0) {
    validateRequired(value, fieldName);
  } else {
    // For minLength = 0, just check for null/undefined but allow empty strings
    if (value === null || value === undefined) {
      throw createValidationError(`${fieldName} is required`);
    }
  }
  
  if (typeof value !== 'string') {
    throw createValidationError(`${fieldName} must be a string`);
  }
  
  if (value.length < minLength) {
    throw createValidationError(`${fieldName} must be at least ${minLength} characters`);
  }
  
  if (value.length > maxLength) {
    throw createValidationError(`${fieldName} must be no more than ${maxLength} characters`);
  }
  
  return value;
}

export function validateEmail(email: string): string {
  validateRequired(email, "Email");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    throw createValidationError("Invalid email format");
  }
  
  return email;
}

export function validatePaginationLimit(limit: number): number {
  if (typeof limit !== 'number' || limit < 1 || limit > 100) {
    throw createValidationError("Pagination limit must be between 1 and 100");
  }
  return limit;
}