import { Given, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import * as assert from 'assert';

/**
 * Common step definitions shared across all document features
 * This prevents duplicate step definition errors
 */

// Common Given steps
Given('I am logged in as {string}', async function (this: CustomWorld, email: string) {
  const user = await this.createTestUser(email);
  this.currentUser = user;
  this.setTestData('isAuthenticated', true);
});

// Common Then steps
Then('I should see a success message {string}', function (this: CustomWorld, expectedMessage: string) {
  assert.ok(this.lastResponse, 'Should have a response');
  assert.strictEqual(this.lastResponse.message, expectedMessage, 
    `Message should be "${expectedMessage}"`);
});

Then('I should receive a {string} error', function (this: CustomWorld, errorType: string) {
  assert.ok(this.lastError, 'Should have an error');
  
  if (errorType === 'forbidden') {
    assert.strictEqual(this.lastError.status, 403, 'Should be a 403 error');
  } else if (errorType === 'not found') {
    assert.strictEqual(this.lastError.status, 404, 'Should be a 404 error');
  }
});
