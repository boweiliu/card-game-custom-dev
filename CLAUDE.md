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
- **Entry Point**: `src/frontend/index.ts` - Initializes CardManager and sets up the application
- **Module System**: Uses CSS modules for styling (`.module.less` files) with localized class names
- **Component Pattern**: Template-based components using jQuery for DOM manipulation
- **State Management**: CardManager class handles card CRUD operations and backend communication
- **Styling**: LESS with CSS modules, global styles in `styles.less`

### Backend Architecture
- **Server**: Express.js server in `src/server/index.ts`
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

### Styling Guidelines
- **DEPRECATED**: `src/frontend/styles.less` is deprecated - do not add new styles here
- **Use CSS Modules**: All new component styles should go in `.module.less` files
- **Global Styles**: Apply global styles through the app-root element or component-specific modules
- **Scoped Styling**: Use CSS modules' `:global()` syntax only when absolutely necessary for global resets

### Port Configuration
- Frontend dev: `PORT` environment variable (default 4321)
- Backend dev: `BE_PORT` environment variable (default 43210)
- Production backend: `PORT` environment variable (default 3001)

## Deployment

- **Docker**: Uses `deploy.sh` for local Docker builds and runs
- **Fly.io**: Deployed to https://card-game-custom-dev.fly.dev/ via git push to main