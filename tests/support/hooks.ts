import { Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { PrismaClient } from '@prisma/client';
import { Client } from 'pg';

// Set default timeout for steps (30 seconds)
setDefaultTimeout(30 * 1000);

// Test database connection
let testDb: Client;
let prisma: PrismaClient;

// Database configuration for tests
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 
  'postgresql://busy:busy123@localhost:5432/busy_test_db';

Before(async function () {
  // Initialize test database connection
  testDb = new Client({
    connectionString: TEST_DATABASE_URL,
  });

  try {
    await testDb.connect();
    
    // Initialize Prisma client for test database
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: TEST_DATABASE_URL,
        },
      },
    });

    // Clean up test data before each scenario
    await cleanupDatabase();
    
    // Store instances in world for access in step definitions
    this.testDb = testDb;
    this.prisma = prisma;
    
  } catch (error) {
    console.error('Failed to connect to test database:', error);
    throw error;
  }
});

After(async function () {
  // Clean up after each scenario
  await cleanupDatabase();
  
  // Close connections
  if (prisma) {
    await prisma.$disconnect();
  }
  if (testDb) {
    await testDb.end();
  }
});

async function cleanupDatabase() {
  if (!prisma) return;
  
  try {
    // Delete test data in correct order (respecting foreign keys)
    await prisma.$executeRaw`DELETE FROM "Memory" WHERE "userId" LIKE 'test-%'`;
    await prisma.$executeRaw`DELETE FROM "Session" WHERE "userId" LIKE 'test-%'`;
    await prisma.$executeRaw`DELETE FROM "Account" WHERE "userId" LIKE 'test-%'`;
    await prisma.$executeRaw`DELETE FROM "User" WHERE id LIKE 'test-%'`;
    await prisma.$executeRaw`DELETE FROM "Message"`;
    await prisma.$executeRaw`DELETE FROM "Conversation"`;
  } catch (error) {
    console.error('Error cleaning up database:', error);
    // Don't throw - allow tests to continue
  }
}

export { testDb, prisma };
