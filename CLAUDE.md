# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Local Development

- `npm run dev` - Runs both frontend and backend with hot reload (FE on port 4321, BE on port 43210)
- `npm run dev:fe` - Frontend only with webpack dev server
- `npm run dev:be` - Backend only with ts-node-dev

### Building & Production

- `npm run build` - Builds both frontend and backend for production
- `npm run clean` - Removes dist directory
- `npm run prod` - Full production build and start

### Testing & Quality

- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run format` - Format code and run all linters
- `npm run format:check` - Check formatting without fixing
- `npm run lint:eslint` - Run ESLint
- `npm run lint:css` - Run Stylelint for LESS/CSS

## Architecture Overview

This is a full-stack TypeScript card game/sticky note simulator with:

### Frontend Architecture

- **Entry Point**: `src/frontend/frontend.ts` - Initializes CardManager and sets up the application
- **Module System**: Uses CSS modules for styling (`.module.less` files) with localized class names
- **Component Pattern**: Template-based components using jQuery for DOM manipulation
- **State Management**: CardManager class handles card CRUD operations and backend communication
- **Styling**: LESS with CSS modules, global styles in `styles.less`

### Backend Architecture

- **Server**: Express.js server in `src/server/server.ts`
- **API Pattern**: RESTful endpoints under `/api/` prefix
- **Development Mode**: Backend redirects non-API routes to frontend dev server
- **Production Mode**: Backend serves static frontend files from `dist/frontend`

### Build System

- **Frontend**: Webpack with TypeScript, LESS, and CSS modules support
- **Backend**: TypeScript compilation to `dist/` directory
- **Development**: Concurrent frontend/backend servers with proxy configuration
- **Production**: Static file serving through Express

### Key Design Patterns

- **ID Management**: Centralized div ID constants in `div-ids.ts` with jQuery helper functions
- **Template System**: String-based HTML templates for dynamic content generation
- **CSS Modules**: Scoped styling with `.module.less` files for component isolation
- **Proxy Setup**: Frontend dev server proxies `/api` requests to backend
- **Shared Types**: TypeScript interfaces organized by domain in `src/shared/types/` used by both frontend and backend

### Code Style & Organization Guidelines

#### File Naming & Structure

- **No index.ts files**: Name files descriptively (e.g., `frontend.ts`, `server.ts`, `db.ts`)
- **No re-exports**: Import directly from source files, avoid `export { ... } from '...'`
- **Absolute imports only**: Use `@/` prefix for all imports, no relative imports (`./` or `../`)
- **Separated types**: Organize types by domain:
  - `@/shared/types/db.ts` - Database entity types
  - `@/shared/types/api.ts` - API request/response types for all routes
  - `@/shared/types/responses.ts` - Transport wrapper types (Response<T>, ErrorResponse, ApiResponse<T>)
  - `@/shared/types/sse.ts` - Server-Sent Events types

#### Import Standards

- **Enforced by ESLint**: Relative imports (`./` or `../`) are banned
- **Absolute imports**: Always use `@/` prefix (e.g., `@/frontend/container`, `@/server/db/repository`)
- **Direct imports**: Import types and functions directly from their source files
- **No convenience re-exports**: Each file should import exactly what it needs from the originating module

#### Database & Backend Patterns

- **Repository pattern**: Database operations wrapped in async methods with proper error handling
- **Route modularity**: Express routes organized by domain (protocards, sse, misc)
- **Database initialization**: Pass server root path explicitly rather than detecting git root
- **Separation of concerns**:
  - `schemas.ts` - Table creation SQL
  - `queries.ts` - Query templates
  - `repository.ts` - Database operations
  - `db.ts` - Initialization and setup

#### Styling Guidelines

- **DEPRECATED**: `src/frontend/styles.less` is deprecated - do not add new styles here
- **Use CSS Modules**: All new component styles should go in `.module.less` files
- **Global Styles**: Apply global styles through the app-root element or component-specific modules
- **Scoped Styling**: Use CSS modules' `:global()` syntax only when absolutely necessary for global resets
- **Centralized Colors**: Use the CSS custom properties color system:
  - **Single source of truth**: Colors are defined as CSS custom properties in `colors.less` (`:root { --primary-blue: #007acc; }`)
  - **LESS files**: Import `./colors.less` and use LESS variables like `@primary-blue`, `@text-primary` (which reference CSS vars)
  - **TypeScript files**: Use CSS classes like `.textError`, `.textPrimary`, `.bgPrimary` instead of inline styles
  - **No duplication**: Colors are defined once in CSS custom properties, with utility classes available everywhere
  - **Avoid inline styles**: Always use CSS classes instead of `element.css('color', 'red')` or similar
  - **Never use hardcoded colors** - always reference the centralized color system
- **Separation of Concerns**: Split CSS classes by purpose:
  - **Positioning classes**: Handle `position`, `inset`, `z-index` (how element fits in its parent)
  - **Layout classes**: Handle `display`, `flex-direction`, `background-color` (how element arranges its children)
  - This makes styles more reusable and easier to maintain
- **CSS Modules Class Names**: Always use `styles.className` instead of string literals like `'className'`
  - Use `styles.active` not `'active'`, `styles.hidden` not `'hidden'`, etc.
  - This ensures proper CSS module scoping and prevents class name conflicts
  - **IMPORTANT**: Do not use plain classes, use styles to refer to CSS module classes

### TODO Workflow

- When completing a TODO item, mark it as "[OK]" and wait for human verification
- Only humans should mark items as "[DONE]"
- This ensures proper testing and validation of implemented features

### Port Configuration

- Frontend dev: `PORT` environment variable (default 4321)
- Backend dev: `BE_PORT` environment variable (default 43210)
- Production backend: `PORT` environment variable (default 3001)

## Deployment

- **Docker**: Uses `deploy.sh` for local Docker builds and runs
- **Fly.io**: Deployed to https://card-game-custom-dev.fly.dev/ via git push to main

### Commit Guidelines

- Use brief commit messages, this is a toy project

### Execution Guidance

- When executing sudo commands, write into a script for human since you do not have sudo

## Development Branch Guidance

- Work off of dev branch, not main, which is production
- When in a git worktree working against dev branch: 
  - Do NOT pull or switch to dev branch
  - DO remember to fetch origin and merge dev
