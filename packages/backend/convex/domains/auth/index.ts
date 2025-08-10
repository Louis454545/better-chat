// This module handles authentication-related operations
// Currently, authentication is handled by Clerk, so this module mainly
// provides utility functions and middleware for auth operations

export { requireAuth, optionalAuth, requireOwnership, RateLimit } from "../../shared/middleware";
export type { UserIdentity } from "../../shared/types";