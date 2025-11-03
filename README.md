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
- 🔗 **MCP Integration**: Both apps connected via Model Context Protocol
- 🗄️ **PostgreSQL Database**: Persistent storage for chat history
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
   # Edit .env and add your OPENAI_API_KEY
   ```

3. **Start all services with Docker Compose**
   ```bash
   docker-compose up
   ```

4. **Access the applications**
   - Chat App: http://localhost:3000
   - n8n: http://localhost:5678 (credentials: admin/admin)
   - PostgreSQL: localhost:5432

## Services

### Chat Application (Port 3000)
- Built with Next.js 14 and React
- LangChain integration for AI conversations
- Prisma ORM with PostgreSQL
- Tailwind CSS for styling
- MCP client integration

### n8n Workflow Automation (Port 5678)
- Full n8n workflow automation platform
- Default credentials: admin/admin
- Connected to shared PostgreSQL instance
- MCP integration ready

### MCP Server (Port 3001)
- TypeScript-based MCP server
- Provides tools for both applications
- Standardized communication protocol

### PostgreSQL Database (Port 5432)
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
docker-compose build

# Build specific service
docker-compose build chat-app
```

## Environment Variables

### Root `.env`
- `OPENAI_API_KEY`: Your OpenAI API key for LangChain

### Chat App
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API key

### n8n
- `N8N_BASIC_AUTH_USER`: n8n username (default: admin)
- `N8N_BASIC_AUTH_PASSWORD`: n8n password (default: admin)

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

## Docker Volumes

- `postgres_data`: PostgreSQL data persistence
- `n8n_data`: n8n workflows and configurations

## Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## Troubleshooting

### Chat app can't connect to database
- Ensure PostgreSQL container is healthy: `docker-compose ps`
- Check logs: `docker-compose logs postgres`

### n8n won't start
- Check if port 5678 is already in use
- View logs: `docker-compose logs n8n`

### Build failures
- Clear Docker cache: `docker-compose build --no-cache`
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
