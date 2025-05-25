# Frontend build stage - builds only frontend assets
FROM node:20 AS frontend-builder

WORKDIR /usr/src/app

# Copy package files
COPY package.json ./
COPY package-lock.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy only files needed for frontend build
COPY webpack.config.js ./
COPY tsconfig.json ./
COPY public/ ./public/
COPY src/frontend/ ./src/frontend/
COPY src/shared/ ./src/shared/
COPY src/declarations.d.ts ./src/declarations.d.ts

# Build frontend
RUN npm run build:fe

# Backend build stage - builds only backend code
FROM node:20 AS backend-builder

WORKDIR /usr/src/app

# Copy package files
COPY package.json ./
COPY package-lock.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy only files needed for backend build
COPY tsconfig.json ./
COPY src/server/ ./src/server/
COPY src/shared/ ./src/shared/
COPY src/declarations.d.ts ./src/declarations.d.ts

# Build backend
RUN npm run build:be

# Final production stage - combine artifacts and run
FROM node:20

WORKDIR /usr/src/app

# Copy package files
COPY package.json ./
COPY package-lock.json ./

# Install only production dependencies
RUN npm install --production

# Copy built frontend from frontend-builder stage
COPY --from=frontend-builder /usr/src/app/dist/frontend ./dist/frontend

# Copy built backend from backend-builder stage
COPY --from=backend-builder /usr/src/app/dist/server ./dist/server
COPY --from=backend-builder /usr/src/app/dist/shared ./dist/shared

# Copy db directory for database files
COPY db/ ./db/

EXPOSE 3001
ENV NODE_ENV=production
CMD ["npm", "run", "prod:be"]
