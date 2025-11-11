# Architecture Documentation

## System Overview

The Busy monorepo consists of four main services orchestrated through Docker Compose:

```
┌─────────────────────────────────────────────────────────────────┐
│                         Docker Compose                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐ │
│  │   Chat App   │      │     n8n      │      │  MCP Server  │ │
│  │  (Next.js)   │      │ (Workflows)  │      │ (TypeScript) │ │
│  │   Port 3000  │      │  Port 5678   │      │  Port 3001   │ │
│  └──────┬───────┘      └──────┬───────┘      └──────┬───────┘ │
│         │                     │                      │          │
│         │                     │                      │          │
│         │      ┌──────────────┴──────────────┐      │          │
│         └──────►     PostgreSQL Database     ◄──────┘          │
│                │        Port 5432             │                 │
│                └──────────────────────────────┘                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

                          ▲
                          │
                    External Access:
                    - Chat: localhost:3000
                    - n8n: localhost:5678
                    - DB: localhost:5432
```

## Component Details

### 1. Chat Application (Next.js)
**Technology Stack:**
- Next.js 14 (React 18)
- TypeScript
- Tailwind CSS
- Prisma ORM
- LangChain for AI integration
- MCP Client

**Features:**
- AI-powered chat interface
- Message persistence via PostgreSQL
- LangChain integration for advanced AI capabilities
- MCP client for tool execution
- RESTful API endpoints

**Endpoints:**
- `/` - Main chat interface
- `/api/chat` - Chat message processing
- `/api/health` - Health check endpoint

**Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key for LangChain
- `NODE_ENV` - Environment mode

### 2. n8n Workflow Automation
**Technology Stack:**
- n8n (latest)
- Node.js runtime

**Features:**
- Visual workflow automation
- Pre-configured with basic auth
- Connected to shared PostgreSQL
- Webhook support
- Can integrate with MCP server

**Access:**
- URL: http://localhost:5678
- Username: admin
- Password: admin

**Environment Variables:**
- `N8N_BASIC_AUTH_ACTIVE` - Enable basic authentication
- `N8N_BASIC_AUTH_USER` - Admin username
- `N8N_BASIC_AUTH_PASSWORD` - Admin password
- `N8N_HOST` - Bind host
- `N8N_PORT` - Service port
- `WEBHOOK_URL` - Webhook base URL

### 3. MCP Server
**Technology Stack:**
- TypeScript
- Model Context Protocol SDK
- Node.js 20

**Features:**
- Tool discovery and listing
- Tool execution with typed parameters
- Stdio transport for process communication
- Extensible tool registry

**Available Tools:**
1. `get_status` - Returns current server status
2. `execute_task` - Executes arbitrary tasks

**Communication:**
- Protocol: MCP (Model Context Protocol)
- Transport: Standard I/O (stdio)
- Format: JSON-RPC

### 4. PostgreSQL Database
**Technology Stack:**
- PostgreSQL 16 Alpine
- Persistent volume storage

**Features:**
- Shared database for all services
- Health check monitoring
- Automatic data persistence
- Migration support via Prisma

**Configuration:**
- User: busy
- Password: busy123
- Database: busy_db
- Port: 5432

**Schema (Prisma):**
```prisma
model Message {
  id        String   @id @default(uuid())
  content   String
  role      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Conversation {
  id        String   @id @default(uuid())
  title     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Data Flow

### Chat Message Flow
```
User Input → Chat UI → /api/chat → LangChain → OpenAI API
                           ↓
                      Prisma ORM
                           ↓
                     PostgreSQL DB
                           ↓
                     Store Message
                           ↓
                    Response to User
```

### Workflow Automation Flow
```
Trigger (webhook/schedule/manual)
    ↓
n8n Workflow Engine
    ↓
Execute Workflow Nodes
    ↓
Optional: Call MCP Server Tools
    ↓
Optional: Store Data in PostgreSQL
    ↓
Complete Workflow
```

### MCP Tool Execution Flow
```
Client (Chat App/n8n)
    ↓
MCP Client Request
    ↓
MCP Server (stdio transport)
    ↓
Tool Discovery/Execution
    ↓
Return Result to Client
```

## Network Architecture

### Internal Docker Network
All services communicate via Docker's internal network:
- Service name resolution (e.g., `postgres`, `mcp-server`)
- No external network access required for inter-service communication

### Port Mappings
- `3000:3000` - Chat App (HTTP)
- `5678:5678` - n8n (HTTP)
- `3001:3001` - MCP Server (stdio/future HTTP)
- `5432:5432` - PostgreSQL (TCP)

### Volume Mounts
- `postgres_data` - PostgreSQL data persistence
- `n8n_data` - n8n workflows and configurations

## Security Considerations

### Current Implementation
1. **Basic Authentication** for n8n (admin/admin)
2. **Environment Variables** for sensitive configuration
3. **Docker Network Isolation** for internal communication
4. **No Direct Database Access** from applications (via Prisma ORM)

### Production Recommendations
1. Change default passwords
2. Enable SSL/TLS for all services
3. Implement API authentication/authorization
4. Use secrets management (Docker secrets, Vault)
5. Enable database encryption at rest
6. Implement rate limiting
7. Add reverse proxy (nginx, Traefik)
8. Use environment-specific configurations

## Scalability

### Horizontal Scaling Options
1. **Chat App**: Can be scaled with load balancer
2. **n8n**: Supports queue mode for scaling
3. **MCP Server**: Can run multiple instances
4. **PostgreSQL**: Can use read replicas

### Vertical Scaling
- Adjust container resource limits in docker-compose.yml
- Configure PostgreSQL connection pooling
- Optimize Next.js build and caching

## Monitoring & Observability

### Health Checks
- PostgreSQL: `pg_isready` command
- Chat App: `/api/health` endpoint
- n8n: Built-in health endpoint
- MCP Server: Process monitoring

### Logging
- All services log to stdout/stderr
- View logs: `docker compose logs -f [service]`
- Centralized logging can be added via log drivers

### Metrics
Future enhancements:
- Prometheus metrics export
- Grafana dashboards
- Application performance monitoring (APM)

## Development Workflow

### Local Development
```bash
# Start only database
make dev

# Run services locally
cd apps/chat-app && npm run dev
cd packages/mcp-server && npm run dev
cd apps/n8n && npm start
```

### Docker Development
```bash
# Build and start all services
docker compose up --build

# View logs
docker compose logs -f

# Rebuild specific service
docker compose build chat-app
docker compose up -d chat-app
```

### Database Migrations
```bash
# Create migration
cd apps/chat-app
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy
```

## Deployment

### Local/Development
```bash
docker compose up
```

### Production
1. Set environment variables in `.env`
2. Build images: `docker compose build`
3. Start services: `docker compose up -d`
4. Apply migrations: Run migration command in chat-app container
5. Monitor logs: `docker compose logs -f`

### CI/CD Integration
- Build images in CI pipeline
- Push to container registry
- Deploy via docker-compose or Kubernetes
- Run database migrations as part of deployment

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Check: `lsof -i :PORT`
   - Solution: Stop conflicting service or change port

2. **Database Connection**
   - Check: `docker compose logs postgres`
   - Solution: Wait for healthcheck, verify credentials

3. **Build Failures**
   - Check: Build logs
   - Solution: Clear cache `docker compose build --no-cache`

4. **Migration Issues**
   - Check: Database schema
   - Solution: Reset database `docker compose down -v`

## Future Enhancements

1. **MCP Gateway**: Centralized routing for multiple MCP servers
2. **Authentication**: JWT-based auth for Chat App
3. **WebSocket Support**: Real-time chat updates
4. **Observability**: Prometheus + Grafana
5. **Cache Layer**: Redis for session/cache
6. **API Gateway**: Unified API entry point
7. **Message Queue**: RabbitMQ/Redis for async processing
8. **Multi-tenancy**: Support multiple organizations
