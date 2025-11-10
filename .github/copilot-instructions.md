# GitHub Copilot Instructions - Busy Project

This document provides repository-wide guidelines for GitHub Copilot to help maintain code quality and consistency across the Busy AI automated work assistant project.

## Project Overview

Busy is a monorepo containing a Next.js chat application with LangChain, n8n workflow automation, and MCP (Model Context Protocol) server integration. The application uses Azure OpenAI, PostgreSQL with pgvector, and Prisma ORM.

## Code Style and Conventions

### General Guidelines

- **Language**: Use TypeScript for all new code
- **Code Quality**: Write clean, maintainable, and well-documented code
- **Comments**: Only add comments for complex logic that needs clarification
- **Error Handling**: Always handle errors explicitly with try-catch blocks
- **Security**: Never commit secrets, API keys, or sensitive data

### TypeScript

- Use strict TypeScript settings (strict mode enabled)
- Prefer `interface` over `type` for object shapes
- Use explicit return types for functions
- Avoid `any` type - use `unknown` or proper types instead
- Use const assertions where appropriate

### React/Next.js

- Use functional components with hooks (no class components)
- Follow Next.js 16 App Router conventions
- Use server components by default, mark with `'use client'` only when needed
- Implement proper loading and error states
- Use Next.js Image component for images

### Naming Conventions

- **Files**: Use kebab-case for files (e.g., `user-profile.tsx`, `api-client.ts`)
- **Components**: Use PascalCase for React components (e.g., `UserProfile`, `ChatMessage`)
- **Functions**: Use camelCase for functions and variables (e.g., `getUserData`, `chatHistory`)
- **Constants**: Use UPPER_SNAKE_CASE for constants (e.g., `MAX_RETRIES`, `API_ENDPOINT`)
- **Types/Interfaces**: Use PascalCase with descriptive names (e.g., `UserData`, `ChatMessage`)

## Database and Prisma

### Prisma Migrations

**CRITICAL**: Always use Prisma CLI commands for database migrations - never manually edit migration files.

- Use `npx prisma migrate dev --name <descriptive_name>` to create migrations
- Use `npx prisma migrate deploy` to apply migrations in production
- Always commit both `schema.prisma` and generated migration files together
- See `.github/instructions/PRISMA.instructions.md` for detailed guidelines

### Database Queries

- Use Prisma Client for all database operations
- Use `Prisma.sql` template tag for raw queries to prevent SQL injection
- Always validate and sanitize user input before database operations
- Use transactions for multiple related operations

## Package Management

### NPM

**CRITICAL**: Always use npm commands instead of manually editing package files.

- Use `npm install <package>` to add dependencies
- Use `npm install -D <package>` for dev dependencies
- Use `npm uninstall <package>` to remove packages
- Never manually edit `package.json` dependencies or `package-lock.json`
- See `.github/instructions/NPM.instructions.md` for detailed guidelines

## API and External Services

### Azure OpenAI

- Always use environment variables for API keys and configuration
- Use `AzureChatOpenAI` and `AzureOpenAIEmbeddings` from `@langchain/openai`
- Include proper error handling for API failures
- Use environment variables:
  - `AZURE_OPENAI_API_KEY`
  - `AZURE_OPENAI_INSTANCE_NAME`
  - `AZURE_OPENAI_ENDPOINT`
  - `AZURE_OPENAI_API_VERSION`
  - `AZURE_OPENAI_DEPLOYMENT_NAME`

### LangChain

- Use lazy initialization for embeddings to avoid build-time errors
- Implement proper error handling for LLM operations
- Use structured output when possible
- Add LangSmith tracing for debugging (optional, controlled by env vars)

## Testing and Quality

- Write tests for critical business logic
- Run linters before committing: `npm run lint`
- Test locally before pushing to remote
- Ensure Docker builds succeed: `docker compose build`

## Documentation

- Update documentation when making significant changes
- Keep README.md and docs/ folder in sync
- Add entries to `docs/CHANGELOG.md` for user-facing changes
- Use clear, concise language in documentation
- Update Gherkin feature specifications when adding or modifying features
- See `.github/instructions/GHERKIN.instructions.md` for feature file guidelines

## Feature Specifications

**IMPORTANT**: All features must be documented in Gherkin format.

- Feature files are located in `docs/features/` directory
- Use Gherkin syntax (Given-When-Then) for all scenarios
- Update feature files when adding or modifying functionality
- Create new `.feature` files for new features
- Keep scenarios focused, testable, and from user perspective
- See `.github/instructions/GHERKIN.instructions.md` for detailed guidelines

### When to Update Features:

1. **New Feature**: Create new `.feature` file with scenarios
2. **Modified Behavior**: Update affected scenarios in existing files
3. **Bug Fix**: Add regression test scenario
4. **Refactoring**: Update only if user-facing behavior changes

### Example Feature Scenario:

```gherkin
Feature: AI Chat Conversation
  As a logged-in user
  I want to chat with an AI assistant
  So that I can get help with my tasks

  Scenario: Send a message to the AI
    Given I am logged in and on the chat page
    When I type "Hello" in the message input
    And I click the send button
    Then I should see my message displayed
    And I should receive an AI response
```

## Security Best Practices

- Never log sensitive information (API keys, passwords, tokens)
- Validate all user inputs
- Use parameterized queries for database operations
- Keep dependencies up to date
- Use environment variables for all secrets
- Follow principle of least privilege

## Git Workflow

- Write clear, descriptive commit messages
- Use conventional commit format: `type(scope): description`
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`
  - Scope (optional): `chat-app`, `mcp-server`, `features`
  - Description: Short description of changes
  - Examples:
    - `feat(chat-app): add message streaming support`
    - `fix(memory): correct vector similarity search query`
    - `docs(features): add authentication scenarios`
    - `refactor: simplify error handling in API routes`
- Keep commits focused and atomic
- Reference issue numbers in commits when applicable
- Include feature file updates in the same commit as code changes

## Environment Variables

- Always add new environment variables to `.env.example`
- Document purpose and format of each variable
- Use sensible defaults where appropriate
- Never commit `.env` file to version control

## Docker

- Keep Dockerfile simple and well-documented
- Use multi-stage builds for smaller images
- Don't install unnecessary packages
- Use specific version tags (e.g., `node:20-alpine`)
- Ensure builds are reproducible

## AI/LLM Considerations

- Design prompts to be clear and specific
- Implement token limit handling
- Add rate limiting for external API calls
- Cache expensive operations when possible
- Monitor costs with LangSmith (optional)

## File Organization

```
apps/
  chat-app/           # Next.js chat application
    src/
      app/            # Next.js App Router pages
      lib/            # Utility functions and shared logic
      components/     # React components
    prisma/           # Database schema and migrations
packages/
  mcp-server/         # Model Context Protocol server
docs/                 # All documentation
.github/
  instructions/       # Copilot custom instructions
```

## Common Patterns

### Error Handling

```typescript
try {
  const result = await someAsyncOperation();
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  throw new Error(`Failed to perform operation: ${errorMessage}`);
}
```

### Environment Variable Usage

```typescript
// With validation
if (!process.env.REQUIRED_VAR) {
  throw new Error('REQUIRED_VAR environment variable is required');
}

// With default
const value = process.env.OPTIONAL_VAR || 'default-value';
```

### Prisma Operations

```typescript
// Good: Using Prisma Client
const user = await prisma.user.findUnique({ where: { id } });

// Good: Using Prisma.sql for raw queries
const results = await prisma.$queryRaw(
  Prisma.sql`SELECT * FROM users WHERE email = ${email}`
);
```

## Resources

- [Project Documentation](./docs/README.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Contributing Guide](./docs/CONTRIBUTING.md)
- [Feature Specifications](./docs/features/README.md)
- [Gherkin Guidelines](./.github/instructions/GHERKIN.instructions.md)
- [Prisma Guidelines](./.github/instructions/PRISMA.instructions.md)
- [NPM Guidelines](./.github/instructions/NPM.instructions.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [LangChain Documentation](https://js.langchain.com/)

## Workflow Summary

When implementing a new feature:

1. **Check Feature Files**: Review existing scenarios in `docs/features/`
2. **Write Code**: Implement feature following guidelines above
3. **Update/Create Feature File**: Document behavior in Gherkin format
4. **Test**: Ensure all scenarios are satisfied
5. **Update Docs**: Update README.md or relevant documentation
6. **Commit**: Use conventional commits with feature file updates included

When fixing a bug:

1. **Add Scenario**: Create a scenario that reproduces the bug in relevant `.feature` file
2. **Fix Code**: Implement the fix
3. **Verify**: Ensure the scenario now passes
4. **Commit**: Include both code fix and feature scenario update

---

**Remember**: When in doubt, prioritize code clarity and maintainability over cleverness. Write code that others (and future you) can easily understand and maintain. Keep feature files in sync with your code changes.
