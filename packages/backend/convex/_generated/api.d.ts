/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as ai from "../ai.js";
import type * as conversations from "../conversations.js";
import type * as cron_index from "../cron/index.js";
import type * as domains_ai_index from "../domains/ai/index.js";
import type * as domains_ai_service from "../domains/ai/service.js";
import type * as domains_auth_index from "../domains/auth/index.js";
import type * as domains_conversations_index from "../domains/conversations/index.js";
import type * as domains_conversations_service from "../domains/conversations/service.js";
import type * as domains_files_index from "../domains/files/index.js";
import type * as domains_files_service from "../domains/files/service.js";
import type * as domains_messages_index from "../domains/messages/index.js";
import type * as domains_messages_service from "../domains/messages/service.js";
import type * as domains_settings_index from "../domains/settings/index.js";
import type * as domains_settings_service from "../domains/settings/service.js";
import type * as files from "../files.js";
import type * as messages from "../messages.js";
import type * as settings from "../settings.js";
import type * as shared_errors_index from "../shared/errors/index.js";
import type * as shared_middleware_auth from "../shared/middleware/auth.js";
import type * as shared_middleware_index from "../shared/middleware/index.js";
import type * as shared_types_index from "../shared/types/index.js";
import type * as shared_types_validators from "../shared/types/validators.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  conversations: typeof conversations;
  "cron/index": typeof cron_index;
  "domains/ai/index": typeof domains_ai_index;
  "domains/ai/service": typeof domains_ai_service;
  "domains/auth/index": typeof domains_auth_index;
  "domains/conversations/index": typeof domains_conversations_index;
  "domains/conversations/service": typeof domains_conversations_service;
  "domains/files/index": typeof domains_files_index;
  "domains/files/service": typeof domains_files_service;
  "domains/messages/index": typeof domains_messages_index;
  "domains/messages/service": typeof domains_messages_service;
  "domains/settings/index": typeof domains_settings_index;
  "domains/settings/service": typeof domains_settings_service;
  files: typeof files;
  messages: typeof messages;
  settings: typeof settings;
  "shared/errors/index": typeof shared_errors_index;
  "shared/middleware/auth": typeof shared_middleware_auth;
  "shared/middleware/index": typeof shared_middleware_index;
  "shared/types/index": typeof shared_types_index;
  "shared/types/validators": typeof shared_types_validators;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
