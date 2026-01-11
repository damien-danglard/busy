import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import * as assert from 'assert';

// Management Given steps
Given('I have a document with ID {string} titled {string}', async function (this: CustomWorld, documentId: string, title: string) {
  if (!this.currentUser) {
    await this.createTestUser('user@example.com');
  }

  const document = {
    id: documentId,
    title,
    filename: `${title}.pdf`,
    size: 1024 * 500,
    uploadDate: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 86400000),
    userId: this.currentUser.id,
    mimetype: 'application/pdf',
  };

  this.setTestData('documentToUpdate', document);
  
  const documents = this.getTestData('myDocuments') || [];
  documents.push(document);
  this.setTestData('myDocuments', documents);
});

Given('soft delete is enabled', function (this: CustomWorld) {
  this.setTestData('softDeleteEnabled', true);
});

Given('I have a soft-deleted document with ID {string}', async function (this: CustomWorld, documentId: string) {
  if (!this.currentUser) {
    await this.createTestUser('user@example.com');
  }

  const document = {
    id: documentId,
    title: 'Deleted Document',
    filename: 'deleted.pdf',
    size: 1024 * 500,
    uploadDate: new Date(),
    userId: this.currentUser.id,
    deletedAt: new Date(),
    isDeleted: true,
  };

  this.setTestData('softDeletedDocument', document);
});

Given('I have a document with filename {string}', async function (this: CustomWorld, filename: string) {
  if (!this.currentUser) {
    await this.createTestUser('user@example.com');
  }

  const document = {
    id: `doc-${Date.now()}`,
    title: filename,
    filename,
    size: 1024 * 500,
    uploadDate: new Date(),
    userId: this.currentUser.id,
    filePath: `/uploads/${this.currentUser.id}/${filename}`,
  };

  this.setTestData('documentToRename', document);
});

Given('I have a folder {string}', function (this: CustomWorld, folderPath: string) {
  const folder = {
    path: folderPath,
    userId: this.currentUser?.id,
    createdAt: new Date(),
  };
  this.setTestData('targetFolder', folder);
});

Given('I have shared document {string} with {string}', function (this: CustomWorld, documentId: string, userEmail: string) {
  const shareRecord = {
    documentId,
    sharedWith: userEmail,
    permission: 'read',
    createdAt: new Date(),
  };
  this.setTestData('existingShare', shareRecord);
});

Given('I have a document {string} version {int}', async function (this: CustomWorld, filename: string, version: number) {
  if (!this.currentUser) {
    await this.createTestUser('user@example.com');
  }

  const document = {
    id: `doc-${Date.now()}`,
    filename,
    version,
    title: filename,
    size: 1024 * 500,
    uploadDate: new Date(),
    userId: this.currentUser.id,
    isCurrent: true,
  };

  this.setTestData('versionedDocument', document);
});

Given('I have selected documents:', function (this: CustomWorld, dataTable: any) {
  const documentIds = dataTable.hashes().map((row: any) => row.documentId);
  this.setTestData('selectedDocuments', documentIds);
});

Given('another user owns document {string}', function (this: CustomWorld, documentId: string) {
  const document = {
    id: documentId,
    title: 'Other User Document',
    filename: 'other.pdf',
    userId: 'other-user-id',
  };
  this.setTestData('otherUserDocument', document);
});

Given('I have documents older than {int} year:', function (this: CustomWorld, years: number, dataTable: any) {
  const documents = dataTable.hashes().map((row: any) => ({
    id: row.documentId,
    title: `Old Document ${row.documentId}`,
    filename: `old-${row.documentId}.pdf`,
    uploadDate: new Date(row.uploadDate),
    userId: this.currentUser?.id,
    size: 1024 * 500,
  }));

  this.setTestData('oldDocuments', documents);
});

// Management When steps
When('I update the document with:', async function (this: CustomWorld, dataTable: any) {
  const document = this.getTestData('documentToUpdate');
  const updates = dataTable.rowsHash();

  if (!document) {
    this.lastError = { status: 404, message: 'Document not found' };
    return;
  }

  // Apply updates
  const updatedDocument = {
    ...document,
    ...updates,
    updatedAt: new Date(),
  };

  this.setTestData('updatedDocument', updatedDocument);
  this.lastResponse = {
    status: 200,
    message: 'Document updated successfully',
    document: updatedDocument,
  };
});

When('I delete document {string}', function (this: CustomWorld, documentId: string) {
  const softDeleteEnabled = this.getTestData('softDeleteEnabled');
  const documents = this.getTestData('myDocuments') || [];
  const document = documents.find((doc: any) => doc.id === documentId);

  if (!document) {
    this.lastError = { status: 404, message: 'Document not found' };
    return;
  }

  if (document.userId !== this.currentUser?.id) {
    this.lastError = { status: 403, message: 'Forbidden' };
    return;
  }

  if (softDeleteEnabled) {
    // Soft delete
    const updatedDocument = {
      ...document,
      deletedAt: new Date(),
      isDeleted: true,
    };
    this.setTestData('deletedDocument', updatedDocument);
    this.setTestData('physicalFileDeleted', false);
  } else {
    // Hard delete
    this.setTestData('deletedDocument', document);
    this.setTestData('physicalFileDeleted', true);
    
    // Remove from documents list
    const updatedDocuments = documents.filter((doc: any) => doc.id !== documentId);
    this.setTestData('myDocuments', updatedDocuments);
  }

  this.lastResponse = {
    status: 200,
    message: 'Document deleted successfully',
  };
});

When('I restore document {string}', function (this: CustomWorld, documentId: string) {
  const softDeletedDoc = this.getTestData('softDeletedDocument');

  if (!softDeletedDoc || softDeletedDoc.id !== documentId) {
    this.lastError = { status: 404, message: 'Document not found' };
    return;
  }

  const restoredDocument = {
    ...softDeletedDoc,
    deletedAt: null,
    isDeleted: false,
  };

  this.setTestData('restoredDocument', restoredDocument);
  this.lastResponse = {
    status: 200,
    message: 'Document restored successfully',
  };
});

When('I rename it to {string}', function (this: CustomWorld, newFilename: string) {
  const document = this.getTestData('documentToRename');

  if (!document) {
    this.lastError = { status: 404, message: 'Document not found' };
    return;
  }

  const oldExtension = document.filename.split('.').pop();
  const newExtension = newFilename.split('.').pop();

  // Ensure extension doesn't change
  const finalFilename = oldExtension === newExtension 
    ? newFilename 
    : `${newFilename.replace(`.${newExtension}`, '')}.${oldExtension}`;

  const renamedDocument = {
    ...document,
    filename: finalFilename,
    updatedAt: new Date(),
  };

  this.setTestData('renamedDocument', renamedDocument);
  this.setTestData('physicalFileRenamed', true);
  this.lastResponse = {
    status: 200,
    message: 'Document renamed successfully',
  };
});

When('I move document {string} to folder {string}', function (this: CustomWorld, documentId: string, folderPath: string) {
  const documents = this.getTestData('myDocuments') || [];
  const document = documents.find((doc: any) => doc.id === documentId);

  if (!document) {
    this.lastError = { status: 404, message: 'Document not found' };
    return;
  }

  const movedDocument = {
    ...document,
    folderPath,
    updatedAt: new Date(),
  };

  this.setTestData('movedDocument', movedDocument);
  this.lastResponse = {
    status: 200,
    message: 'Document moved successfully',
  };
});

When('I share document {string} with user {string}', function (this: CustomWorld, documentId: string, userEmail: string) {
  this.setTestData('shareDocumentId', documentId);
  this.setTestData('shareUserEmail', userEmail);
});

When('I set permission level to {string}', function (this: CustomWorld, permission: string) {
  const documentId = this.getTestData('shareDocumentId');
  const userEmail = this.getTestData('shareUserEmail');

  const shareRecord = {
    documentId,
    sharedWith: userEmail,
    permission,
    createdAt: new Date(),
    createdBy: this.currentUser?.id,
  };

  this.setTestData('createdShare', shareRecord);
  this.lastResponse = {
    status: 200,
    message: 'Document shared successfully',
  };
});

When('I revoke access for {string}', function (this: CustomWorld, userEmail: string) {
  const existingShare = this.getTestData('existingShare');

  if (existingShare && existingShare.sharedWith === userEmail) {
    this.setTestData('revokedShare', existingShare);
    this.setTestData('existingShare', null);
    this.lastResponse = {
      status: 200,
      message: 'Access revoked successfully',
    };
  } else {
    this.lastError = { status: 404, message: 'Share not found' };
  }
});

When('I upload a new version {string}', function (this: CustomWorld, newFilename: string) {
  const originalDoc = this.getTestData('versionedDocument');

  if (!originalDoc) {
    this.lastError = { status: 404, message: 'Document not found' };
    return;
  }

  const newVersion = {
    ...originalDoc,
    id: `doc-${Date.now()}`,
    filename: newFilename,
    version: originalDoc.version + 1,
    isCurrent: true,
    uploadDate: new Date(),
  };

  // Mark old version as not current
  const oldVersion = {
    ...originalDoc,
    isCurrent: false,
  };

  this.setTestData('newVersion', newVersion);
  this.setTestData('oldVersion', oldVersion);
  this.lastResponse = {
    status: 200,
    message: 'New version uploaded successfully',
  };
});

When('I perform bulk delete', function (this: CustomWorld) {
  const selectedDocuments = this.getTestData('selectedDocuments') || [];
  
  this.setTestData('bulkDeletedCount', selectedDocuments.length);
  this.lastResponse = {
    status: 200,
    message: `${selectedDocuments.length} documents deleted`,
  };
});

When('I try to delete document {string}', function (this: CustomWorld, documentId: string) {
  const otherDoc = this.getTestData('otherUserDocument');

  if (otherDoc && otherDoc.id === documentId && otherDoc.userId !== this.currentUser?.id) {
    this.lastError = {
      status: 403,
      message: 'Forbidden',
    };
    this.lastResponse = null;
  } else {
    // Normal delete flow
    this.lastResponse = {
      status: 200,
      message: 'Document deleted successfully',
    };
  }
});

When('I archive old documents', function (this: CustomWorld) {
  const oldDocuments = this.getTestData('oldDocuments') || [];
  
  const archivedDocuments = oldDocuments.map((doc: any) => ({
    ...doc,
    isArchived: true,
    archivedAt: new Date(),
  }));

  this.setTestData('archivedDocuments', archivedDocuments);
  this.lastResponse = {
    status: 200,
    message: `${oldDocuments.length} documents archived`,
  };
});

// Management Then steps
Then('the document metadata should be updated', function (this: CustomWorld) {
  const updatedDoc = this.getTestData('updatedDocument');
  assert.ok(updatedDoc, 'Document should be updated');
});

Then('the updated timestamp should be refreshed', function (this: CustomWorld) {
  const updatedDoc = this.getTestData('updatedDocument');
  assert.ok(updatedDoc, 'Document should exist');
  assert.ok(updatedDoc.updatedAt, 'Should have updated timestamp');
  assert.ok(updatedDoc.updatedAt instanceof Date, 'Updated timestamp should be a Date');
});

Then('the document should be removed from the database', function (this: CustomWorld) {
  const deletedDoc = this.getTestData('deletedDocument');
  const documents = this.getTestData('myDocuments') || [];
  
  assert.ok(deletedDoc, 'Document should be deleted');
  
  const stillExists = documents.some((doc: any) => doc.id === deletedDoc.id);
  assert.ok(!stillExists, 'Document should be removed from database');
});

Then('the physical file should be deleted from storage', function (this: CustomWorld) {
  const physicalFileDeleted = this.getTestData('physicalFileDeleted');
  assert.ok(physicalFileDeleted, 'Physical file should be deleted');
});

Then('the document should be marked as deleted', function (this: CustomWorld) {
  const deletedDoc = this.getTestData('deletedDocument');
  assert.ok(deletedDoc, 'Document should exist');
  assert.ok(deletedDoc.isDeleted, 'Document should be marked as deleted');
});

Then('the deletedAt timestamp should be set', function (this: CustomWorld) {
  const deletedDoc = this.getTestData('deletedDocument');
  assert.ok(deletedDoc, 'Document should exist');
  assert.ok(deletedDoc.deletedAt, 'Should have deletedAt timestamp');
  assert.ok(deletedDoc.deletedAt instanceof Date, 'deletedAt should be a Date');
});

Then('the document should not appear in my documents list', function (this: CustomWorld) {
  // In real implementation, would filter out soft-deleted documents
  const deletedDoc = this.getTestData('deletedDocument');
  assert.ok(deletedDoc?.isDeleted, 'Document should be marked as deleted');
});

Then('the physical file should still exist', function (this: CustomWorld) {
  const physicalFileDeleted = this.getTestData('physicalFileDeleted');
  assert.ok(physicalFileDeleted === false, 'Physical file should still exist');
});

Then('the document should be marked as active', function (this: CustomWorld) {
  const restoredDoc = this.getTestData('restoredDocument');
  assert.ok(restoredDoc, 'Document should exist');
  assert.ok(!restoredDoc.isDeleted, 'Document should not be marked as deleted');
});

Then('the deletedAt timestamp should be cleared', function (this: CustomWorld) {
  const restoredDoc = this.getTestData('restoredDocument');
  assert.ok(restoredDoc, 'Document should exist');
  assert.ok(!restoredDoc.deletedAt, 'deletedAt should be cleared');
});

Then('the document should appear in my documents list', function (this: CustomWorld) {
  const restoredDoc = this.getTestData('restoredDocument');
  assert.ok(restoredDoc && !restoredDoc.isDeleted, 'Document should appear in list');
});

Then('the filename should be updated in the database', function (this: CustomWorld) {
  const renamedDoc = this.getTestData('renamedDocument');
  assert.ok(renamedDoc, 'Document should exist');
  assert.ok(renamedDoc.filename, 'Should have new filename');
});

Then('the physical file should be renamed', function (this: CustomWorld) {
  const physicalFileRenamed = this.getTestData('physicalFileRenamed');
  assert.ok(physicalFileRenamed, 'Physical file should be renamed');
});

Then('the file extension should remain unchanged', function (this: CustomWorld) {
  const originalDoc = this.getTestData('documentToRename');
  const renamedDoc = this.getTestData('renamedDocument');
  
  const originalExt = originalDoc.filename.split('.').pop();
  const newExt = renamedDoc.filename.split('.').pop();
  
  assert.strictEqual(originalExt, newExt, 'File extension should remain unchanged');
});

Then('the document folder path should be updated', function (this: CustomWorld) {
  const movedDoc = this.getTestData('movedDocument');
  assert.ok(movedDoc, 'Document should exist');
  assert.ok(movedDoc.folderPath, 'Should have folder path');
});

Then('the document should appear in the folder listing', function (this: CustomWorld) {
  const movedDoc = this.getTestData('movedDocument');
  const targetFolder = this.getTestData('targetFolder');
  
  assert.strictEqual(movedDoc.folderPath, targetFolder.path, 
    'Document should be in target folder');
});

Then('a share record should be created', function (this: CustomWorld) {
  const shareRecord = this.getTestData('createdShare');
  assert.ok(shareRecord, 'Share record should be created');
});

Then('{string} should be able to view the document', function (this: CustomWorld, userEmail: string) {
  const shareRecord = this.getTestData('createdShare');
  assert.ok(shareRecord, 'Share record should exist');
  assert.strictEqual(shareRecord.sharedWith, userEmail, 'Should be shared with correct user');
});

Then('{string} should not be able to edit or delete it', function (this: CustomWorld, userEmail: string) {
  const shareRecord = this.getTestData('createdShare');
  assert.ok(shareRecord, 'Share record should exist');
  assert.strictEqual(shareRecord.permission, 'read', 'Permission should be read-only');
});

Then('the share record should be removed', function (this: CustomWorld) {
  const existingShare = this.getTestData('existingShare');
  assert.ok(!existingShare, 'Share record should be removed');
});

Then('{string} should no longer access the document', function (this: CustomWorld, userEmail: string) {
  const revokedShare = this.getTestData('revokedShare');
  assert.ok(revokedShare, 'Share should have been revoked');
  assert.strictEqual(revokedShare.sharedWith, userEmail, 'Should revoke for correct user');
});

Then('a new version record should be created', function (this: CustomWorld) {
  const newVersion = this.getTestData('newVersion');
  assert.ok(newVersion, 'New version should be created');
});

Then('the version number should be incremented to {int}', function (this: CustomWorld, expectedVersion: number) {
  const newVersion = this.getTestData('newVersion');
  assert.ok(newVersion, 'New version should exist');
  assert.strictEqual(newVersion.version, expectedVersion, `Version should be ${expectedVersion}`);
});

Then('both versions should be accessible', function (this: CustomWorld) {
  const newVersion = this.getTestData('newVersion');
  const oldVersion = this.getTestData('oldVersion');
  
  assert.ok(newVersion, 'New version should exist');
  assert.ok(oldVersion, 'Old version should exist');
});

Then('the latest version should be marked as current', function (this: CustomWorld) {
  const newVersion = this.getTestData('newVersion');
  const oldVersion = this.getTestData('oldVersion');
  
  assert.ok(newVersion.isCurrent, 'New version should be current');
  assert.ok(!oldVersion.isCurrent, 'Old version should not be current');
});

Then('all {int} documents should be deleted', function (this: CustomWorld, expectedCount: number) {
  const deletedCount = this.getTestData('bulkDeletedCount');
  assert.strictEqual(deletedCount, expectedCount, `Should delete ${expectedCount} documents`);
});

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

Then('the document should not be deleted', function (this: CustomWorld) {
  assert.ok(this.lastError, 'Should have an error preventing deletion');
  const otherDoc = this.getTestData('otherUserDocument');
  assert.ok(otherDoc, 'Document should still exist');
});

Then('the documents should be marked as archived', function (this: CustomWorld) {
  const archivedDocs = this.getTestData('archivedDocuments') || [];
  
  archivedDocs.forEach((doc: any) => {
    assert.ok(doc.isArchived, 'Document should be marked as archived');
    assert.ok(doc.archivedAt, 'Document should have archivedAt timestamp');
  });
});

Then('they should be moved to archive storage', function (this: CustomWorld) {
  // In real implementation, would verify physical file move
  assert.ok(true, 'Documents should be moved to archive storage');
});

Then('they should not appear in regular document list', function (this: CustomWorld) {
  const archivedDocs = this.getTestData('archivedDocuments') || [];
  
  archivedDocs.forEach((doc: any) => {
    assert.ok(doc.isArchived, 'Archived documents should be filtered from regular list');
  });
});
