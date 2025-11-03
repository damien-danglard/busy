# Contributing to Busy

Thank you for your interest in contributing to Busy! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/busy.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`

## Development Setup

### Prerequisites
- Node.js 20 or higher
- Docker and Docker Compose
- Git

### Initial Setup

```bash
# Install dependencies
npm install

# Start development database
make dev

# In separate terminals, start each service:

# Terminal 1: MCP Server
cd packages/mcp-server
npm install
npm run dev

# Terminal 2: Chat App
cd apps/chat-app
npm install
npx prisma migrate dev
npm run dev

# Terminal 3: n8n
cd apps/n8n
npm install
npm start
```

## Project Structure

```
busy/
├── apps/
│   ├── n8n/              # n8n workflow automation
│   └── chat-app/         # Next.js chat application
├── packages/
│   └── mcp-server/       # MCP server implementation
├── docker-compose.yml    # Production orchestration
├── docker-compose.dev.yml # Development database
└── Makefile              # Common commands
```

## Coding Standards

### TypeScript
- Use TypeScript for all new code
- Enable strict mode
- Provide type annotations for function parameters and return values
- Use interfaces for object shapes

### Code Style
- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons
- Use meaningful variable and function names

### React/Next.js
- Use functional components with hooks
- Prefer server components when possible
- Use TypeScript for all components
- Follow Next.js best practices for routing and data fetching

## Testing

Currently, the project focuses on Docker-based integration testing:

```bash
# Build and test all services
docker-compose build
docker-compose up

# Verify services are running
docker-compose ps

# Check logs
docker-compose logs
```

## Making Changes

### Branch Naming
- Feature: `feature/description`
- Bug fix: `fix/description`
- Documentation: `docs/description`

### Commit Messages
Use conventional commit format:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
```
feat: add user authentication to chat app
fix: resolve database connection issue
docs: update README with installation steps
```

### Pull Requests

1. Update your branch with the latest main:
   ```bash
   git checkout main
   git pull origin main
   git checkout your-branch
   git rebase main
   ```

2. Ensure all services build and run:
   ```bash
   docker-compose build
   docker-compose up
   ```

3. Push your changes:
   ```bash
   git push origin your-branch
   ```

4. Create a Pull Request with:
   - Clear title describing the change
   - Description of what changed and why
   - Screenshots for UI changes
   - Reference to related issues

## Adding New Features

### Adding a New MCP Tool

1. Define the tool in `packages/mcp-server/src/index.ts`
2. Add to the ListToolsRequestSchema handler
3. Implement in the CallToolRequestSchema handler
4. Update MCP_INTEGRATION.md documentation

### Adding a New API Endpoint

1. Create route in `apps/chat-app/src/app/api/`
2. Implement request handling
3. Add error handling
4. Update documentation

### Modifying Database Schema

1. Update `apps/chat-app/prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name description`
3. Test migration with Docker setup

## Docker Development

### Building Images
```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build chat-app

# No cache build
docker-compose build --no-cache
```

### Debugging Containers
```bash
# View logs
docker-compose logs -f chat-app

# Execute commands in container
docker-compose exec chat-app sh

# Inspect container
docker-compose exec chat-app env
```

## Common Issues

### Port Already in Use
If you get port conflicts:
```bash
# Check what's using the port
lsof -i :3000

# Stop all services
docker-compose down
```

### Database Connection Issues
```bash
# Reset database
docker-compose down -v
docker-compose up -d postgres

# Run migrations
cd apps/chat-app
npx prisma migrate deploy
```

### Node Modules Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Documentation

When adding features, update:
- README.md: User-facing documentation
- MCP_INTEGRATION.md: MCP-specific documentation
- Code comments: For complex logic
- API documentation: For new endpoints

## Review Process

1. All PRs require review before merging
2. Address review feedback promptly
3. Keep PRs focused and reasonably sized
4. Ensure CI checks pass

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions or ideas
- Check existing issues before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
