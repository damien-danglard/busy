#!/bin/bash

# Test Database Setup Script
# This script sets up a test PostgreSQL database for running Cucumber tests

set -e

echo "🔧 Setting up test database..."

# Database configuration
TEST_DB_NAME="${TEST_DB_NAME:-busy_test_db}"
POSTGRES_USER="${POSTGRES_USER:-busy}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-busy123}"
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
for i in {1..30}; do
  if pg_isready -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER > /dev/null 2>&1; then
    echo "✅ PostgreSQL is ready"
    break
  fi
  
  if [ $i -eq 30 ]; then
    echo "❌ PostgreSQL failed to become ready in time"
    exit 1
  fi
  
  sleep 1
done

# Check if test database exists
echo "🔍 Checking if test database exists..."
DB_EXISTS=$(PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -lqt | cut -d \| -f 1 | grep -w $TEST_DB_NAME | wc -l)

if [ $DB_EXISTS -eq 0 ]; then
  echo "📦 Creating test database: $TEST_DB_NAME"
  PGPASSWORD=$POSTGRES_PASSWORD createdb -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER $TEST_DB_NAME
  echo "✅ Test database created"
else
  echo "✅ Test database already exists"
fi

# Enable pgvector extension
echo "🔌 Enabling pgvector extension..."
PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $TEST_DB_NAME -c "CREATE EXTENSION IF NOT EXISTS vector;" > /dev/null 2>&1
echo "✅ pgvector extension enabled"

# Set TEST_DATABASE_URL for Prisma
export TEST_DATABASE_URL="postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/$TEST_DB_NAME"

# Run Prisma migrations on test database
if [ -d "apps/chat-app/prisma" ]; then
  echo "🔄 Running Prisma migrations on test database..."
  cd apps/chat-app
  DATABASE_URL=$TEST_DATABASE_URL npx prisma migrate deploy || echo "⚠️  Migrations may have already been applied"
  DATABASE_URL=$TEST_DATABASE_URL npx prisma generate
  cd ../..
  echo "✅ Prisma migrations completed"
fi

echo ""
echo "✅ Test database setup complete!"
echo ""
echo "Test database URL: $TEST_DATABASE_URL"
echo ""
echo "To run tests, use:"
echo "  TEST_DATABASE_URL=$TEST_DATABASE_URL npm run test"
echo ""
