# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a Better-T-Stack monorepo using Turborepo with:
- **Web App** (`apps/web/`): Next.js frontend with Tauri desktop app support
- **Native App** (`apps/native/`): React Native/Expo mobile app  
- **Backend** (`packages/backend/`): Convex backend-as-a-service

All apps share the same Convex backend for data synchronization across platforms.

### Technology Stack
- **Frontend**: Next.js 15 with React 19, TailwindCSS, shadcn/ui components
- **Mobile**: React Native with Expo, NativeWind for styling
- **Desktop**: Tauri for native desktop apps
- **Backend**: Convex for real-time data, TypeScript
- **Monorepo**: Turborepo with pnpm workspaces

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
```

## Convex Backend Guidelines

Follow the comprehensive Convex rules documented in `ai_docs/convex/convex_rules.md`. Key points:

### Function Syntax
- Always use new function syntax with `args` and `returns` validators
- Import functions from `./_generated/server`
- Use `v.null()` for functions that don't return values

### File Organization
- Public functions: `query`, `mutation`, `action` in any convex/*.ts file
- Internal functions: `internalQuery`, `internalMutation`, `internalAction`
- Schema definitions in `convex/schema.ts`

### Function References
- Use `api.filename.functionName` for public functions
- Use `internal.filename.functionName` for internal functions

## UI Components

This project uses shadcn/ui components. Available components are documented in `ai_docs/shadcnui_rules.md`. To add new components:

```bash
pnpm dlx shadcn@latest add button
```

## File Structure Conventions

```
my-better-t-app/
├── apps/
│   ├── web/           # Next.js web app + Tauri
│   │   ├── src/       # React components and pages
│   │   └── src-tauri/ # Tauri desktop app config
│   └── native/        # React Native/Expo mobile app
│       ├── app/       # Expo Router pages
│       └── components/ # Shared mobile components
├── packages/
│   └── backend/       # Convex backend
│       └── convex/    # Convex functions and schema
└── ai_docs/           # Development guidelines and rules
```

## Code Style
- TypeScript strict mode enabled across all apps
- TailwindCSS for styling (web uses v4, native uses v3 via NativeWind)
- Consistent component patterns between web and native where possible
- Use workspace imports for shared backend: `@my-better-t-app/backend`

## Development Notes
- Web app runs on port 3001 to avoid conflicts
- Mobile app connects to same Convex backend as web
- Desktop app is built using Tauri (Rust + web frontend)
- All apps share the same real-time data via Convex subscriptions