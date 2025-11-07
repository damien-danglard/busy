# Personal Memory RAG System

This document describes the Personal Memory RAG (Retrieval-Augmented Generation) system implemented in the Busy chat application.

## Overview

The Personal Memory RAG system allows the AI assistant to automatically remember and recall user-specific information across conversations. This provides a personalized experience where the assistant "knows" the user and can reference previously shared information.

## Features

- **Automatic Memory Storage**: The AI agent can autonomously decide when to store important information
- **Semantic Search**: Memories are stored with vector embeddings for intelligent retrieval
- **User-Scoped**: Each user has their own private memory space
- **Conversational Context**: Relevant memories are automatically retrieved during conversations

## Architecture

### Components

1. **Database Layer** (`Memory` model in Prisma)
   - Stores memory content and vector embeddings
   - Uses PostgreSQL with pgvector extension
   - User-scoped with foreign key to User model

2. **Memory Service** (`src/lib/memory.ts`)
   - `storeMemory()`: Create new memories with embeddings
   - `retrieveMemories()`: Semantic search using vector similarity
   - `updateMemory()`: Update existing memories
   - `deleteMemory()`: Remove memories
   - `listMemories()`: List all user memories

3. **API Endpoints** (`/api/memory`)
   - POST: Store new memory
   - GET: List or search memories
   - PUT: Update memory
   - DELETE: Remove memory

4. **LangChain Agent Tools** (`src/lib/langchain.ts`)
   - `store_memory`: Tool for agent to save information
   - `retrieve_memories`: Tool for agent to search memories
   - Integrated with OpenAI Functions Agent

## Usage

### For Users

The memory system works automatically during chat conversations:

1. **Storing Information**: When you share important information (preferences, goals, tasks, etc.), the AI will automatically decide to remember it.
   
   Example:
   ```
   User: "I love playing guitar on weekends"
   AI: [Automatically stores memory: "User enjoys playing guitar as a weekend hobby"]
   ```

2. **Recalling Information**: The AI automatically retrieves relevant memories when needed.
   
   Example:
   ```
   User: "What should I do this weekend?"
   AI: [Retrieves memory about guitar hobby and suggests related activities]
   ```

3. **Explicit Requests**: You can explicitly ask the AI to remember something.
   
   Example:
   ```
   User: "Remember that I need to water the plants every Monday"
   AI: [Stores as memory and confirms]
   ```

### For Developers

#### Storing Memories Programmatically

```typescript
import { storeMemory } from '@/lib/memory';

const memory = await storeMemory(
  userId,
  'User prefers dark mode',
  { category: 'preferences' }
);
```

#### Searching Memories

```typescript
import { retrieveMemories } from '@/lib/memory';

const memories = await retrieveMemories(
  userId,
  'What are the user preferences?',
  5,  // limit
  0.7 // similarity threshold
);
```

#### Using the API

**Store a memory:**
```bash
curl -X POST http://localhost:3000/api/memory \
  -H "Content-Type: application/json" \
  -d '{
    "content": "User prefers email notifications",
    "metadata": {"category": "preferences"}
  }'
```

**Search memories:**
```bash
curl "http://localhost:3000/api/memory?query=notifications&limit=5"
```

## Configuration

### Environment Variables

The memory system uses the OpenAI API for embeddings:

```bash
OPENAI_API_KEY=your-openai-api-key
```

### Database Setup

The system requires PostgreSQL with the pgvector extension:

1. **Docker Setup** (Automatic):
   ```bash
   docker compose up
   ```
   The `pgvector/pgvector:pg16` image includes the extension.

2. **Manual Setup**:
   ```sql
   CREATE EXTENSION vector;
   ```

3. **Run Migrations**:
   ```bash
   cd apps/chat-app
   npx prisma migrate deploy
   ```

## How It Works

### Memory Storage Flow

1. User shares information in chat
2. LangChain agent evaluates if information should be remembered
3. Agent calls `store_memory` tool
4. Content is reformulated for clarity
5. OpenAI generates embedding (1536-dimensional vector)
6. Memory stored in PostgreSQL with embedding

### Memory Retrieval Flow

1. User asks a question
2. Agent calls `retrieve_memories` tool with query
3. Query is converted to embedding
4. Vector similarity search finds relevant memories
5. Top matches returned to agent
6. Agent uses memories to provide personalized response

### Vector Similarity

Memories are retrieved using cosine similarity:
- Similarity score: 0.0 (unrelated) to 1.0 (identical)
- Default threshold: 0.7 (fairly similar)
- Uses pgvector's `<=>` operator for efficient search

## Best Practices

### What to Remember

✅ **Good candidates for memory:**
- Personal preferences (themes, notification settings)
- Work information (job title, projects, colleagues)
- Goals and aspirations
- Recurring tasks and procedures
- Important dates and events
- User's interests and hobbies

❌ **What NOT to remember:**
- Sensitive information (passwords, credit cards)
- Temporary conversation context
- Generic facts that apply to everyone
- Information the user wants to forget

### Memory Formatting

When storing memories, reformulate them clearly:

❌ Bad: "I think I prefer dark mode, maybe"
✅ Good: "User prefers dark mode interface"

❌ Bad: "So I work at this company doing stuff"
✅ Good: "User works as Software Engineer at TechCorp"

## Limitations

1. **Embedding Cost**: Each memory storage/retrieval requires OpenAI API call
2. **Vector Dimension**: Fixed at 1536 dimensions (OpenAI's text-embedding-3-small)
3. **Search Scope**: Only searches within user's own memories
4. **No Automatic Cleanup**: Old memories persist until manually deleted

## Security & Privacy

- ✅ Memories are user-scoped (cannot access other users' memories)
- ✅ Authentication required for all memory operations
- ✅ Memories deleted when user account is deleted (CASCADE)
- ⚠️ Memories stored in plaintext in database
- ⚠️ Admin can access database and see memories

For production, consider:
- Encrypting memory content at rest
- Implementing memory retention policies
- Adding audit logs for memory access

## Troubleshooting

### "pgvector extension not found"

Ensure PostgreSQL has pgvector installed:
```bash
docker compose down -v
docker compose up  # Uses pgvector/pgvector image
```

### "Embedding failed"

Check OpenAI API key:
```bash
echo $OPENAI_API_KEY
```

### "No memories found"

- Check similarity threshold (lower it for broader results)
- Verify user has stored memories
- Check embedding model compatibility

## Future Enhancements

Potential improvements:

1. **Memory Categories**: Better organization with tags/categories
2. **Memory Expiration**: Auto-delete old or irrelevant memories
3. **Memory Merge**: Combine similar memories
4. **Privacy Controls**: User-controlled memory management UI
5. **Multi-modal**: Support images, files in memories
6. **Cross-user**: Shared team memories (with permissions)

## Examples

### Example Use Case 1: Annual Task Reminder

**User**: "Once a year I need to renew my SSL certificates. I always forget the exact steps. Here's what I do: 1) Generate CSR on the server, 2) Submit to LetsEncrypt, 3) Install the new cert, 4) Email IT team to verify."

**AI**: [Stores memory: "User performs annual SSL certificate renewal: 1) Generate CSR, 2) Submit to LetsEncrypt, 3) Install certificate, 4) Notify IT team"]

**Next Year**:

**User**: "How do I renew my SSL certificate again?"

**AI**: [Retrieves memory and provides step-by-step instructions]

### Example Use Case 2: Personal Preferences

**User**: "I prefer to receive notifications via email, not SMS"

**AI**: [Stores memory: "User prefers email notifications over SMS"]

**Later**:

**User**: "Set up notifications for project updates"

**AI**: "I'll set up email notifications for project updates, since I know you prefer email over SMS."

## API Reference

See [API_REFERENCE.md](./API_REFERENCE.md) for complete API documentation.

## License

This feature is part of the Busy project, licensed under MIT License.
