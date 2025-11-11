# Quick Start Guide

Get up and running with Busy in under 5 minutes!

## Prerequisites

- Docker (v20.10+)
- Docker Compose (v2.0+)
- (Optional) OpenAI API key for chat functionality

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/damien-danglard/busy.git
cd busy
```

### Step 2: Initialize the Project

```bash
./init.sh
```

This script will:
- Check for required dependencies
- Create `.env` files from templates

### Step 3: Configure Environment

Edit `.env` and add your OpenAI API key:

```bash
OPENAI_API_KEY=sk-your-api-key-here
```

> **Note**: The chat app will still run without an API key, but AI features won't work.

### Step 4: Start All Services

```bash
docker compose up
```

Or run in detached mode:

```bash
docker compose up -d
```

### Step 5: Access the Applications

Wait 30-60 seconds for all services to start, then access:

- **Chat App**: http://localhost:3000
- **n8n**: http://localhost:5678 (login: admin/admin)
- **Health Check**: http://localhost:3000/api/health

## Verify Installation

Check that all services are running:

```bash
docker compose ps
```

You should see:

```
NAME                  STATUS
busy-postgres         Up (healthy)
busy-chat-app         Up
busy-n8n              Up
busy-mcp-server       Up
```

## Using the Chat App

1. Open http://localhost:3000 in your browser
2. Type a message in the input field
3. Press Enter or click "Send"
4. The AI assistant will respond (requires OpenAI API key)

## Using n8n

1. Open http://localhost:5678
2. Login with username: `admin`, password: `admin`
3. Create your first workflow
4. Connect to PostgreSQL using:
   - Host: `postgres`
   - Database: `busy_db`
   - User: `busy`
   - Password: `busy123`

## Common Commands

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f chat-app
```

### Restart a Service

```bash
docker compose restart chat-app
```

### Stop All Services

```bash
docker compose down
```

### Reset Everything (including data)

```bash
docker compose down -v
```

### Rebuild After Code Changes

```bash
docker compose up --build
```

## Development Mode

For local development without Docker:

### Start Database Only

```bash
make dev
# or
docker compose -f docker-compose.dev.yml up -d
```

### Run Services Locally

**Terminal 1: MCP Server**
```bash
cd packages/mcp-server
npm install
npm run dev
```

**Terminal 2: Chat App**
```bash
cd apps/chat-app
npm install
npx prisma migrate dev
npm run dev
```

**Terminal 3: n8n**
```bash
cd apps/n8n
npm install
npm start
```

## Troubleshooting

### Ports Already in Use

If you get port conflicts:

```bash
# Check what's using the port
lsof -i :3000

# Stop the conflicting process or change the port in docker-compose.yml
```

### Database Connection Failed

```bash
# Check PostgreSQL logs
docker compose logs postgres

# Ensure it's healthy
docker compose ps postgres

# If needed, restart it
docker compose restart postgres
```

### Chat App Not Responding

```bash
# Check logs
docker compose logs chat-app

# Verify health
curl http://localhost:3000/api/health

# Rebuild if needed
docker compose up --build -d chat-app
```

### n8n Can't Access Database

Make sure you're using the internal Docker network hostname:
- Host: `postgres` (not `localhost`)
- Port: `5432`

### Clear and Restart

```bash
# Complete reset
docker compose down -v
docker compose up --build
```

## Next Steps

1. **Explore the Chat App**: Test different prompts and conversations
2. **Create n8n Workflows**: Build automation workflows
3. **Customize MCP Tools**: Add custom tools in `packages/mcp-server/src/index.ts`
4. **Read Documentation**: 
   - [README.md](./README.md) - Full documentation
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
   - [MCP_INTEGRATION.md](./MCP_INTEGRATION.md) - MCP details
   - [CONTRIBUTING.md](./CONTRIBUTING.md) - How to contribute

## Getting Help

- **Issues**: Check existing [issues](https://github.com/damien-danglard/busy/issues)
- **Discussions**: Start a [discussion](https://github.com/damien-danglard/busy/discussions)
- **Documentation**: Read the [docs](./README.md)

## Production Deployment

For production use:

1. Change default passwords in `docker-compose.yml`
2. Use environment-specific `.env` files
3. Enable SSL/TLS
4. Set up proper monitoring
5. Configure backups for PostgreSQL
6. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for security recommendations

---

**Enjoy using Busy!** 🚀
