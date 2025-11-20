# Personal Memory RAG Implementation - Deployment Guide

## Summary

This PR adds a Personal Memory RAG (Retrieval-Augmented Generation) system to the Busy chat application. The AI assistant can now automatically remember and recall user-specific information across conversations using vector embeddings and semantic search.

## Files Changed

### Core Implementation (7 files)
1. `apps/chat-app/prisma/schema.prisma` - Added Memory model
2. `apps/chat-app/prisma/migrations/20250107000000_add_memory_rag/migration.sql` - Database migration
3. `apps/chat-app/src/lib/memory.ts` - Memory service with CRUD operations
4. `apps/chat-app/src/lib/langchain.ts` - Enhanced with OpenAI Functions Agent and memory tools
5. `apps/chat-app/src/app/api/memory/route.ts` - REST API for memory operations
6. `apps/chat-app/src/app/api/chat/route.ts` - Updated to pass userId to agent
7. `packages/mcp-server/src/index.ts` - Added memory tool definitions

### Configuration (3 files)
8. `docker-compose.yml` - Updated PostgreSQL to pgvector/pgvector:pg16
9. `apps/chat-app/package.json` - Added @langchain/core, updated Next.js to 14.2.25
10. `.gitignore` - Updated to include migrations

### Documentation (3 files)
11. `README.md` - Updated with memory features
12. `MEMORY_RAG.md` - Complete feature documentation
13. `MEMORY_EXAMPLES.md` - Usage examples

## Pre-Deployment Checklist

### 1. Environment Variables
Ensure `.env` file has:
```bash
OPENAI_API_KEY=your-actual-openai-key
NEXTAUTH_SECRET=your-secure-secret
```

### 2. Database
- PostgreSQL with pgvector extension
- The Docker image handles this automatically
- For manual setup: `CREATE EXTENSION IF NOT EXISTS vector;`

### 3. Dependencies
```bash
cd apps/chat-app
npm install  # Installs @langchain/core and updated Next.js
```

## Deployment Steps

### Option 1: Docker Compose (Recommended)

```bash
# 1. Stop existing containers
docker compose down

# 2. Remove old volumes (if needed for clean state)
docker compose down -v

# 3. Build and start services
docker compose up --build

# 4. Verify migration ran successfully
docker logs busy-migration

# 5. Verify pgvector is installed
docker exec busy-postgres psql -U busy -d busy_db -c "SELECT * FROM pg_extension WHERE extname='vector';"
```

### Option 2: Manual Deployment

```bash
# 1. Install dependencies
npm install

# 2. Apply database migration
cd apps/chat-app
npx prisma migrate deploy

# 3. Generate Prisma client
npx prisma generate

# 4. Start services
npm run dev
```

## Post-Deployment Verification

### 1. Check Database Schema
```bash
docker exec busy-postgres psql -U busy -d busy_db -c "\d \"Memory\""
```

Expected output: Table with columns: id, userId, content, embedding, metadata, createdAt, updatedAt

### 2. Test Memory API
```bash
# Login first at http://localhost:3000
# Then test storing a memory
curl -X POST http://localhost:3000/api/memory \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  -d '{"content": "User loves TypeScript"}'
```

### 3. Test Chat Integration
1. Login at http://localhost:3000
2. Send message: "Hi! I'm a software engineer and I love TypeScript"
3. Wait for AI response (should acknowledge storing memory)
4. Send message: "What programming languages do I like?"
5. AI should recall TypeScript preference

### 4. Check Logs
```bash
# Chat app logs
docker logs busy-chat-app

# PostgreSQL logs
docker logs busy-postgres

# MCP server logs
docker logs busy-mcp-server
```

## Troubleshooting

### Issue: "Extension vector not found"
**Solution**: Verify using correct PostgreSQL image
```bash
docker exec busy-postgres psql -U busy -d busy_db -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### Issue: "OpenAI API Error"
**Solution**: Check OPENAI_API_KEY in .env
```bash
docker exec busy-chat-app printenv | grep OPENAI
```

### Issue: Migration fails
**Solution**: Reset database and rerun migration
```bash
docker compose down -v
docker compose up
```

### Issue: "Cannot find module @langchain/core"
**Solution**: Reinstall dependencies
```bash
cd apps/chat-app
rm -rf node_modules package-lock.json
npm install
```

## Rollback Procedure

If issues occur, rollback with:

```bash
# 1. Checkout previous commit
git checkout 6282931

# 2. Rebuild containers
docker compose down -v
docker compose up --build
```

Or just remove the Memory table:
```sql
DROP TABLE "Memory";
```

## Performance Considerations

1. **Embedding Generation**: Each memory storage/retrieval calls OpenAI API
   - Cost: ~$0.0001 per 1K tokens
   - Latency: ~200-500ms per call

2. **Vector Search**: PostgreSQL pgvector is efficient for small-medium datasets
   - Up to 100K memories: Fast (< 100ms)
   - 100K-1M memories: Consider adding HNSW index
   - 1M+ memories: Consider specialized vector database

3. **Agent Execution**: OpenAI Functions Agent adds overhead
   - Each tool call is a separate API request
   - May take 2-5 seconds for complex queries

## Monitoring

Key metrics to monitor:
- Memory table size: `SELECT COUNT(*) FROM "Memory";`
- Average similarity scores: Check if memories are being retrieved effectively
- OpenAI API costs: Track embedding API usage
- Response times: Monitor chat API latency

## Security Notes

✅ **Implemented**:
- User-scoped memories (cannot access other users' data)
- Authentication required for all operations
- Input validation on API endpoints
- Next.js updated to 14.2.25 (security patches)
- SQL injection protection via Prisma parameterized queries

⚠️ **Consider for Production**:
- Encrypt memory content at rest
- Implement rate limiting on memory operations
- Add audit logging for memory access
- Set up memory retention/deletion policies
- Monitor for prompt injection attempts

## Support & Documentation

- Full documentation: `MEMORY_RAG.md`
- Usage examples: `MEMORY_EXAMPLES.md`
- Architecture: `ARCHITECTURE.md`

## Success Criteria

✅ Feature is working correctly when:
1. Users can chat with the AI assistant
2. AI automatically stores important information
3. AI recalls stored information in subsequent conversations
4. Memory API endpoints return 200 status codes
5. No errors in application logs
6. Vector embeddings are being generated and stored

## Next Steps (Optional Enhancements)

Future improvements could include:
- Memory management UI for users
- Memory categories and tagging
- Memory expiration policies
- Memory export/import
- Memory sharing between team members
- Multi-modal memories (images, files)
- Memory conflict resolution
- Memory analytics dashboard

---

**Implementation Date**: 2025-01-07
**Status**: Ready for Deployment ✅
**Risk Level**: Low (additive feature, no breaking changes)
