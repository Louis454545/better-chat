# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack TypeScript application built with the Better-T-Stack, featuring:
- **Frontend**: Next.js 15 with App Router, React 19, TailwindCSS, shadcn/ui
- **Mobile**: React Native with Expo  
- **Desktop**: Tauri integration
- **Backend**: Convex reactive backend-as-a-service
- **Authentication**: Clerk
- **AI Integration**: Vercel AI SDK with Google AI provider
- **Build System**: Turborepo monorepo with pnpm

## Common Commands

### Development
```bash
# Start all applications
pnpm dev

# Start specific applications
pnpm dev:web         # Next.js web app (port 3001)
pnpm dev:native      # React Native/Expo app
pnpm dev:server      # Convex backend only
pnpm dev:setup       # Initial Convex setup and configuration

# Desktop development (from apps/web)
cd apps/web && pnpm desktop:dev    # Tauri development
cd apps/web && pnpm desktop:build  # Tauri build
```

### Build & Type Checking
```bash
pnpm build           # Build all apps
pnpm check-types     # TypeScript check across all packages
```

### Linting (app-specific)
```bash
cd apps/web && pnpm lint     # Next.js linting
```

## Architecture

### Monorepo Structure
```
apps/
├── web/            # Next.js web application (port 3001)
│   ├── src/app/    # App Router pages and API routes
│   ├── src/components/  # Shared UI components
│   ├── src/features/    # Feature-specific components and hooks
│   └── src-tauri/       # Tauri desktop app configuration
├── native/         # React Native/Expo mobile app
packages/
└── backend/        # Convex backend functions and schema
    └── convex/     # Convex functions, schema, and domain logic
```

### Backend Architecture (Convex)
- **Domain-driven structure** in `packages/backend/convex/domains/`
  - `ai/` - AI service integration
  - `auth/` - Authentication logic  
  - `conversations/` - Chat conversation management
  - `messages/` - Message handling
  - `files/` - File upload/management
  - `settings/` - User settings
- **Schema**: Defined in `packages/backend/convex/schema.ts`
- **Shared utilities**: `packages/backend/convex/shared/`

### Frontend Architecture
- **Feature-based organization** in `src/features/`
- **Shared components** in `src/components/`
- **UI components** following shadcn/ui patterns in `src/components/ui/`
- **Authentication** via Clerk with middleware protection
- **AI Integration** using Vercel AI SDK

## Key Technologies & Patterns

### Convex Backend
- Uses new function syntax with args/returns validators
- Domain-driven file organization
- Internal vs public function separation
- Real-time reactivity for chat functionality

### Authentication (Clerk)
- Configured in `middleware.ts` with `clerkMiddleware()`
- Wrapped in `<ClerkProvider>` in `app/layout.tsx`
- Uses App Router patterns (not Pages Router)

### AI Integration
- Vercel AI SDK with Google AI provider
- Streaming responses for chat interface
- Integration through Convex actions

### Styling
- TailwindCSS with v4 configuration
- shadcn/ui component library
- Theme support with next-themes

## Environment Setup

1. Install dependencies: `pnpm install`
2. Set up Convex: `pnpm dev:setup` (follow prompts)
3. Configure environment variables for Clerk and AI services
4. Start development: `pnpm dev`

## Important Notes

- Web app runs on port 3001 (not 3000)
- Always use pnpm as package manager
- Follow domain-driven architecture when adding Convex functions
- Use feature-based organization for frontend components
- Maintain TypeScript strict mode across all packages