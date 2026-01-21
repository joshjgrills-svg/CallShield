# Shield - AI Call Protection App

## Overview

Shield is a next-generation AI-powered call protection application designed to screen, analyze, and block unwanted calls. The app features real-time voice analysis, an interactive AI assistant that can answer calls on the user's behalf, a community-powered threat database, and customizable defense rules. Built as a full-stack TypeScript application with a React frontend and Express backend, it leverages Replit's AI integrations for chat, voice, and image generation capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Build Tool**: Vite with path aliases (`@/` for client/src, `@shared/` for shared)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **Authentication**: Replit Auth via OpenID Connect with Passport.js
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **API Pattern**: RESTful endpoints defined in `@shared/routes.ts` with Zod validation

### Data Layer
- **Database**: PostgreSQL (provisioned via Replit)
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Migrations**: Generated to `./migrations` folder via `drizzle-kit push`

### Core Data Models
- **calls**: Stores call history with risk scores, categories, and transcriptions
- **blockedRules**: User-defined blocking rules (exact match or wildcard)
- **userSettings**: Per-user configuration (screening, protection level, quiet hours)
- **conversations/messages**: AI chat history for the assistant feature
- **users/sessions**: Authentication and session management (required for Replit Auth)

### AI Integration Layer
Located in `server/replit_integrations/`:
- **chat**: Text-based AI conversations using OpenAI-compatible API
- **audio**: Voice processing with speech-to-text, text-to-speech, and voice chat
- **image**: Image generation via gpt-image-1 model
- **batch**: Utilities for rate-limited batch processing of AI requests

### Build System
- **Development**: `tsx` for TypeScript execution with Vite dev server
- **Production**: esbuild bundles server code, Vite builds client to `dist/public`
- **Key Scripts**: `dev` (development), `build` (production), `db:push` (schema sync)

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### Authentication
- **Replit Auth**: OpenID Connect provider at `https://replit.com/oidc`
- **Required Env Vars**: `REPL_ID`, `SESSION_SECRET`, `ISSUER_URL`

### AI Services (via Replit AI Integrations)
- **OpenAI-compatible API**: Chat completions, speech-to-text, text-to-speech
- **Required Env Vars**: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`
- **Models Used**: GPT for chat, gpt-image-1 for images, Whisper for speech

### Audio Processing
- **ffmpeg**: Required for WebM to WAV conversion (available by default on Replit)
- **Browser APIs**: MediaRecorder for voice capture, AudioWorklet for playback

### UI Components
- **Radix UI**: Accessible primitives (dialogs, dropdowns, tabs, etc.)
- **Recharts**: Dashboard visualization charts
- **Lucide React**: Icon library
- **date-fns**: Date formatting utilities