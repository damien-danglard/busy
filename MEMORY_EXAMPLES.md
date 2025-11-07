# Memory RAG System Examples

This file contains example interactions demonstrating the Personal Memory RAG system.

## Example 1: Storing Personal Preferences

**User**: "Hi! I'm John and I prefer to work in the morning. I'm not a fan of late meetings."

**AI Response**: "Nice to meet you, John! I'll remember your preference for morning work hours and that you don't like late meetings."

**Behind the scenes**:
- AI agent calls `store_memory` tool
- Memory stored: "User's name is John"
- Memory stored: "User prefers working in the morning"
- Memory stored: "User dislikes late meetings"

## Example 2: Recalling Stored Information

**User**: "Can you schedule a meeting for me?"

**AI Response** (after retrieving memories): "Sure! Based on what I know about your preferences, would morning work best for you since you prefer working during morning hours?"

**Behind the scenes**:
- AI agent calls `retrieve_memories` tool with query: "user preferences schedule meeting"
- Retrieves memory about morning preference
- Uses that context in response

## Example 3: Annual Task Reminder

**User**: "I need help with something I do once a year. Every December I need to:
1. Review and archive old project files
2. Update the team roster spreadsheet
3. Send year-end report to management
4. Schedule Q1 planning meeting

Can you remember this for me?"

**AI Response**: "I've stored that annual December task list. Next time you ask about your December tasks, I'll remind you of all these steps!"

**Behind the scenes**:
- AI agent calls `store_memory` tool
- Memory stored: "User performs annual December tasks: 1) Archive old project files, 2) Update team roster spreadsheet, 3) Send year-end report to management, 4) Schedule Q1 planning meeting"

**Next Year**:

**User**: "What do I need to do in December?"

**AI Response**: "Based on your annual December routine, here's your checklist:
1. Review and archive old project files
2. Update the team roster spreadsheet  
3. Send year-end report to management
4. Schedule Q1 planning meeting"

## Example 4: Family Information

**User**: "My wife Sarah's birthday is June 15th, and she loves orchids."

**AI Response**: "I'll remember that Sarah's birthday is June 15th and that she loves orchids!"

**Behind the scenes**:
- Memory stored: "User's wife is named Sarah, birthday on June 15th"
- Memory stored: "Sarah loves orchids"

**Later**:

**User**: "I need gift ideas"

**AI Response** (if asked near June): "Since Sarah's birthday is coming up on June 15th, and I know she loves orchids, perhaps a beautiful orchid plant or an orchid-themed gift would be perfect?"

## Example 5: Work Procedures

**User**: "When I deploy to production, I always forget the steps. Here's what I need to do:
1. Run tests locally: npm test
2. Create a backup: ./scripts/backup.sh
3. Tag the release: git tag v1.x.x
4. Deploy: ./scripts/deploy.sh prod
5. Verify: check healthcheck at /api/health
6. Notify team on #deployments channel"

**AI Response**: "Got it! I've saved your production deployment procedure with all 6 steps."

**6 Months Later**:

**User**: "I need to deploy to production but I can't remember the process"

**AI Response**: "Here's your production deployment procedure:
1. Run tests locally: `npm test`
2. Create a backup: `./scripts/backup.sh`
3. Tag the release: `git tag v1.x.x`
4. Deploy: `./scripts/deploy.sh prod`
5. Verify: check healthcheck at `/api/health`
6. Notify team on #deployments channel"

## API Usage Examples

### Store a Memory via API

```bash
curl -X POST http://localhost:3000/api/memory \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "content": "User prefers TypeScript over JavaScript for all new projects",
    "metadata": {"category": "preferences", "topic": "programming"}
  }'
```

### Search Memories via API

```bash
curl "http://localhost:3000/api/memory?query=programming+preferences&limit=5" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

### Update a Memory via API

```bash
curl -X PUT http://localhost:3000/api/memory \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "id": "memory-uuid",
    "content": "User strongly prefers TypeScript over JavaScript for all projects",
    "metadata": {"category": "preferences", "topic": "programming", "updated": true}
  }'
```

### Delete a Memory via API

```bash
curl -X DELETE "http://localhost:3000/api/memory?id=memory-uuid" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

## Testing Semantic Search

The semantic search uses vector similarity, so related concepts are found even with different wording:

**Stored Memory**: "User enjoys playing acoustic guitar on weekends"

**Query**: "What does the user do for hobbies?"
**Result**: ✅ Found (high similarity score)

**Query**: "musical instruments" 
**Result**: ✅ Found (moderate similarity score)

**Query**: "weekend activities"
**Result**: ✅ Found (moderate similarity score)

**Query**: "cooking recipes"
**Result**: ❌ Not found (low similarity score)

## Best Practices Demonstrated

1. **Clear Reformulation**: The AI reformulates user statements into clear, factual memories
2. **Third-Person Perspective**: Memories use "User..." format for consistency
3. **Specific Details**: Important details (dates, names, steps) are preserved
4. **Semantic Context**: Related information can be retrieved with various queries
5. **Privacy Respect**: Each user only accesses their own memories

## Notes

- Memories are automatically created by the AI agent when it detects important information
- Users can also explicitly ask the AI to remember something
- The semantic search allows flexible querying with natural language
- Similarity threshold (default 0.7) filters out irrelevant memories
- All operations are user-scoped and require authentication
