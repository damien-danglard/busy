Feature: Document Retrieval
  As a logged-in user
  I want to retrieve my uploaded documents
  So that I can view and download them when needed

  Background:
    Given the application is running
    And the database is accessible
    And I am logged in as "user@example.com"

  Scenario: List all my documents
    Given I have uploaded the following documents:
      | title           | filename      | uploadDate |
      | Report 2024    | report.pdf    | 2024-01-15 |
      | Presentation   | slides.pptx   | 2024-01-20 |
      | Budget         | budget.xlsx   | 2024-01-25 |
    When I request my documents list
    Then I should see 3 documents
    And the documents should be ordered by upload date descending

  Scenario: Retrieve single document by ID
    Given I have a document with ID "doc-123"
    When I request document "doc-123"
    Then I should receive the document metadata
    And the metadata should include:
      | field      | type    |
      | id         | string  |
      | title      | string  |
      | filename   | string  |
      | size       | number  |
      | uploadDate | date    |

  Scenario: Download document file
    Given I have uploaded a document "contract.pdf"
    When I request to download the document
    Then I should receive the file content
    And the content type should be "application/pdf"
    And the content disposition header should include the filename
    And the file size should match the stored size

  Scenario: Search documents by title
    Given I have uploaded multiple documents
    When I search for documents with title containing "report"
    Then I should only see documents matching "report" in the title
    And the search should be case-insensitive

  Scenario: Filter documents by type
    Given I have uploaded documents of various types:
      | filename     | type        |
      | doc1.pdf    | pdf         |
      | doc2.docx   | docx        |
      | doc3.pdf    | pdf         |
    When I filter documents by type "pdf"
    Then I should see 2 documents
    And all returned documents should have type "pdf"

  Scenario: Paginate document list
    Given I have uploaded 50 documents
    When I request documents with page size 10
    Then I should receive 10 documents
    And pagination metadata should include:
      | field      | value |
      | total      | 50    |
      | page       | 1     |
      | pageSize   | 10    |
      | totalPages | 5     |

  Scenario: Access control - cannot retrieve other user's documents
    Given another user has uploaded a document with ID "other-doc-123"
    When I try to retrieve document "other-doc-123"
    Then I should receive a "not found" error
    And I should not be able to access the document

  Scenario: Retrieve document metadata without file content
    Given I have a document with ID "doc-456"
    When I request only the metadata for document "doc-456"
    Then I should receive the metadata
    And the file content should not be included
    And the response should be lightweight

  Scenario: Get recently uploaded documents
    Given I have uploaded documents at different times
    When I request recently uploaded documents
    Then I should see documents from the last 7 days
    And they should be sorted by upload date descending
    And the limit should be 20 documents

  Scenario: Retrieve deleted document
    Given I have deleted a document with ID "deleted-doc"
    When I try to retrieve document "deleted-doc"
    Then I should receive a "not found" error
    And the document should not be accessible
