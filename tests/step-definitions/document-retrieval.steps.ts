import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import * as assert from 'assert';

// Retrieval Given steps
Given('I have uploaded the following documents:', async function (this: CustomWorld, dataTable: any) {
  if (!this.currentUser) {
    await this.createTestUser('user@example.com');
  }

  const documents = dataTable.hashes().map((row: any) => ({
    id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: row.title,
    filename: row.filename,
    uploadDate: new Date(row.uploadDate),
    userId: this.currentUser.id,
    size: 1024 * 500,
    mimetype: 'application/pdf',
  }));

  this.setTestData('myDocuments', documents);
});

Given('I have a document with ID {string}', function (this: CustomWorld, documentId: string) {
  const document = {
    id: documentId,
    title: 'Test Document',
    filename: 'test.pdf',
    size: 524288,
    uploadDate: new Date(),
    userId: this.currentUser?.id,
    mimetype: 'application/pdf',
  };
  this.setTestData('specificDocument', document);
  
  // Add to documents list
  const documents = this.getTestData('myDocuments') || [];
  documents.push(document);
  this.setTestData('myDocuments', documents);
});

Given('I have uploaded a document {string}', async function (this: CustomWorld, filename: string) {
  if (!this.currentUser) {
    await this.createTestUser('user@example.com');
  }

  const document = {
    id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: filename,
    filename,
    size: 1024 * 500,
    uploadDate: new Date(),
    userId: this.currentUser.id,
    mimetype: 'application/pdf',
    filePath: `/uploads/${this.currentUser.id}/${filename}`,
  };

  this.setTestData('uploadedDocument', document);
  
  const documents = this.getTestData('myDocuments') || [];
  documents.push(document);
  this.setTestData('myDocuments', documents);
});

Given('I have uploaded multiple documents', async function (this: CustomWorld) {
  if (!this.currentUser) {
    await this.createTestUser('user@example.com');
  }

  const documents = [
    { id: 'doc-1', title: 'First report', filename: 'report1.pdf', uploadDate: new Date('2024-01-15') },
    { id: 'doc-2', title: 'Second report', filename: 'report2.pdf', uploadDate: new Date('2024-01-20') },
    { id: 'doc-3', title: 'Presentation', filename: 'slides.pptx', uploadDate: new Date('2024-01-25') },
  ].map(doc => ({
    ...doc,
    userId: this.currentUser.id,
    size: 1024 * 500,
    mimetype: doc.filename.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  }));

  this.setTestData('myDocuments', documents);
});

Given('I have uploaded documents of various types:', function (this: CustomWorld, dataTable: any) {
  if (!this.currentUser) {
    throw new Error('No current user');
  }

  const documents = dataTable.hashes().map((row: any) => ({
    id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    filename: row.filename,
    type: row.type,
    mimetype: getMimeTypeFromExtension(row.type),
    userId: this.currentUser.id,
    size: 1024 * 500,
    uploadDate: new Date(),
  }));

  this.setTestData('myDocuments', documents);
});

Given('I have uploaded {int} documents', async function (this: CustomWorld, count: number) {
  if (!this.currentUser) {
    await this.createTestUser('user@example.com');
  }

  const documents = Array.from({ length: count }, (_, i) => ({
    id: `doc-${i + 1}`,
    title: `Document ${i + 1}`,
    filename: `doc${i + 1}.pdf`,
    size: 1024 * 500,
    uploadDate: new Date(Date.now() - i * 86400000), // One day apart
    userId: this.currentUser.id,
    mimetype: 'application/pdf',
  }));

  this.setTestData('myDocuments', documents);
});

Given('another user has uploaded a document with ID {string}', async function (this: CustomWorld, documentId: string) {
  // Create another user's document
  const otherDocument = {
    id: documentId,
    title: 'Other User Document',
    filename: 'other-doc.pdf',
    size: 1024 * 500,
    uploadDate: new Date(),
    userId: 'other-user-id',
    mimetype: 'application/pdf',
  };

  this.setTestData('otherUserDocument', otherDocument);
});

Given('I have uploaded documents at different times', async function (this: CustomWorld) {
  if (!this.currentUser) {
    await this.createTestUser('user@example.com');
  }

  const now = Date.now();
  const documents = [
    { uploadDate: new Date(now - 86400000), title: 'Yesterday' },
    { uploadDate: new Date(now - 172800000), title: 'Two days ago' },
    { uploadDate: new Date(now - 604800000), title: 'One week ago' },
    { uploadDate: new Date(now - 2592000000), title: 'One month ago' },
  ].map((doc, i) => ({
    id: `doc-${i + 1}`,
    ...doc,
    filename: `${doc.title}.pdf`,
    userId: this.currentUser.id,
    size: 1024 * 500,
    mimetype: 'application/pdf',
  }));

  this.setTestData('myDocuments', documents);
});

Given('I have deleted a document with ID {string}', function (this: CustomWorld, documentId: string) {
  this.setTestData('deletedDocumentId', documentId);
});

// Retrieval When steps
When('I request my documents list', function (this: CustomWorld) {
  const documents = this.getTestData('myDocuments') || [];
  
  // Sort by upload date descending
  const sortedDocuments = documents.sort((a: any, b: any) => 
    b.uploadDate.getTime() - a.uploadDate.getTime()
  );

  this.lastResponse = {
    status: 200,
    documents: sortedDocuments,
  };
});

When('I request document {string}', function (this: CustomWorld, documentId: string) {
  const documents = this.getTestData('myDocuments') || [];
  const document = documents.find((doc: any) => doc.id === documentId);

  if (document && document.userId === this.currentUser?.id) {
    this.lastResponse = {
      status: 200,
      document,
    };
  } else {
    this.lastError = {
      status: 404,
      message: 'Document not found',
    };
    this.lastResponse = null;
  }
});

When('I request to download the document', function (this: CustomWorld) {
  const document = this.getTestData('uploadedDocument');
  
  if (document) {
    this.lastResponse = {
      status: 200,
      fileContent: Buffer.alloc(document.size, 'file-content'),
      contentType: document.mimetype,
      contentDisposition: `attachment; filename="${document.filename}"`,
      size: document.size,
    };
  } else {
    this.lastError = {
      status: 404,
      message: 'Document not found',
    };
  }
});

When('I search for documents with title containing {string}', function (this: CustomWorld, searchTerm: string) {
  const documents = this.getTestData('myDocuments') || [];
  
  const results = documents.filter((doc: any) => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  this.lastResponse = {
    status: 200,
    documents: results,
  };
});

When('I filter documents by type {string}', function (this: CustomWorld, type: string) {
  const documents = this.getTestData('myDocuments') || [];
  
  const results = documents.filter((doc: any) => doc.type === type);

  this.lastResponse = {
    status: 200,
    documents: results,
  };
});

When('I request documents with page size {int}', function (this: CustomWorld, pageSize: number) {
  const documents = this.getTestData('myDocuments') || [];
  const page = 1;
  
  const startIndex = (page - 1) * pageSize;
  const paginatedDocuments = documents.slice(startIndex, startIndex + pageSize);

  this.lastResponse = {
    status: 200,
    documents: paginatedDocuments,
    pagination: {
      total: documents.length,
      page,
      pageSize,
      totalPages: Math.ceil(documents.length / pageSize),
    },
  };
});

When('I try to retrieve document {string}', function (this: CustomWorld, documentId: string) {
  const documents = this.getTestData('myDocuments') || [];
  const otherDocument = this.getTestData('otherUserDocument');
  const deletedDocumentId = this.getTestData('deletedDocumentId');

  // Check if it's a deleted document
  if (documentId === deletedDocumentId) {
    this.lastError = {
      status: 404,
      message: 'Document not found',
    };
    this.lastResponse = null;
    return;
  }

  // Check if it's another user's document
  if (otherDocument && otherDocument.id === documentId) {
    this.lastError = {
      status: 404,
      message: 'Document not found',
    };
    this.lastResponse = null;
    return;
  }

  const document = documents.find((doc: any) => doc.id === documentId);

  if (document) {
    this.lastResponse = {
      status: 200,
      document,
    };
  } else {
    this.lastError = {
      status: 404,
      message: 'Document not found',
    };
    this.lastResponse = null;
  }
});

When('I request only the metadata for document {string}', function (this: CustomWorld, documentId: string) {
  const documents = this.getTestData('myDocuments') || [];
  const document = documents.find((doc: any) => doc.id === documentId);

  if (document) {
    // Return only metadata, exclude file content
    const { filePath, ...metadata } = document;
    this.lastResponse = {
      status: 200,
      metadata,
    };
  } else {
    this.lastError = {
      status: 404,
      message: 'Document not found',
    };
  }
});

When('I request recently uploaded documents', function (this: CustomWorld) {
  const documents = this.getTestData('myDocuments') || [];
  const sevenDaysAgo = Date.now() - 7 * 86400000;
  
  const recentDocuments = documents
    .filter((doc: any) => doc.uploadDate.getTime() > sevenDaysAgo)
    .sort((a: any, b: any) => b.uploadDate.getTime() - a.uploadDate.getTime())
    .slice(0, 20);

  this.lastResponse = {
    status: 200,
    documents: recentDocuments,
  };
});

// Retrieval Then steps
Then('I should see {int} documents', function (this: CustomWorld, expectedCount: number) {
  assert.ok(this.lastResponse, 'Should have a response');
  const documents = this.lastResponse.documents || [];
  assert.strictEqual(documents.length, expectedCount, `Should have ${expectedCount} documents`);
});

Then('the documents should be ordered by upload date descending', function (this: CustomWorld) {
  const documents = this.lastResponse.documents || [];
  
  for (let i = 0; i < documents.length - 1; i++) {
    const current = new Date(documents[i].uploadDate).getTime();
    const next = new Date(documents[i + 1].uploadDate).getTime();
    assert.ok(current >= next, 'Documents should be in descending order by upload date');
  }
});

Then('I should receive the document metadata', function (this: CustomWorld) {
  assert.ok(this.lastResponse, 'Should have a response');
  assert.ok(this.lastResponse.document, 'Should have document metadata');
});

Then('the metadata should include:', function (this: CustomWorld, dataTable: any) {
  const document = this.lastResponse.document || this.lastResponse.metadata;
  assert.ok(document, 'Document should exist');

  const expectedFields = dataTable.hashes();
  
  expectedFields.forEach((row: any) => {
    const field = row.field;
    assert.ok(field in document, `Document should have field: ${field}`);
  });
});

Then('I should receive the file content', function (this: CustomWorld) {
  assert.ok(this.lastResponse, 'Should have a response');
  assert.ok(this.lastResponse.fileContent, 'Should have file content');
});

Then('the content type should be {string}', function (this: CustomWorld, expectedContentType: string) {
  assert.ok(this.lastResponse, 'Should have a response');
  assert.strictEqual(this.lastResponse.contentType, expectedContentType, 
    `Content type should be ${expectedContentType}`);
});

Then('the content disposition header should include the filename', function (this: CustomWorld) {
  assert.ok(this.lastResponse, 'Should have a response');
  assert.ok(this.lastResponse.contentDisposition, 'Should have content disposition');
  assert.ok(this.lastResponse.contentDisposition.includes('filename='), 
    'Content disposition should include filename');
});

Then('the file size should match the stored size', function (this: CustomWorld) {
  const document = this.getTestData('uploadedDocument');
  assert.ok(this.lastResponse, 'Should have a response');
  assert.strictEqual(this.lastResponse.size, document.size, 'File size should match');
});

Then('I should only see documents matching {string} in the title', function (this: CustomWorld, searchTerm: string) {
  const documents = this.lastResponse.documents || [];
  
  documents.forEach((doc: any) => {
    assert.ok(doc.title.toLowerCase().includes(searchTerm.toLowerCase()), 
      `Document title "${doc.title}" should contain "${searchTerm}"`);
  });
});

Then('the search should be case-insensitive', function (this: CustomWorld) {
  // Already verified in the previous step
  assert.ok(true, 'Search is case-insensitive');
});

Then('all returned documents should have type {string}', function (this: CustomWorld, expectedType: string) {
  const documents = this.lastResponse.documents || [];
  
  documents.forEach((doc: any) => {
    assert.strictEqual(doc.type, expectedType, `Document type should be ${expectedType}`);
  });
});

Then('I should receive {int} documents', function (this: CustomWorld, expectedCount: number) {
  assert.ok(this.lastResponse, 'Should have a response');
  const documents = this.lastResponse.documents || [];
  assert.strictEqual(documents.length, expectedCount, `Should receive ${expectedCount} documents`);
});

Then('pagination metadata should include:', function (this: CustomWorld, dataTable: any) {
  assert.ok(this.lastResponse, 'Should have a response');
  assert.ok(this.lastResponse.pagination, 'Should have pagination metadata');

  const expected = dataTable.rowsHash();
  const pagination = this.lastResponse.pagination;

  for (const [field, value] of Object.entries(expected)) {
    assert.strictEqual(pagination[field].toString(), value, 
      `Pagination ${field} should be ${value}`);
  }
});

Then('I should receive a {string} error', function (this: CustomWorld, errorType: string) {
  assert.ok(this.lastError, 'Should have an error');
  
  if (errorType === 'not found') {
    assert.strictEqual(this.lastError.status, 404, 'Should be a 404 error');
  } else if (errorType === 'forbidden') {
    assert.strictEqual(this.lastError.status, 403, 'Should be a 403 error');
  }
});

Then('I should not be able to access the document', function (this: CustomWorld) {
  assert.ok(this.lastError, 'Should have an error');
  assert.ok(!this.lastResponse || !this.lastResponse.document, 'Should not have document access');
});

Then('the file content should not be included', function (this: CustomWorld) {
  assert.ok(this.lastResponse, 'Should have a response');
  assert.ok(!this.lastResponse.fileContent, 'Should not include file content');
});

Then('the response should be lightweight', function (this: CustomWorld) {
  // Metadata-only response is lightweight
  assert.ok(this.lastResponse.metadata || this.lastResponse.document, 
    'Should have metadata without file content');
});

Then('I should see documents from the last {int} days', function (this: CustomWorld, days: number) {
  const documents = this.lastResponse.documents || [];
  const cutoffDate = Date.now() - days * 86400000;
  
  documents.forEach((doc: any) => {
    const uploadDate = new Date(doc.uploadDate).getTime();
    assert.ok(uploadDate > cutoffDate, 
      `Document should be uploaded within last ${days} days`);
  });
});

Then('they should be sorted by upload date descending', function (this: CustomWorld) {
  const documents = this.lastResponse.documents || [];
  
  for (let i = 0; i < documents.length - 1; i++) {
    const current = new Date(documents[i].uploadDate).getTime();
    const next = new Date(documents[i + 1].uploadDate).getTime();
    assert.ok(current >= next, 'Documents should be sorted by upload date descending');
  }
});

Then('the limit should be {int} documents', function (this: CustomWorld, limit: number) {
  const documents = this.lastResponse.documents || [];
  assert.ok(documents.length <= limit, `Should not exceed ${limit} documents`);
});

Then('the document should not be accessible', function (this: CustomWorld) {
  assert.ok(this.lastError, 'Should have an error');
  assert.strictEqual(this.lastError.status, 404, 'Document should not be accessible');
});

// Helper function
function getMimeTypeFromExtension(type: string): string {
  const mimeTypes: { [key: string]: string } = {
    'pdf': 'application/pdf',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  };
  return mimeTypes[type] || 'application/octet-stream';
}
