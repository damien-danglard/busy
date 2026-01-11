# Quick Start Guide - Document Module Tests

## Overview

This guide shows you how to quickly run the automated Gherkin/Cucumber tests for the document module.

## Prerequisites

- Docker (for PostgreSQL test database)
- Node.js >= 18.0.0
- npm

## Quick Setup (3 steps)

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Test Database

```bash
# Start PostgreSQL container
docker compose up -d postgres

# OR use the test-specific compose file
docker compose -f docker-compose.test.yml up -d
```

### 3. Set Up Test Database Schema

```bash
npm run test:setup
```

This will:
- Create `busy_test_db` database
- Enable pgvector extension
- Run Prisma migrations

## Running Tests

### Run All Document Tests

```bash
npm run test:document
```

### Run Specific Feature

```bash
# Upload feature
npx cucumber-js docs/features/document/document-upload.feature

# Storage feature
npx cucumber-js docs/features/document/document-storage.feature

# Retrieval feature
npx cucumber-js docs/features/document/document-retrieval.feature

# Management feature
npx cucumber-js docs/features/document/document-management.feature
```

### Run Specific Scenario

```bash
# Run scenario at line 11
npx cucumber-js docs/features/document/document-upload.feature:11
```

### Dry Run (Validate Without Running)

```bash
npx cucumber-js --dry-run --profile document
```

## Test Output

Tests generate reports in `test-results/`:
- `cucumber-report.html` - HTML report (open in browser)
- `cucumber-report.json` - JSON report
- `cucumber-report.xml` - JUnit XML report

## Environment Variables

```bash
# Test database URL (optional, has defaults)
export TEST_DATABASE_URL="postgresql://busy:busy123@localhost:5432/busy_test_db"
```

## What's Tested?

### Document Upload (8 scenarios)
- ✅ Upload PDF successfully
- ✅ Upload multiple files
- ✅ Invalid file type rejection
- ✅ File size limit enforcement
- ✅ Authentication requirement
- ✅ Virus scanning (optional)
- ✅ Automatic categorization

### Document Storage (8 scenarios)
- ✅ Store metadata in database
- ✅ Store files in file system
- ✅ Generate unique IDs
- ✅ User association
- ✅ Hash calculation
- ✅ Tag management
- ✅ Storage failure handling
- ✅ Access history logging

### Document Retrieval (11 scenarios)
- ✅ List user's documents
- ✅ Retrieve by ID
- ✅ Download files
- ✅ Search by title
- ✅ Filter by type
- ✅ Pagination
- ✅ Access control
- ✅ Metadata-only retrieval
- ✅ Recent documents
- ✅ Deleted document handling

### Document Management (13 scenarios)
- ✅ Update metadata
- ✅ Delete document (hard/soft)
- ✅ Restore soft-deleted
- ✅ Rename files
- ✅ Move to folders
- ✅ Share with users
- ✅ Revoke access
- ✅ Version management
- ✅ Bulk operations
- ✅ Archive old documents

## Total Coverage

- **4 feature files**
- **37 scenarios**
- **298 test steps**

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker compose ps postgres

# Check database exists
PGPASSWORD=busy123 psql -h localhost -U busy -l | grep busy_test_db

# Re-run setup
npm run test:setup
```

### Prisma Issues

```bash
# Regenerate Prisma client
cd apps/chat-app
npx prisma generate

# Reset migrations
DATABASE_URL="postgresql://busy:busy123@localhost:5432/busy_test_db" npx prisma migrate reset --force
```

### TypeScript Errors

```bash
# Check TypeScript compilation
cd tests
npx tsc --noEmit
```

## Next Steps

1. **Run the tests**: `npm run test:document`
2. **View HTML report**: Open `test-results/cucumber-report.html`
3. **Read full docs**: See `tests/README.md`
4. **Read feature specs**: See `docs/features/document/README.md`

## CI/CD Integration

For continuous integration:

```bash
# Run in CI mode (fail-fast, minimal output)
npm run test:ci
```

## Need Help?

- **Test documentation**: `tests/README.md`
- **Feature documentation**: `docs/features/document/README.md`
- **Gherkin guidelines**: `.github/instructions/GHERKIN.instructions.md`

---

**Note**: These tests define expected behavior. They can guide development or validate existing implementations.
