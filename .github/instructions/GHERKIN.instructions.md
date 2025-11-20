---
applyTo: "docs/features/*.feature"
---

# Gherkin Feature Specifications Guidelines

This document provides instructions for maintaining and creating Gherkin feature specifications in the Busy project.

## Overview

All feature specifications are stored in `docs/features/` directory in Gherkin format. These specifications serve as living documentation and acceptance criteria for all project features.

## When to Update Feature Files

### Always Update When:

1. **Adding New Features**: Create a new `.feature` file with scenarios
2. **Modifying Existing Features**: Update relevant scenarios in existing files
3. **Fixing Bugs**: Add regression test scenarios
4. **Changing Behavior**: Update affected scenarios to reflect new behavior

### Feature File Structure

Each feature file MUST follow this structure:

```gherkin
Feature: Feature Name
  As a [role]
  I want [feature]
  So that [benefit]

  Background:
    Given [common precondition for all scenarios]
    And [another common precondition]

  Scenario: Descriptive scenario name
    Given [initial context]
    And [additional context]
    When [action or event]
    And [another action]
    Then [expected outcome]
    And [another expected outcome]
```

## File Naming Conventions

- Use kebab-case: `feature-name.feature`
- Be descriptive: `user-authentication.feature` not `auth.feature`
- One feature per file
- Group related scenarios in the same file

## Writing Good Scenarios

### DO:

✅ Write scenarios from the user's perspective
```gherkin
Scenario: User logs in with valid credentials
  Given I am on the login page
  When I enter my email "user@example.com"
  And I enter my password "SecurePass123!"
  And I click the login button
  Then I should be redirected to the dashboard
```

✅ Use concrete examples
```gherkin
Given I have a memory "User loves pizza"
When I ask "What food do I like?"
Then the AI should mention "pizza" in the response
```

✅ Use tables for multiple data points
```gherkin
Given I have stored memories about:
  | Content                     | Category    |
  | User loves pizza            | preferences |
  | User is learning TypeScript | work        |
  | User lives in Paris         | personal   |
```

✅ Keep scenarios focused and atomic
```gherkin
Scenario: User registration with valid email
  # Tests one thing: valid email registration

Scenario: User registration with invalid email
  # Tests another thing: invalid email handling
```

### DON'T:

❌ Mix implementation details in scenarios
```gherkin
# Bad
When I call the POST /api/auth/login endpoint with JSON payload

# Good
When I submit the login form
```

❌ Write overly technical scenarios
```gherkin
# Bad
Then the JWT token should be stored in localStorage

# Good
Then I should remain logged in after page refresh
```

❌ Make scenarios too broad
```gherkin
# Bad
Scenario: Complete user flow
  Given I register, login, chat, and logout
  # Too many actions in one scenario

# Good - Split into separate scenarios
Scenario: User registration
Scenario: User login
Scenario: User chat
Scenario: User logout
```

❌ Use vague assertions
```gherkin
# Bad
Then something should happen

# Good
Then I should see a success message
And my account should be created in the database
```

## Gherkin Keywords

### Given
Sets up the initial state or context.
```gherkin
Given I am logged in as "user@example.com"
Given the database contains 5 users
Given Azure OpenAI is configured
```

### When
Describes the action or event.
```gherkin
When I send a message "Hello"
When I click the submit button
When the AI processes my request
```

### Then
Describes the expected outcome.
```gherkin
Then I should see a confirmation message
Then the memory should be stored in the database
Then the AI response should include relevant memories
```

### And / But
Continue Given/When/Then steps.
```gherkin
Given I am on the chat page
And I have a conversation history
When I send a new message
And I wait for the response
Then I should see my message
And I should see the AI response
```

### Background
Runs before each scenario in the feature.
```gherkin
Background:
  Given the application is running
  And the database is accessible
  And I am logged in
```

## Examples from Existing Features

### Authentication Example
```gherkin
Feature: User Authentication
  As a user
  I want to register and login to the application
  So that I can access my personalized chat assistant

  Scenario: User registration with valid credentials
    Given I am on the registration page
    When I enter my email "user@example.com"
    And I enter my name "John Doe"
    And I enter a password "SecurePass123!"
    And I submit the registration form
    Then I should see a success message
    And my account should be created in the database
```

### Memory RAG Example
```gherkin
Feature: Personal Memory RAG System
  As a logged-in user
  I want the AI to remember important information about me
  So that I have a personalized experience

  Scenario: AI automatically stores user preference
    Given I send the message "I love pizza"
    When the AI processes the message
    Then a memory should be created
    And the memory should be stored with a vector embedding
```

## Creating New Feature Files

### Step-by-Step Process:

1. **Identify the feature**: What functionality are you documenting?
   
2. **Create the file**: `docs/features/feature-name.feature`

3. **Write the feature header**:
   ```gherkin
   Feature: Feature Name
     As a [role]
     I want [feature]
     So that [benefit]
   ```

4. **Add Background** (if common setup is needed):
   ```gherkin
   Background:
     Given [common preconditions]
   ```

5. **Write scenarios**: One scenario per test case/behavior

6. **Review**: Ensure scenarios are clear, testable, and complete

7. **Commit**: Include feature file in your git commit

## Updating Existing Features

When code changes affect existing features:

1. **Locate the relevant feature file** in `docs/features/`
2. **Update affected scenarios** to reflect new behavior
3. **Add new scenarios** for new functionality
4. **Mark deprecated scenarios** if behavior is removed
5. **Commit changes** with the code changes

## Integration with Development

### Before Implementation:
- Review feature files for acceptance criteria
- Understand expected behavior
- Identify edge cases from scenarios

### During Implementation:
- Reference scenarios while coding
- Ensure code satisfies all scenario steps
- Add new scenarios for edge cases discovered

### After Implementation:
- Verify all scenarios are satisfied
- Update scenarios if behavior changed
- Add scenarios for bug fixes

## Maintenance Guidelines

### Monthly Review:
- Check for outdated scenarios
- Update scenarios to match current behavior
- Remove deprecated features
- Add missing scenarios

### When Refactoring:
- Update scenarios if user-facing behavior changes
- Keep scenarios if only internal implementation changes
- Add scenarios for new edge cases

### When Fixing Bugs:
- Add a scenario that reproduces the bug
- Keep the scenario as regression test

## Tools and Frameworks

These feature files can be used with:

- **Cucumber.js**: JavaScript BDD framework
- **Jest-Cucumber**: Jest integration
- **Playwright-BDD**: E2E testing with Playwright
- **Manual Testing**: As test case documentation

Example setup with Cucumber.js:
```bash
npm install --save-dev @cucumber/cucumber
npx cucumber-js docs/features/*.feature
```

## Best Practices Summary

1. ✅ Write from user perspective
2. ✅ Use concrete examples
3. ✅ Keep scenarios atomic and focused
4. ✅ Use Background for common setup
5. ✅ Use tables for data-driven tests
6. ✅ Be descriptive in scenario names
7. ✅ Update features with code changes
8. ✅ One feature per file
9. ✅ Avoid implementation details
10. ✅ Make scenarios testable

## Resources

- [Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)
- [BDD Best Practices](https://cucumber.io/docs/bdd/)
- [Feature Files Location](../../docs/features/)
- [Feature Files README](../../docs/features/README.md)

---

**Remember**: Feature files are living documentation. Keep them up to date, clear, and comprehensive. They should tell the story of what your application does, not how it does it.
