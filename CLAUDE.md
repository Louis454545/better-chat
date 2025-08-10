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
- **Convex file storage** with secure upload URLs
- **AI vision** - Google Gemini can analyze uploaded images
- **File cleanup** - Automatic deletion of unused files after 30 days of inactivity

#### Authentication & Security
- **Clerk authentication** with sign-in/sign-up modals
- **User isolation** - Each user sees only their own conversations
- **Secure file access** - Files are scoped to authenticated users
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

## Convex Backend Guidelines

Follow the comprehensive Convex rules documented in `ai_docs/convex/convex_rules.md`. Key points:

### Function Syntax
- Always use new function syntax with `args` and `returns` validators
- Import functions from `./_generated/server`
- Use `v.null()` for functions that don't return values

### File Organization
- Public functions: `query`, `mutation`, `action` in any convex/*.ts files
- Internal functions: `internalQuery`, `internalMutation`, `internalAction`
- Schema definitions in `convex/schema.ts`

### Function References
- Use `api.filename.functionName` for public functions
- Use `internal.filename.functionName` for internal functions

### Current Backend Functions

#### Authentication (`convex/auth.config.js`)
- Clerk integration with JWT validation
- User identity management

#### Conversations (`convex/conversations.ts`)
- `getConversations` - List user's conversations
- `createConversation` - Create new conversation
- `updateLastAccessed` - Track conversation activity

#### Messages (`convex/messages.ts`)
- `getMessages` - Get messages for a conversation
- `saveMessage` - Save new message with optional attachments
- `updateMessage` - Update message content (for streaming)

#### Settings (`convex/settings.ts`)
- `getUserSettings` - Get user's API key and model preferences
- `updateUserSettings` - Update user settings

#### Files (`convex/files.ts`)
- `generateUploadUrl` - Create secure upload URL for files
- `getFileUrl` - Get public URL for stored file
- `getFileMetadata` - Get file information
- `deleteFile` - Remove file from storage

#### AI Integration (`convex/ai.ts`)
- `generateAIResponse` - Generate AI response (non-streaming)
- `generateAIResponseStream` - Generate AI response with streaming
- Supports file attachments with Google Gemini vision
- Real-time message updates during streaming

#### Cleanup (`convex/cleanup.ts`)
- `cleanupOldData` - Remove conversations inactive for 30+ days
- `cleanupOrphanedFiles` - Remove unreferenced files
- Automated cron jobs for maintenance

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
│   ├── web/           # Next.js web app + Tauri
│   │   ├── src/       # React components and pages
│   │   ├── src-tauri/ # Tauri desktop app config
│   │   └── .env.local # Environment variables
│   └── native/        # React Native/Expo mobile app
│       ├── app/       # Expo Router pages
│       └── components/ # Shared mobile components
├── packages/
│   └── backend/       # Convex backend
│       ├── convex/    # Convex functions and schema
│       └── .env.local # Environment variables
├── ai_docs/           # Development guidelines and rules
├── turbo.json         # Turborepo configuration
└── CLAUDE.md          # This file
```

## Code Style
- TypeScript strict mode enabled across all apps
- Use `import type` for type-only imports
- TailwindCSS for styling (web uses v4, native uses v3 via NativeWind)
- Consistent component patterns between web and native where possible
- Use workspace imports for shared backend: `@my-better-t-app/backend`

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

## Important Instruction Reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.