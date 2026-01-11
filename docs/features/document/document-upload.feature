Feature: Document Upload
  As a logged-in user
  I want to upload documents to the system
  So that I can store and manage my files

  Background:
    Given the application is running
    And the database is accessible
    And I am logged in as "user@example.com"

  Scenario: Upload a PDF document successfully
    Given I am on the document upload page
    When I select a PDF file "test-document.pdf" of size 500 KB
    And I provide document title "Project Proposal"
    And I provide document description "Q1 2024 project proposal"
    And I submit the upload form
    Then the document should be uploaded successfully
    And I should see a success message "Document uploaded successfully"
    And the document should be stored in the database
    And the document metadata should be saved

  Scenario: Upload multiple documents at once
    Given I am on the document upload page
    When I select multiple files:
      | filename         | type | size   |
      | report.pdf      | pdf  | 1 MB   |
      | presentation.pptx | pptx | 2.5 MB |
      | budget.xlsx     | xlsx | 300 KB |
    And I submit the upload form
    Then all 3 documents should be uploaded successfully
    And I should see a success message "3 documents uploaded successfully"

  Scenario: Upload document with invalid file type
    Given I am on the document upload page
    When I select a file "malicious.exe" of type "application/x-msdownload"
    And I submit the upload form
    Then I should see an error message "File type not allowed"
    And the file should not be uploaded
    And no record should be created in the database

  Scenario: Upload document exceeding size limit
    Given the maximum file size is 10 MB
    And I am on the document upload page
    When I select a file "large-document.pdf" of size 15 MB
    And I submit the upload form
    Then I should see an error message "File size exceeds limit of 10 MB"
    And the file should not be uploaded

  Scenario: Upload document without authentication
    Given I am not logged in
    When I try to access the document upload endpoint
    Then I should receive an unauthorized error
    And I should be redirected to the login page

  Scenario: Upload document with virus scan
    Given virus scanning is enabled
    And I am on the document upload page
    When I upload a file "clean-document.pdf"
    Then the file should be scanned for viruses
    And the document should be uploaded if scan is clean
    And the scan result should be stored in metadata

  Scenario: Upload document with automatic categorization
    Given I am on the document upload page
    When I upload a PDF file "invoice-2024.pdf"
    Then the system should automatically detect document type as "invoice"
    And the document should be categorized accordingly
    And relevant metadata should be extracted
