#!/bin/bash

# Example setup script for Fastify Injecorator

echo "🚀 Setting up Fastify Injecorator Example..."

# Check if we're in the example directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run this script from the example directory."
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
if command -v pnpm &> /dev/null; then
  pnpm install
elif command -v npm &> /dev/null; then
  npm install
else
  echo "❌ Error: Neither pnpm nor npm found. Please install Node.js and pnpm/npm."
  exit 1
fi

# Create files directory if it doesn't exist
if [ ! -d "files" ]; then
  echo "📁 Creating files directory..."
  mkdir -p files
fi

echo "✅ Setup complete!"
echo ""
echo "To start the example server:"
echo "  pnpm dev    # Development mode with hot reload"
echo "  pnpm build  # Build for production"
echo "  pnpm start  # Run production build"
echo ""
echo "The server will be available at http://localhost:3000"
