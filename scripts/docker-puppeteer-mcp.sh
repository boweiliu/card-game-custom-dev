#!/bin/bash

# Docker-based Puppeteer MCP setup for Claude Code
# This runs Puppeteer in a container with all dependencies pre-installed

set -e

echo "🐳 Setting up Docker-based Puppeteer MCP server..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if claude command is available
if ! command -v claude &> /dev/null; then
    echo "❌ Claude Code CLI is not installed."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Create a Dockerfile for Puppeteer MCP server
cat > Dockerfile.puppeteer-mcp << 'EOF'
FROM node:18-slim

# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    libnss3 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libgbm-dev \
    libasound2 \
    libxss1 \
    libxtst6 \
    fonts-liberation \
    libappindicator3-1 \
    xdg-utils \
    wget \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Puppeteer MCP server
RUN npm install -g @modelcontextprotocol/server-puppeteer

# Set Chrome path for Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Expose port for MCP server
EXPOSE 7531

# Start the MCP server
CMD ["npx", "@modelcontextprotocol/server-puppeteer"]
EOF

echo "🔨 Building Docker image for Puppeteer MCP..."
docker build -f Dockerfile.puppeteer-mcp -t puppeteer-mcp .

echo "🚀 Starting Puppeteer MCP container..."
# Stop and remove existing container if it exists
docker stop puppeteer-mcp-server 2>/dev/null || true
docker rm -f puppeteer-mcp-server 2>/dev/null || true

# Run container in background with persistent process
docker run -d --name puppeteer-mcp-server puppeteer-mcp sleep infinity

# Wait a moment for container to start
sleep 3

echo "🔗 Adding Docker-based Puppeteer MCP server to Claude Code..."
# Remove existing puppeteer servers if they exist
claude mcp remove puppeteer 2>/dev/null || true
claude mcp remove puppeteer-docker 2>/dev/null || true

# Add the Docker-based server via stdio
claude mcp add puppeteer-docker docker exec puppeteer-mcp-server npx @modelcontextprotocol/server-puppeteer

echo "📋 Listing configured MCP servers..."
claude mcp list

echo "✅ Docker-based Puppeteer MCP setup complete!"
echo ""
echo "🎯 The Puppeteer MCP server is now running in Docker."
echo "   Container: puppeteer-mcp-server"
echo "   Mode: stdio via docker exec"
echo ""
echo "🔧 Management commands:"
echo "   Stop:    docker stop puppeteer-mcp-server"
echo "   Start:   docker start puppeteer-mcp-server"
echo "   Remove:  docker rm -f puppeteer-mcp-server"
echo "   Logs:    docker logs puppeteer-mcp-server"
echo ""
echo "💡 To remove from Claude Code:"
echo "   claude mcp remove puppeteer-docker"
EOF

chmod +x docker-puppeteer-mcp.sh