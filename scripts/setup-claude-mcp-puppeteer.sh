#!/bin/bash

# Setup script for Claude Code with @modelcontextprotocol/server-puppeteer
# This script installs and configures the Puppeteer MCP server for Claude Code

set -e  # Exit on any error

echo "🚀 Setting up Claude Code with Puppeteer MCP server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npx is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx is not available. Please install npm/Node.js properly."
    exit 1
fi

# Check if claude command is available
if ! command -v claude &> /dev/null; then
    echo "❌ Claude Code CLI is not installed. Please install it first:"
    echo "   npm install -g @anthropic-ai/claude-code"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install the Puppeteer MCP server globally
echo "📦 Installing @modelcontextprotocol/server-puppeteer..."
npm install -g @modelcontextprotocol/server-puppeteer

echo "🔗 Adding Puppeteer MCP server to Claude Code..."

# Add the MCP server to Claude Code
# The server will be available as 'puppeteer' and will use npx to run
claude mcp add puppeteer npx @modelcontextprotocol/server-puppeteer

echo "📋 Listing configured MCP servers..."
claude mcp list

echo "✅ Setup complete!"
echo ""
echo "🎯 The Puppeteer MCP server is now configured with Claude Code."
echo "   This provides web automation capabilities including:"
echo "   - Screenshot capture"
echo "   - Web page navigation"
echo "   - Form interaction"
echo "   - Element clicking and typing"
echo ""
echo "💡 Usage:"
echo "   Start Claude Code and the Puppeteer tools will be available automatically."
echo "   Use commands like 'take a screenshot of https://example.com'"
echo ""
echo "🔧 To remove this server later:"
echo "   claude mcp remove puppeteer"