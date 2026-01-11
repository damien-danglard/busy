Feature: Document Management
  As a logged-in user
  I want to manage my documents
  So that I can organize, update, and delete them

  Background:
    Given the application is running
    And the database is accessible
    And I am logged in as "user@example.com"

  Scenario: Update document metadata
    Given I have a document with ID "doc-123" titled "Old Title"
    When I update the document with:
      | field       | value       |
      | title       | New Title   |
      | description | Updated description |
    Then the document metadata should be updated
    And the updated timestamp should be refreshed
    And I should see a success message "Document updated successfully"

  Scenario: Delete a document
    Given I have a document with ID "doc-456"
    When I delete document "doc-456"
    Then the document should be removed from the database
    And the physical file should be deleted from storage
    And I should see a success message "Document deleted successfully"

  Scenario: Soft delete a document
    Given soft delete is enabled
    And I have a document with ID "doc-789"
    When I delete document "doc-789"
    Then the document should be marked as deleted
    And the deletedAt timestamp should be set
    And the document should not appear in my documents list
    But the physical file should still exist

  Scenario: Restore a soft-deleted document
    Given I have a soft-deleted document with ID "doc-101"
    When I restore document "doc-101"
    Then the document should be marked as active
    And the deletedAt timestamp should be cleared
    And the document should appear in my documents list

  Scenario: Rename a document
    Given I have a document with filename "old-name.pdf"
    When I rename it to "new-name.pdf"
    Then the filename should be updated in the database
    And the physical file should be renamed
    And the file extension should remain unchanged

  Scenario: Move document to folder
    Given I have a document with ID "doc-202"
    And I have a folder "Projects/2024"
    When I move document "doc-202" to folder "Projects/2024"
    Then the document folder path should be updated
    And the document should appear in the folder listing

  Scenario: Share document with another user
    Given I have a document with ID "doc-303"
    When I share document "doc-303" with user "colleague@example.com"
    And I set permission level to "read"
    Then a share record should be created
    And "colleague@example.com" should be able to view the document
    But "colleague@example.com" should not be able to edit or delete it

  Scenario: Revoke document access
    Given I have shared document "doc-404" with "user2@example.com"
    When I revoke access for "user2@example.com"
    Then the share record should be removed
    And "user2@example.com" should no longer access the document

  Scenario: Add version to document
    Given I have a document "contract.pdf" version 1
    When I upload a new version "contract-v2.pdf"
    Then a new version record should be created
    And the version number should be incremented to 2
    And both versions should be accessible
    And the latest version should be marked as current

  Scenario: Delete multiple documents at once
    Given I have selected documents:
      | documentId |
      | doc-501   |
      | doc-502   |
      | doc-503   |
    When I perform bulk delete
    Then all 3 documents should be deleted
    And I should see a success message "3 documents deleted"

  Scenario: Cannot delete another user's document
    Given another user owns document "other-doc-123"
    When I try to delete document "other-doc-123"
    Then I should receive a "forbidden" error
    And the document should not be deleted

  Scenario: Archive old documents
    Given I have documents older than 1 year:
      | documentId | uploadDate |
      | doc-601   | 2023-01-01 |
      | doc-602   | 2023-02-01 |
    When I archive old documents
    Then the documents should be marked as archived
    And they should be moved to archive storage
    And they should not appear in regular document list
