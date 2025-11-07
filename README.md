# Busy - AI Automated Work Assistant

A monorepo composed of two applications connected via Model Context Protocol (MCP):
- **n8n**: Workflow automation platform
- **Chat App**: Next.js chat application with LangChain, PostgreSQL, and Prisma

## Architecture

This project uses a monorepo structure with the following components:

```
busy/
├── apps/
│   ├── n8n/              # n8n workflow automation
│   └── chat-app/         # Next.js chat application
├── packages/
│   └── mcp-server/       # Model Context Protocol server
└── docker-compose.yml    # Docker orchestration
```

## Features

- 🤖 **n8n Workflow Automation**: Pre-configured n8n instance for workflow automation
- 💬 **AI Chat Interface**: Next.js-based chat application with LangChain integration
- 🧠 **Personal Memory RAG**: AI remembers user-specific information across conversations using vector embeddings
- 🔐 **Authentication**: Secure user authentication with NextAuth.js (email/password)
- 🔗 **MCP Integration**: Both apps connected via Model Context Protocol
- 🗄️ **PostgreSQL Database**: Persistent storage with pgvector extension for semantic search
- 🐳 **Dockerized**: All services run in Docker containers
- 📦 **Monorepo**: Organized workspace structure

## Prerequisites

- Docker (v20.10 or higher)
- Docker Compose (v2.0 or higher)
- (Optional) Node.js 20+ for local development

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/damien-danglard/busy.git
   cd busy
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and configure:
   # - OPENAI_API_KEY: Your OpenAI API key
   # - NEXTAUTH_SECRET: Generate with 'openssl rand -base64 32'
   ```

3. **Start all services with Docker Compose**
   ```bash
   docker compose up
   ```

4. **Create demo user (optional)**
   ```bash
   # After services are running, seed the database with a demo user
   docker exec busy-chat-app npm run db:seed
   ```

5. **Access the applications**
   - Chat App: http://localhost:3000 (login: admin@busy.com / BusyAdmin2024!)
   - n8n: http://localhost:5678 (credentials: admin/admin)
   - PostgreSQL: localhost:5432

> **⚠️ Important**: This setup uses default credentials for development. For production deployment, change all default passwords and follow the security recommendations in the [Security](#security) section below.

## Services

### Chat Application (Port 3000)
- Built with Next.js 14 and React
- NextAuth.js authentication with email/password
- LangChain integration for AI conversations with OpenAI Functions Agent
- Personal Memory RAG system with vector embeddings
- Prisma ORM with PostgreSQL and pgvector
- Tailwind CSS for styling
- MCP client integration
- Protected routes and session management

For detailed information about the Personal Memory RAG feature, see [MEMORY_RAG.md](./MEMORY_RAG.md).

### n8n Workflow Automation (Port 5678)
- Full n8n workflow automation platform
- Default credentials: admin/admin
- Connected to shared PostgreSQL instance
- MCP integration ready

### MCP Server (Port 3001)
- TypeScript-based MCP server
- Provides tools for both applications including memory operations
- Standardized communication protocol

### PostgreSQL Database (Port 5432)
- Version 16 with pgvector extension
- Vector similarity search support
- Version 16 Alpine
- Credentials: busy/busy123
- Database: busy_db

## Development

### Local Development (without Docker)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up the database**
   ```bash
   cd apps/chat-app
   npx prisma migrate dev
   ```

3. **Run services individually**
   ```bash
   # Terminal 1: MCP Server
   cd packages/mcp-server
   npm run dev

   # Terminal 2: Chat App
   cd apps/chat-app
   npm run dev

   # Terminal 3: n8n
   cd apps/n8n
   npm start
   ```

### Building Docker Images

```bash
# Build all images
docker compose build

# Build specific service
docker compose build chat-app
```

## Environment Variables

### Root `.env`
- `OPENAI_API_KEY`: Your OpenAI API key for LangChain
- `NEXTAUTH_SECRET`: Secret key for NextAuth.js JWT encryption (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Base URL for NextAuth.js (e.g., `http://localhost:3000`)

### Chat App
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API key
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `NEXTAUTH_URL`: Base URL for authentication

### n8n
- `N8N_BASIC_AUTH_USER`: n8n username (default: admin)
- `N8N_BASIC_AUTH_PASSWORD`: n8n password (default: admin)

> **⚠️ SECURITY WARNING**: The default credentials should be changed immediately in production! This includes:
> - n8n credentials (admin/admin)
> - Chat app demo user (admin@busy.com / BusyAdmin2024!)
> - NEXTAUTH_SECRET
> - Database passwords
>
> Use environment variables or `docker-compose.override.yml` to set secure credentials.

## Project Structure

### Apps
- **apps/n8n/**: n8n workflow automation application
- **apps/chat-app/**: Next.js chat application with LangChain

### Packages
- **packages/mcp-server/**: Shared MCP server implementation in TypeScript

## MCP (Model Context Protocol)

The MCP server provides a standardized way for both applications to communicate and share tools. It implements:
- Tool discovery and execution
- Standardized request/response format
- Inter-application communication

## Database Schema

The chat application uses Prisma with the following models:
- **Message**: Stores chat messages with role (user/assistant)
- **Conversation**: Manages conversation threads
- **Memory**: Stores user-specific memories with vector embeddings for semantic search
- **User**: User accounts with authentication credentials
- **Account**: OAuth provider accounts (for future OAuth integration)
- **Session**: User sessions for NextAuth.js
- **VerificationToken**: Email verification tokens

For more details on authentication, see [apps/chat-app/AUTHENTICATION.md](apps/chat-app/AUTHENTICATION.md).

## Docker Volumes

- `postgres_data`: PostgreSQL data persistence
- `n8n_data`: n8n workflows and configurations

## Stopping Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes (clean slate)
docker compose down -v
```

## Security

### Development vs Production

This repository is configured for **development** use by default. For production deployment:

1. **Change Default Credentials**
   ```bash
   # Create docker-compose.override.yml
   cp docker-compose.override.yml.example docker-compose.override.yml
   
   # Edit and set secure passwords
   # - N8N_BASIC_AUTH_PASSWORD
   # - POSTGRES_PASSWORD
   ```

2. **Use Environment Variables**
   - Never commit `.env` files with real credentials
   - Use Docker secrets or external secret management
   - Set `OPENAI_API_KEY` securely

3. **Enable HTTPS**
   - Use reverse proxy (nginx, Traefik)
   - Enable SSL/TLS certificates
   - Configure HTTPS redirects

4. **Database Security**
   - Use strong PostgreSQL passwords
   - Limit database network access
   - Enable SSL for database connections
   - Regular backups

5. **Additional Hardening**
   - Enable rate limiting
   - Implement API authentication
   - Use security headers
   - Regular security updates
   - Monitor logs for suspicious activity

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed security recommendations.

## Troubleshooting

### Chat app can't connect to database
- Ensure PostgreSQL container is healthy: `docker compose ps`
- Check logs: `docker compose logs postgres`

### n8n won't start
- Check if port 5678 is already in use
- View logs: `docker compose logs n8n`

### Build failures
- Clear Docker cache: `docker compose build --no-cache`
- Remove old images: `docker system prune -a`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Node.js, TypeScript
- **AI/ML**: LangChain, OpenAI
- **Database**: PostgreSQL 16, Prisma ORM
- **Automation**: n8n
- **Protocol**: Model Context Protocol (MCP)
- **Infrastructure**: Docker, Docker Compose
