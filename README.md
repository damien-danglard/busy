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

For detailed setup instructions, see [docs/QUICKSTART.md](./docs/QUICKSTART.md).

1. **Clone the repository**
   ```bash
   git clone https://github.com/damien-danglard/busy.git
   cd busy
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and configure:
   # - Azure OpenAI credentials (see docs/QUICKSTART.md)
   # - Database credentials
   # - NextAuth secret
   ```

3. **Start with Docker Compose**
   ```bash
   docker compose up
   ```

4. **Access the applications**
   - Chat App: http://localhost:3000
   - n8n: http://localhost:5678 (admin/admin)
   - PostgreSQL: localhost:5432

## 📚 Documentation

All documentation is available in the [docs/](./docs) folder:

- [**Quick Start Guide**](./docs/QUICKSTART.md) - Get started in minutes
- [**Architecture**](./docs/ARCHITECTURE.md) - System architecture and design
- [**Authentication**](./docs/AUTHENTICATION_FLOW.md) - User authentication flow
- [**Memory & RAG**](./docs/MEMORY_RAG.md) - How the AI remembers information
- [**LangSmith Setup**](./docs/LANGSMITH_SETUP.md) - Configure monitoring
- [**Deployment Guide**](./docs/DEPLOYMENT_GUIDE.md) - Production deployment
- [**Contributing**](./docs/CONTRIBUTING.md) - How to contribute
- [**Changelog**](./docs/CHANGELOG.md) - Version history

See [docs/README.md](./docs/README.md) for a complete documentation index.

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
- Based on `pgvector/pgvector:pg16` Docker image
- Credentials: busy/busy123
- Database: busy_db

## Development

See [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) for development guidelines.

### Local Development (without Docker)

**Note**: Using Node Version Manager (nvm) is recommended to match the Docker Node.js version (20.x):
```bash
# Install nvm and Node.js 20
nvm install 20
nvm use 20
```

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up the database**
   ```bash
   cd apps/chat-app
   npx prisma migrate dev
   ```

3. **Run chat-app**
   ```bash
   cd apps/chat-app
   npm run dev
   ```
   npm run dev
   ```

### Building Docker Images

```bash
# Build all images
docker compose build

# Build specific service
docker compose build chat-app
```

## Technologies

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Node.js 20, TypeScript
- **AI/ML**: LangChain, Azure OpenAI (GPT-4o, text-embedding-3-large)
- **Database**: PostgreSQL 16 + pgvector
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Workflow**: n8n
- **Deployment**: Docker, Docker Compose

## Project Structure

```
busy/
├── apps/
│   └── chat-app/         # Next.js chat application
├── packages/
│   └── mcp-server/       # Model Context Protocol server
├── data/                 # Docker volumes data (gitignored)
├── docs/                 # Documentation
├── .github/
│   └── instructions/     # GitHub Copilot custom instructions
└── docker-compose.yml    # Docker orchestration
```

## Security

⚠️ **Important**: Default credentials are for development only!

For production:
- Change all default passwords
- Use strong `NEXTAUTH_SECRET`
- Configure proper Azure OpenAI credentials
- Enable HTTPS/TLS
- Follow [docs/DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md)

## License

See [LICENSE](./LICENSE) file.

## Contributing

Contributions are welcome! Please read [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) first.
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
