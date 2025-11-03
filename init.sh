#!/bin/bash

set -e

echo "🚀 Initializing Busy Monorepo..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your OPENAI_API_KEY"
fi

# Create chat-app .env file if it doesn't exist
if [ ! -f apps/chat-app/.env ]; then
    echo "📝 Creating chat-app .env file from template..."
    cp apps/chat-app/.env.example apps/chat-app/.env
fi

echo ""
echo "✅ Initialization complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and add your OPENAI_API_KEY"
echo "2. Run 'docker-compose up' to start all services"
echo "3. Access the applications:"
echo "   - Chat App: http://localhost:3000"
echo "   - n8n: http://localhost:5678 (admin/admin)"
echo ""
