#!/bin/bash

set -e

echo "🧪 Testing Busy Monorepo Setup..."
echo ""

# Check Docker
echo "✓ Checking Docker..."
docker version > /dev/null 2>&1 || { echo "❌ Docker not found"; exit 1; }

# Check Docker Compose
echo "✓ Checking Docker Compose..."
docker compose version > /dev/null 2>&1 || { echo "❌ Docker Compose not found"; exit 1; }

# Validate docker-compose.yml
echo "✓ Validating docker-compose.yml..."
docker compose config --quiet || { echo "❌ Invalid docker-compose.yml"; exit 1; }

# List services
echo "✓ Services defined:"
docker compose config --services

echo ""
echo "✅ All checks passed!"
echo ""
echo "To start the services, run:"
echo "  docker compose up"
echo ""
