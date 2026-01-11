import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { PrismaClient } from '@prisma/client';
import { Client } from 'pg';

/**
 * Custom World class for Cucumber tests
 * Provides shared state and utilities across step definitions
 */
export class CustomWorld extends World {
  public testDb?: Client;
  public prisma?: PrismaClient;
  public currentUser?: any;
  public testData: Map<string, any>;
  public lastResponse?: any;
  public lastError?: any;

  constructor(options: IWorldOptions) {
    super(options);
    this.testData = new Map();
  }

  // Helper method to store test data
  setTestData(key: string, value: any): void {
    this.testData.set(key, value);
  }

  // Helper method to retrieve test data
  getTestData(key: string): any {
    return this.testData.get(key);
  }

  // Helper method to create a test user
  async createTestUser(email: string, password: string = 'Test123!'): Promise<any> {
    if (!this.prisma) {
      throw new Error('Prisma client not initialized');
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email,
        name: email.split('@')[0],
        password: hashedPassword,
      },
    });

    this.currentUser = user;
    return user;
  }

  // Helper method to clean up
  async cleanup(): Promise<void> {
    this.testData.clear();
    this.lastResponse = undefined;
    this.lastError = undefined;
    this.currentUser = undefined;
  }
}

setWorldConstructor(CustomWorld);
