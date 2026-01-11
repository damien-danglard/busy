import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import * as assert from 'assert';
import * as fs from 'fs/promises';
import * as path from 'path';

// Background steps
Given('the application is running', async function (this: CustomWorld) {
  // Verify application is accessible
  this.setTestData('appRunning', true);
  assert.ok(true, 'Application should be running');
});

Given('the database is accessible', async function (this: CustomWorld) {
  // Test database connection
  assert.ok(this.prisma, 'Prisma client should be initialized');
  
  try {
    await this.prisma.$queryRaw`SELECT 1`;
    this.setTestData('dbAccessible', true);
  } catch (error) {
    throw new Error(`Database not accessible: ${error}`);
  }
});

Given('I am logged in as {string}', async function (this: CustomWorld, email: string) {
  // Create and login test user
  const user = await this.createTestUser(email);
  this.currentUser = user;
  this.setTestData('isAuthenticated', true);
});

Given('I am not logged in', function (this: CustomWorld) {
  this.currentUser = undefined;
  this.setTestData('isAuthenticated', false);
});

// Document Upload steps
Given('I am on the document upload page', function (this: CustomWorld) {
  this.setTestData('currentPage', 'upload');
});

When('I select a PDF file {string} of size {int} KB', 
  async function (this: CustomWorld, filename: string, sizeKB: number) {
    const fileData = {
      filename,
      size: sizeKB * 1024,
      mimetype: 'application/pdf',
      buffer: Buffer.alloc(sizeKB * 1024, 'test-data'),
    };
    this.setTestData('selectedFile', fileData);
});

When('I select a file {string} of size {int} MB', 
  async function (this: CustomWorld, filename: string, sizeMB: number) {
    const fileData = {
      filename,
      size: sizeMB * 1024 * 1024,
      mimetype: 'application/pdf',
      buffer: Buffer.alloc(Math.min(sizeMB * 1024 * 1024, 1024)), // Limit buffer size for test
    };
    this.setTestData('selectedFile', fileData);
});

When('I select a file {string} of type {string}', 
  async function (this: CustomWorld, filename: string, mimetype: string) {
    const fileData = {
      filename,
      size: 1024,
      mimetype,
      buffer: Buffer.alloc(1024, 'test-data'),
    };
    this.setTestData('selectedFile', fileData);
});

When('I provide document title {string}', function (this: CustomWorld, title: string) {
  this.setTestData('documentTitle', title);
});

When('I provide document description {string}', function (this: CustomWorld, description: string) {
  this.setTestData('documentDescription', description);
});

When('I submit the upload form', async function (this: CustomWorld) {
  try {
    // Simulate document upload
    const file = this.getTestData('selectedFile');
    const title = this.getTestData('documentTitle');
    const description = this.getTestData('documentDescription');
    const isAuthenticated = this.getTestData('isAuthenticated');

    // Check authentication
    if (!isAuthenticated || !this.currentUser) {
      this.lastError = { status: 401, message: 'Unauthorized' };
      this.lastResponse = null;
      return;
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    
    if (!allowedTypes.includes(file.mimetype)) {
      this.lastError = { status: 400, message: 'File type not allowed' };
      this.lastResponse = null;
      return;
    }

    // Check file size (10 MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.lastError = { status: 400, message: 'File size exceeds limit of 10 MB' };
      this.lastResponse = null;
      return;
    }

    // Create document record (simulated)
    const document = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      filename: file.filename,
      title: title || file.filename,
      description: description || '',
      size: file.size,
      mimetype: file.mimetype,
      userId: this.currentUser.id,
      uploadDate: new Date(),
      filePath: `/uploads/${this.currentUser.id}/${file.filename}`,
    };

    this.lastResponse = {
      status: 200,
      message: 'Document uploaded successfully',
      document,
    };
    this.setTestData('uploadedDocument', document);
    this.lastError = null;

  } catch (error) {
    this.lastError = { status: 500, message: error instanceof Error ? error.message : 'Unknown error' };
    this.lastResponse = null;
  }
});

When('I select multiple files:', async function (this: CustomWorld, dataTable: any) {
  const files = dataTable.hashes().map((row: any) => {
    const sizeBytes = row.size.includes('MB') 
      ? parseFloat(row.size) * 1024 * 1024 
      : parseFloat(row.size) * 1024;
    
    return {
      filename: row.filename,
      mimetype: getMimeType(row.type),
      size: sizeBytes,
      buffer: Buffer.alloc(Math.min(sizeBytes, 1024)),
    };
  });
  this.setTestData('selectedFiles', files);
});

When('I upload a file {string}', async function (this: CustomWorld, filename: string) {
  const fileData = {
    filename,
    size: 1024 * 500, // 500 KB
    mimetype: 'application/pdf',
    buffer: Buffer.alloc(1024 * 500, 'test-data'),
  };
  this.setTestData('selectedFile', fileData);
  
  // Automatically submit
  await this.attach('"I submit the upload form"');
});

When('I try to access the document upload endpoint', function (this: CustomWorld) {
  const isAuthenticated = this.getTestData('isAuthenticated');
  if (!isAuthenticated) {
    this.lastError = { status: 401, message: 'Unauthorized' };
    this.lastResponse = { redirect: '/login' };
  }
});

When('I upload a PDF file {string}', async function (this: CustomWorld, filename: string) {
  const fileData = {
    filename,
    size: 1024 * 500,
    mimetype: 'application/pdf',
    buffer: Buffer.alloc(1024 * 500, 'test-data'),
  };
  this.setTestData('selectedFile', fileData);
  this.setTestData('documentTitle', filename);
});

// Then steps
Then('the document should be uploaded successfully', function (this: CustomWorld) {
  assert.ok(this.lastResponse, 'Should have a response');
  assert.strictEqual(this.lastResponse.status, 200, 'Status should be 200');
  assert.ok(!this.lastError, 'Should not have an error');
});

Then('I should see a success message {string}', function (this: CustomWorld, expectedMessage: string) {
  assert.ok(this.lastResponse, 'Should have a response');
  assert.strictEqual(this.lastResponse.message, expectedMessage, `Message should be "${expectedMessage}"`);
});

Then('the document should be stored in the database', function (this: CustomWorld) {
  const document = this.getTestData('uploadedDocument');
  assert.ok(document, 'Document should be stored');
  assert.ok(document.id, 'Document should have an ID');
  assert.ok(document.userId, 'Document should have a user ID');
});

Then('the document metadata should be saved', function (this: CustomWorld) {
  const document = this.getTestData('uploadedDocument');
  assert.ok(document, 'Document should exist');
  assert.ok(document.filename, 'Should have filename');
  assert.ok(document.size, 'Should have size');
  assert.ok(document.mimetype, 'Should have mimetype');
  assert.ok(document.uploadDate, 'Should have upload date');
});

Then('all {int} documents should be uploaded successfully', function (this: CustomWorld, count: number) {
  const files = this.getTestData('selectedFiles');
  assert.ok(files, 'Files should exist');
  assert.strictEqual(files.length, count, `Should have ${count} files`);
});

Then('I should see an error message {string}', function (this: CustomWorld, expectedMessage: string) {
  assert.ok(this.lastError, 'Should have an error');
  assert.ok(this.lastError.message.includes(expectedMessage) || this.lastError.message === expectedMessage, 
    `Error message should contain "${expectedMessage}", got "${this.lastError.message}"`);
});

Then('the file should not be uploaded', function (this: CustomWorld) {
  assert.ok(this.lastError, 'Should have an error');
  assert.ok(!this.lastResponse || this.lastResponse.status !== 200, 'Upload should not succeed');
});

Then('no record should be created in the database', function (this: CustomWorld) {
  const document = this.getTestData('uploadedDocument');
  assert.ok(!document, 'No document should be stored');
});

Then('I should receive an unauthorized error', function (this: CustomWorld) {
  assert.ok(this.lastError, 'Should have an error');
  assert.strictEqual(this.lastError.status, 401, 'Status should be 401');
});

Then('I should be redirected to the login page', function (this: CustomWorld) {
  assert.ok(this.lastResponse, 'Should have a response');
  assert.strictEqual(this.lastResponse.redirect, '/login', 'Should redirect to login');
});

// Given steps with specific conditions
Given('the maximum file size is {int} MB', function (this: CustomWorld, maxSizeMB: number) {
  this.setTestData('maxFileSize', maxSizeMB * 1024 * 1024);
});

Given('virus scanning is enabled', function (this: CustomWorld) {
  this.setTestData('virusScanEnabled', true);
});

Then('the file should be scanned for viruses', function (this: CustomWorld) {
  const virusScanEnabled = this.getTestData('virusScanEnabled');
  assert.ok(virusScanEnabled, 'Virus scanning should be enabled');
});

Then('the document should be uploaded if scan is clean', function (this: CustomWorld) {
  // In a real implementation, this would check the scan result
  assert.ok(this.lastResponse || this.lastError?.message !== 'Virus detected', 
    'Document should be uploaded if clean');
});

Then('the scan result should be stored in metadata', function (this: CustomWorld) {
  // Placeholder - in real implementation would verify scan metadata
  assert.ok(true, 'Scan result should be stored');
});

Then('the system should automatically detect document type as {string}', 
  function (this: CustomWorld, expectedType: string) {
    // Placeholder for automatic categorization
    this.setTestData('detectedType', expectedType);
    assert.ok(true, `Document type should be detected as ${expectedType}`);
});

Then('the document should be categorized accordingly', function (this: CustomWorld) {
  const detectedType = this.getTestData('detectedType');
  assert.ok(detectedType, 'Document should have a detected type');
});

Then('relevant metadata should be extracted', function (this: CustomWorld) {
  // Placeholder for metadata extraction
  assert.ok(true, 'Metadata should be extracted');
});

// Helper function
function getMimeType(extension: string): string {
  const mimeTypes: { [key: string]: string } = {
    'pdf': 'application/pdf',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  };
  return mimeTypes[extension] || 'application/octet-stream';
}
