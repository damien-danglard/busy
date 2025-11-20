Feature: User Authentication
  As a user
  I want to register and login to the application
  So that I can access my personalized chat assistant

  Background:
    Given the chat application is running
    And the database is accessible

  Scenario: User registration with valid credentials
    Given I am on the registration page
    When I enter my email "user@example.com"
    And I enter my name "John Doe"
    And I enter a password "SecurePass123!"
    And I confirm my password "SecurePass123!"
    And I submit the registration form
    Then I should see a success message
    And my account should be created in the database
    And my password should be hashed using bcrypt

  Scenario: User registration with existing email
    Given a user already exists with email "existing@example.com"
    And I am on the registration page
    When I enter my email "existing@example.com"
    And I enter my name "Jane Doe"
    And I enter a password "SecurePass123!"
    And I confirm my password "SecurePass123!"
    And I submit the registration form
    Then I should see an error message "Email already registered"
    And no new account should be created

  Scenario: User login with valid credentials
    Given I have an account with email "user@example.com" and password "SecurePass123!"
    And I am on the login page
    When I enter my email "user@example.com"
    And I enter my password "SecurePass123!"
    And I submit the login form
    Then I should be logged in
    And I should be redirected to the chat page
    And a session should be created

  Scenario: User login with invalid password
    Given I have an account with email "user@example.com" and password "SecurePass123!"
    And I am on the login page
    When I enter my email "user@example.com"
    And I enter an incorrect password "WrongPass"
    And I submit the login form
    Then I should see an error message "Invalid credentials"
    And I should remain on the login page
    And no session should be created

  Scenario: User login with non-existent email
    Given I am on the login page
    When I enter my email "nonexistent@example.com"
    And I enter a password "AnyPassword123"
    And I submit the login form
    Then I should see an error message "Invalid credentials"
    And I should remain on the login page

  Scenario: Protected route access without authentication
    Given I am not logged in
    When I try to access the chat page directly
    Then I should be redirected to the login page

  Scenario: User logout
    Given I am logged in as "user@example.com"
    And I am on the chat page
    When I click the logout button
    Then I should be logged out
    And my session should be destroyed
    And I should be redirected to the login page

  Scenario: Password security requirements
    Given I am on the registration page
    When I try to register with a weak password "123"
    Then I should see an error message about password requirements
    And the account should not be created

  Scenario: Session persistence
    Given I am logged in as "user@example.com"
    When I close and reopen my browser
    And I navigate to the application
    Then I should still be logged in
    And I should see the chat page

  Scenario: Session expiration
    Given I am logged in as "user@example.com"
    And my session has expired
    When I try to access the chat page
    Then I should be redirected to the login page
    And I should see a message "Session expired, please login again"
