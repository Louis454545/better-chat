# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a Better-T-Stack monorepo using Turborepo with:
- **Web App** (`apps/web/`): Next.js frontend with Tauri desktop app support
- **Native App** (`apps/native/`): React Native/Expo mobile app  
- **Backend** (`packages/backend/`): Convex backend-as-a-service

All apps share the same Convex backend for data synchronization across platforms.

### Technology Stack
- **Frontend**: Next.js 15 with React 19, TailwindCSS, shadcn/ui components, AI SDK Elements
- **Mobile**: React Native with Expo, NativeWind for styling
- **Desktop**: Tauri for native desktop apps
- **Backend**: Convex for real-time data, file storage, and authentication
- **Authentication**: Clerk for user management with Convex integration
- **AI Integration**: Vercel AI SDK with Google Generative AI provider
- **Monorepo**: Turborepo with pnpm workspaces

## 🏗️ **PRODUCTION-READY ARCHITECTURE**

### Frontend Architecture (Feature-Based)
```
apps/web/src/
├── features/               # Business domains
│   ├── auth/              # Authentication & authorization
│   │   ├── components/    # Auth UI components
│   │   └── hooks/         # Auth business logic
│   ├── chat/              # Chat interface
│   │   ├── components/    # Chat UI components  
│   │   └── hooks/         # Chat business logic
│   ├── files/             # File management
│   │   ├── components/    # File UI components
│   │   └── hooks/         # File business logic
│   └── settings/          # User settings
│       ├── components/    # Settings UI components
│       └── hooks/         # Settings business logic
├── shared/                # Shared infrastructure
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Cross-domain business logic
│   ├── services/          # API & business services
│   ├── types/             # TypeScript definitions
│   └── utils/             # Helper functions
└── app/                   # Next.js app router
```

### Backend Architecture (Domain-Driven)
```
packages/backend/convex/
├── domains/               # Business domains
│   ├── auth/             # Authentication domain
│   ├── conversations/     # Conversation management
│   │   ├── service.ts    # Business logic service
│   │   └── index.ts      # Convex functions
│   ├── messages/         # Message handling
│   │   ├── service.ts    # Business logic service
│   │   └── index.ts      # Convex functions
│   ├── files/            # File management
│   │   ├── service.ts    # Business logic service
│   │   └── index.ts      # Convex functions
│   ├── ai/               # AI integration
│   │   ├── service.ts    # Business logic service
│   │   └── index.ts      # Convex functions
│   └── settings/         # User settings
│       ├── service.ts    # Business logic service
│       └── index.ts      # Convex functions
├── shared/               # Shared infrastructure
│   ├── types/            # TypeScript definitions & validators
│   ├── middleware/       # Auth, validation, ownership
│   ├── errors/           # Error handling system
│   └── utils/            # Helper functions
├── cron/                 # Scheduled tasks
└── schema.ts             # Database schema
```

## Current Application Features

### AI Chat Application
The main application is a modern AI chat interface with the following features:

#### Core Chat Features
- **Real-time messaging** with Google Gemini models (2.5 Flash, 2.5 Pro, 1.5 Flash, 1.5 Pro)
- **Streaming responses** - AI text appears progressively as it's generated
- **Conversation management** - Create, select, and manage multiple chat conversations
- **Message persistence** - All messages stored in Convex database with real-time sync

#### File Upload & Attachments
- **Multi-file upload** support for images, PDFs, and documents
- **Image preview** and file metadata display in chat
- **Convex file storage** with secure upload URLs and user access control
- **AI vision** - Google Gemini can analyze uploaded images with proper formatting
- **File security** - Access control prevents unauthorized file enumeration
- **File cleanup** - Automatic deletion of unused files after 30 days of inactivity
- **Performance** - Concurrent file processing with 10MB size limits

#### Authentication & Security
- **Clerk authentication** with sign-in/sign-up modals
- **User isolation** - Each user sees only their own conversations
- **Secure file access** - Files are scoped to authenticated users with ownership verification
- **Rate limiting** - AI endpoints protected against abuse (10 requests/minute)
- **Information security** - No leakage of unauthorized resource existence
- **API key management** - Users provide their own Google AI API keys

#### UI Components
- **AI SDK Elements** for modern chat interface
- **shadcn/ui** component library for consistent design
- **Responsive design** with sidebar navigation
- **Theme support** with dark/light mode toggle
- **Real-time updates** via Convex subscriptions

## Common Development Commands

### Initial Setup
```bash
pnpm install                # Install all dependencies
pnpm dev:setup             # Setup Convex backend (run once)
```

### Development
```bash
pnpm dev                   # Start all apps in development
pnpm dev:web              # Start only web app (http://localhost:3001)
pnpm dev:native           # Start only mobile app
pnpm dev:server           # Start only Convex backend
```

### Building and Type Checking
```bash
pnpm build                 # Build all apps
pnpm check-types          # TypeScript check across all apps
```

### Web App Specific
```bash
cd apps/web
pnpm lint                 # ESLint
pnpm desktop:dev          # Run Tauri desktop app
pnpm desktop:build        # Build Tauri desktop app
```

### Native App Specific
```bash
cd apps/native
pnpm android              # Run on Android
pnpm ios                  # Run on iOS
pnpm prebuild             # Generate native code
```

### Backend Development
```bash
cd packages/backend
pnpm dev                  # Start Convex in development mode
pnpm convex deploy        # Deploy to production
```

## 🚀 **ADDING NEW FEATURES**

### Frontend Feature Development

#### 1. Create New Feature Domain
```bash
# Create feature structure
mkdir -p apps/web/src/features/new-feature/components
mkdir -p apps/web/src/features/new-feature/hooks
```

#### 2. Follow Feature Template
```typescript
// apps/web/src/features/new-feature/components/index.tsx
import React, { memo } from "react";
import type { BaseComponentProps } from "@/shared/types";

interface NewFeatureProps extends BaseComponentProps {
  // Add feature-specific props
}

export const NewFeature = memo(function NewFeature({ 
  className = "" 
}: NewFeatureProps) {
  return (
    <div className={className}>
      {/* Feature implementation */}
    </div>
  );
});

// apps/web/src/features/new-feature/hooks/index.ts
import { useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@my-better-t-app/backend/convex/_generated/api";

export function useNewFeature() {
  // Feature business logic
  return {
    // Return feature state and handlers
  };
}
```

#### 3. Add to Shared Types (if needed)
```typescript
// apps/web/src/shared/types/index.ts
export interface NewFeatureType {
  // Add new types here
}
```

### Backend Feature Development

#### 1. Create Domain Structure
```bash
mkdir -p packages/backend/convex/domains/new-domain
```

#### 2. Create Service Layer
```typescript
// packages/backend/convex/domains/new-domain/service.ts
import type { QueryCtx, MutationCtx } from "../../_generated/server";
import type { UserIdentity } from "../../shared/types";
import { requireAuth, validateString } from "../../shared/middleware";
import { createBusinessError } from "../../shared/errors";

export class NewDomainService {
  static async create(ctx: MutationCtx, user: UserIdentity, data: any): Promise<string> {
    // Business logic implementation
    return "new-id";
  }
  
  static async getByUser(ctx: QueryCtx, user: UserIdentity): Promise<any[]> {
    // Business logic implementation
    return [];
  }
}
```

#### 3. Create Convex Functions
```typescript
// packages/backend/convex/domains/new-domain/index.ts
import { query, mutation } from "../../_generated/server";
import { requireAuth } from "../../shared/middleware";
import { NewDomainService } from "./service";
import { logError } from "../../shared/errors";
import { v } from "convex/values";

export const createNewDomainItem = mutation({
  args: {
    data: v.string(), // Add proper validators
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    try {
      const user = await requireAuth(ctx);
      return await NewDomainService.create(ctx, user, args.data);
    } catch (error: any) {
      logError(error, "createNewDomainItem");
      throw error;
    }
  },
});

export const getNewDomainItems = query({
  args: {},
  returns: v.array(v.any()), // Add proper return type
  handler: async (ctx) => {
    try {
      const user = await requireAuth(ctx);
      return await NewDomainService.getByUser(ctx, user);
    } catch (error: any) {
      logError(error, "getNewDomainItems");
      throw error;
    }
  },
});
```

#### 4. Update Schema (if needed)
```typescript
// packages/backend/convex/schema.ts
export default defineSchema({
  // ... existing tables
  newDomainTable: defineTable({
    userId: v.string(),
    data: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
```

#### 5. Export from Root (for compatibility)
```typescript
// packages/backend/convex/new-domain.ts
export { 
  createNewDomainItem,
  getNewDomainItems 
} from "./domains/new-domain";
```

### Best Practices for New Features

#### Frontend Guidelines
1. **Use the feature pattern** - Each feature should be self-contained
2. **Leverage shared components** - Reuse existing UI components
3. **Follow TypeScript patterns** - Use proper types and interfaces
4. **Use memo for performance** - Wrap components in React.memo
5. **Error boundaries** - Wrap features in ErrorBoundary components

#### Backend Guidelines
1. **Domain-driven design** - Group related functionality together
2. **Service layer** - Business logic goes in service classes
3. **Middleware usage** - Always use requireAuth for protected endpoints
4. **Error handling** - Use shared error classes and safe logging with circular reference protection
5. **Type safety** - Use validators for all arguments and returns
6. **Security first** - Implement rate limiting and information hiding patterns
7. **Performance optimization** - Use concurrent operations and batching where appropriate

## Convex Backend Guidelines

Follow the comprehensive Convex rules documented in `ai_docs/convex/convex_rules.md`. Key points:

### Function Syntax
- Always use new function syntax with `args` and `returns` validators
- Import functions from `./_generated/server`
- Use `v.null()` for functions that don't return values

### Domain Organization
- **Domain Services**: Business logic in service classes
- **Convex Functions**: Thin wrappers around service methods
- **Shared Middleware**: Authentication, validation, error handling
- **Type Safety**: Centralized validators and types

### Function References
- Use `api.domainName.functionName` for public functions
- Use `internal.domainName.functionName` for internal functions

### Current Backend Domains

#### Authentication (`convex/domains/auth/`)
- Centralized authentication middleware
- User identity management

#### Conversations (`convex/domains/conversations/`)
- `getConversations` - List user's conversations with service layer
- `createConversation` - Create new conversation with validation
- `updateConversationTitle` - Update conversation title with ownership checks
- `deleteConversation` - Delete conversation with cascade cleanup

#### Messages (`convex/domains/messages/`)
- `getMessages` - Get messages for a conversation with authorization
- `saveMessage` - Save new message with validation and ownership
- `updateMessage` - Update message content with ownership verification

#### Settings (`convex/domains/settings/`)
- `getUserSettings` - Get user's API key and model preferences
- `updateUserSettings` - Update user settings with validation

#### Files (`convex/domains/files/`)
- `generateUploadUrl` - Create secure upload URL with auth
- `getFileUrl` - Get public URL for stored file with user access verification
- `getFileMetadata` - Get file information with authorization checks
- **Access control** - Files are isolated per user through conversation ownership
- **Security** - Information hiding (unauthorized access returns "File not found")

#### AI Integration (`convex/domains/ai/`)
- `generateAIResponseStream` - Generate AI response with streaming
- **Rate limiting** - 10 requests per minute per user for abuse prevention
- **Image support** - Google Gemini vision with proper message formatting
- **File processing** - Concurrent loading with 10MB size limits
- **Streaming optimization** - Batched updates every 5 tokens for performance
- Real-time message updates during streaming
- Comprehensive error handling for API failures

#### Cleanup (`convex/cron/`)
- Automated cleanup of old conversations and orphaned files
- Cron jobs for maintenance tasks

### Error Handling System
```typescript
// Use domain-specific error classes with circular reference protection
import { createAuthError, createValidationError, createBusinessError } from "../../shared/errors";

// Authentication errors
throw createAuthError("Not authenticated");

// Validation errors (supports empty strings when minLength = 0)
throw createValidationError("Invalid input data");

// Business logic errors
throw createBusinessError("Cannot delete conversation with active messages");

// Safe error logging with circular reference handling
logError(error, "functionContext");
```

### Middleware Usage
```typescript
// Always use authentication middleware
const user = await requireAuth(ctx);

// Use ownership verification  
await requireOwnership(ctx, resource, user, "Resource");

// Use validation helpers (supports empty strings when minLength = 0)
const cleanTitle = validateString(title, "Title", 1, 200);
const optionalContent = validateString(content, "Content", 0, 10000); // Allows empty for AI streaming

// Rate limiting for sensitive operations
await RateLimit.check(user.subject, 10, 60000); // 10 requests per minute
```

## Environment Variables

### Development (.env.local files needed)

**Web App** (`apps/web/.env.local`):
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

**Convex Backend** (`packages/backend/.env.local`):
```env
CLERK_FRONTEND_API_URL=https://your-app.clerk.accounts.dev
```

### Production (Vercel Environment Variables)
- `CONVEX_DEPLOYMENT` - Production Convex deployment URL
- `CLERK_SECRET_KEY` - Clerk secret key for server-side
- `CLERK_FRONTEND_API_URL` - Clerk frontend API URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `NEXT_PUBLIC_CONVEX_URL` - Convex production URL

## UI Components

This project uses:
- **shadcn/ui** for base components (buttons, inputs, etc.)
- **AI SDK Elements** for chat interface components
- Available components documented in `ai_docs/shadcnui_rules.md`

To add new shadcn/ui components:
```bash
pnpm dlx shadcn@latest add button
```

## File Structure Conventions

```
my-better-t-app/
├── apps/
│   ├── web/                    # Next.js web app + Tauri
│   │   ├── src/
│   │   │   ├── features/       # Feature-based architecture
│   │   │   ├── shared/         # Shared infrastructure
│   │   │   └── app/           # Next.js app router
│   │   ├── src-tauri/         # Tauri desktop app config
│   │   └── .env.local         # Environment variables
│   └── native/                 # React Native/Expo mobile app
│       ├── app/               # Expo Router pages
│       └── components/        # Shared mobile components
├── packages/
│   └── backend/               # Convex backend
│       ├── convex/
│       │   ├── domains/       # Domain-driven architecture
│       │   ├── shared/        # Shared infrastructure
│       │   ├── cron/          # Scheduled tasks
│       │   └── schema.ts      # Database schema
│       └── .env.local         # Environment variables
├── ai_docs/                   # Development guidelines and rules
├── turbo.json                 # Turborepo configuration
└── CLAUDE.md                  # This file
```

## Code Style
- TypeScript strict mode enabled across all apps
- Use `import type` for type-only imports
- TailwindCSS for styling (web uses v4, native uses v3 via NativeWind)
- Consistent component patterns between web and native where possible
- Use workspace imports for shared backend: `@my-better-t-app/backend`
- **Feature-based organization** for frontend
- **Domain-driven design** for backend

## Deployment

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy Convex backend: `pnpm convex deploy`
4. Configure Clerk for production domain
5. Build will use `turbo.json` configuration

### Key Deployment Notes
- Use `import type` for TypeScript types to avoid build errors
- Ensure all environment variables are configured in `turbo.json`
- Convex must be deployed before web app for production URLs

## Development Notes
- Web app runs on port 3001 to avoid conflicts
- Mobile app connects to same Convex backend as web
- Desktop app is built using Tauri (Rust + web frontend)
- All apps share the same real-time data via Convex subscriptions
- File uploads are handled via Convex storage with automatic cleanup
- AI responses stream in real-time for better user experience
- **Production-ready architecture** with proper separation of concerns
- **Scalable design** supports adding new features easily

## 🔧 **TROUBLESHOOTING**

### Common Issues

#### Frontend Build Errors
```bash
# Clear Next.js cache
rm -rf apps/web/.next
pnpm build

# TypeScript errors
pnpm check-types
```

#### Backend Deployment Issues
```bash
# Redeploy Convex functions
cd packages/backend
pnpm convex dev --once
```

#### Missing Types
```bash
# Regenerate Convex types
cd packages/backend
pnpm convex dev
```

### Recently Fixed Issues

#### Schema and Index Problems
- **Fixed**: Misnamed index `by_user_and_created_at` → `by_user`
- **Fixed**: Schema field inconsistencies between database and validators
- **Fixed**: Migration from custom `createdAt` to `_creationTime` system fields

#### AI Integration Issues
- **Fixed**: Message format compatibility with Google Gemini vision API
- **Fixed**: Image attachment processing with proper `type: 'image'` format
- **Fixed**: Empty message content validation for AI streaming placeholders
- **Fixed**: File size limits and concurrent processing errors

#### Security and Performance
- **Fixed**: Information leakage in file access errors
- **Fixed**: Rate limiting implementation for AI endpoints
- **Fixed**: Circular reference handling in error logging
- **Fixed**: Batched streaming updates for performance optimization

#### Validation and Type Safety
- **Fixed**: TypeScript compilation errors across frontend and backend
- **Fixed**: Validator flexibility for empty strings when appropriate
- **Fixed**: Client directive declarations for React components

## Important Instruction Reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
- Always use pnpm for package management
- Follow the established architecture patterns
- Use domain-driven design for backend features
- Use feature-based organization for frontend features
- Always implement proper error handling and authentication