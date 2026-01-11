# Automated Tests - Document Module

This directory contains automated BDD (Behavior-Driven Development) tests for the document module using Cucumber and Gherkin.

## Overview

The tests are written in Gherkin format and executed using Cucumber.js with TypeScript step definitions. They test document upload, storage, retrieval, and management functionality.

## Directory Structure

```
tests/
├── step-definitions/       # TypeScript step definitions
│   ├── document-upload.steps.ts
│   ├── document-storage.steps.ts
│   ├── document-retrieval.steps.ts
│   └── document-management.steps.ts
├── support/               # Test support files
│   ├── hooks.ts          # Before/After hooks for test setup
│   └── world.ts          # Custom World for shared test state
├── fixtures/             # Test data and fixtures
└── tsconfig.json         # TypeScript configuration for tests
```

## Prerequisites

1. **Node.js** >= 18.0.0
2. **PostgreSQL** with pgvector extension
3. **Docker** (recommended for database)

## Setup

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `@cucumber/cucumber` - BDD testing framework
- `ts-node` - TypeScript execution
- `pg` - PostgreSQL client
- Other required dependencies

### 2. Set Up Test Database

#### Option A: Using Docker (Recommended)

Start the PostgreSQL container:

```bash
docker compose up -d postgres
```

Run the test database setup script:

```bash
npm run test:setup
```

This will:
- Create a `busy_test_db` database
- Enable the pgvector extension
- Run Prisma migrations
- Generate Prisma client

#### Option B: Manual Setup

If you have PostgreSQL installed locally:

```bash
# Set environment variables
export POSTGRES_USER=busy
export POSTGRES_PASSWORD=busy123
export POSTGRES_HOST=localhost
export POSTGRES_PORT=5432
export TEST_DB_NAME=busy_test_db

# Run setup script
bash ./scripts/test-db-setup.sh
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Document Module Tests Only

```bash
npm run test:document
```

### Run Tests for CI/CD

```bash
npm run test:ci
```

### Run Specific Feature File

```bash
npx cucumber-js docs/features/document/document-upload.feature
```

### Run with Specific Profile

```bash
npx cucumber-js --profile document
```

## Test Profiles

Configured in `cucumber.js`:

- **default**: All tests with detailed reporting
- **document**: Document module tests only
- **ci**: CI/CD optimized (fail-fast, minimal output)

## Environment Variables

Set these environment variables for tests:

```bash
# Test Database
export TEST_DATABASE_URL="postgresql://busy:busy123@localhost:5432/busy_test_db"

# Optional: Override database connection details
export POSTGRES_USER=busy
export POSTGRES_PASSWORD=busy123
export POSTGRES_HOST=localhost
export POSTGRES_PORT=5432
export TEST_DB_NAME=busy_test_db
```

## Writing New Tests

### 1. Create Feature File

Add a new `.feature` file in `docs/features/document/`:

```gherkin
Feature: New Feature
  As a user
  I want to do something
  So that I can achieve a goal

  Scenario: Do something
    Given I have a prerequisite
    When I perform an action
    Then I see the expected result
```

### 2. Implement Step Definitions

Create or update step definition files in `tests/step-definitions/`:

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import * as assert from 'assert';

Given('I have a prerequisite', function (this: CustomWorld) {
  // Setup code
  this.setTestData('key', 'value');
});

When('I perform an action', async function (this: CustomWorld) {
  // Action code
  const result = await performAction();
  this.lastResponse = result;
});

Then('I see the expected result', function (this: CustomWorld) {
  // Assertion code
  assert.ok(this.lastResponse, 'Should have result');
});
```

### 3. Use Custom World

The `CustomWorld` class provides shared state:

```typescript
// Store data
this.setTestData('key', value);

// Retrieve data
const value = this.getTestData('key');

// Access Prisma client
await this.prisma.user.findUnique({ where: { id } });

// Create test user
const user = await this.createTestUser('test@example.com', 'password');

// Store last response/error
this.lastResponse = { status: 200, data: result };
this.lastError = { status: 400, message: 'Error' };
```

## Test Reports

Test results are generated in `test-results/`:

- `cucumber-report.html` - HTML report
- `cucumber-report.json` - JSON report
- `cucumber-report.xml` - JUnit XML report

View HTML report:

```bash
open test-results/cucumber-report.html
```

## Database Cleanup

Tests automatically clean up after themselves using hooks in `tests/support/hooks.ts`:

- **Before**: Initialize connections, clean database
- **After**: Clean database, close connections

Test data uses `test-` prefix for user IDs to facilitate cleanup.

## Troubleshooting

### Database Connection Issues

1. Ensure PostgreSQL is running:
   ```bash
   docker compose ps postgres
   ```

2. Check database exists:
   ```bash
   PGPASSWORD=busy123 psql -h localhost -U busy -l | grep busy_test_db
   ```

3. Test connection:
   ```bash
   PGPASSWORD=busy123 psql -h localhost -U busy -d busy_test_db -c "SELECT 1"
   ```

### Prisma Issues

1. Regenerate Prisma client:
   ```bash
   cd apps/chat-app
   npx prisma generate
   ```

2. Reset migrations:
   ```bash
   DATABASE_URL="postgresql://busy:busy123@localhost:5432/busy_test_db" npx prisma migrate reset --force
   ```

### Test Failures

1. Check test database is clean:
   ```bash
   npm run test:setup
   ```

2. Run single test to isolate issue:
   ```bash
   npx cucumber-js docs/features/document/document-upload.feature:10
   ```
   (Line 10 is the scenario line number)

3. Enable debug output:
   ```bash
   DEBUG=* npm test
   ```

## Best Practices

1. **Keep scenarios focused**: One scenario should test one thing
2. **Use Background**: Extract common setup to Background
3. **Use tables**: For data-driven tests
4. **Clean test data**: Always use `test-` prefix for IDs
5. **Avoid hardcoded waits**: Use proper async/await
6. **Mock external services**: Don't call real APIs in tests
7. **Verify database state**: Check database records when needed

## Contributing

When adding new document features:

1. Write feature file first (Gherkin)
2. Run tests to see missing step definitions
3. Implement step definitions
4. Run tests until they pass
5. Add to CI/CD pipeline

## References

- [Cucumber.js Documentation](https://github.com/cucumber/cucumber-js)
- [Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Feature Files](../docs/features/document/)

---

**Note**: These tests are independent of the application implementation. They define expected behavior which can guide development.
