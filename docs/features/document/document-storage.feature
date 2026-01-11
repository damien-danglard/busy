Feature: Document Storage
  As a system administrator
  I want documents to be stored securely and efficiently
  So that users can reliably access their files

  Background:
    Given the application is running
    And the database is accessible
    And the storage system is configured

  Scenario: Store document with metadata in database
    Given a user uploads a document "report.pdf"
    When the document is processed
    Then a record should be created in the documents table
    And the record should contain:
      | field       | value                    |
      | filename    | report.pdf              |
      | size        | 524288                  |
      | mimetype    | application/pdf         |
      | userId      | valid user ID           |
    And the upload timestamp should be recorded

  Scenario: Store document file in file system
    Given a user uploads a document "image.png"
    When the document is processed
    Then the file should be saved to the storage directory
    And the file path should be stored in the database
    And the file should be readable
    And the file permissions should be secure

  Scenario: Generate unique document ID
    Given multiple documents are uploaded with the same name
    When the documents are processed
    Then each document should have a unique ID
    And the IDs should be UUID format
    And no ID collisions should occur

  Scenario: Store document with user association
    Given I am logged in as "user1@example.com"
    When I upload a document "personal-doc.pdf"
    Then the document should be associated with my user ID
    And other users should not be able to access it
    And the user relationship should be enforced by foreign key

  Scenario: Calculate and store document hash
    Given a document "contract.pdf" is uploaded
    When the document is processed
    Then a SHA-256 hash should be calculated
    And the hash should be stored in the database
    And duplicate documents should be detected by hash

  Scenario: Store document with tags
    Given I upload a document "quarterly-report.pdf"
    When I add tags "finance", "Q4", "2024"
    Then the tags should be stored with the document
    And the document should be searchable by tags
    And tags should be normalized to lowercase

  Scenario: Handle storage failure gracefully
    Given the storage system is unavailable
    When a user tries to upload a document
    Then the upload should fail gracefully
    And an error message should be shown
    And no partial records should be created in the database
    And the transaction should be rolled back

  Scenario: Store document access history
    Given a document exists with ID "doc-123"
    When the document is accessed
    Then an access log entry should be created
    And the log should record:
      | field      | value                  |
      | documentId | doc-123               |
      | userId     | accessing user ID      |
      | action     | view                  |
      | timestamp  | current timestamp      |
