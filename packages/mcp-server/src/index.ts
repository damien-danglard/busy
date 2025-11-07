import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Chat app API base URL (can be configured via environment variable)
const CHAT_APP_URL = process.env.CHAT_APP_URL || 'http://chat-app:3000';

const server = new Server(
  {
    name: 'busy-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Helper function to make authenticated API calls to chat-app
async function callChatAppAPI(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  headers?: Record<string, string>
): Promise<any> {
  const url = `${CHAT_APP_URL}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    let errorData: any = {};
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        errorData = await response.json();
      } catch {
        errorData = {};
      }
    } else {
      // Try to get text body if not JSON
      try {
        errorData.error = await response.text();
      } catch {
        errorData.error = '';
      }
    }
    throw new Error(
      `API call failed: ${response.status} ${response.statusText}` +
      (errorData.error ? ` - ${errorData.error}` : '')
    );
  }

  return response.json();
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_status',
        description: 'Get the current status of the busy assistant',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'execute_task',
        description: 'Execute a task with the busy assistant',
        inputSchema: {
          type: 'object',
          properties: {
            task: {
              type: 'string',
              description: 'The task to execute',
            },
          },
          required: ['task'],
        },
      },
      {
        name: 'store_memory',
        description: 'Store a personal memory for a user. This creates a vector embedding for semantic search. Requires authentication token.',
        inputSchema: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'The memory content to store (max 8000 characters)',
            },
            metadata: {
              type: 'object',
              description: 'Optional metadata (category, tags, etc.)',
            },
            authToken: {
              type: 'string',
              description: 'Authentication token (next-auth session token)',
            },
          },
          required: ['content', 'authToken'],
        },
      },
      {
        name: 'retrieve_memories',
        description: 'Retrieve relevant memories for a user using semantic search. Requires authentication token.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The search query to find relevant memories',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of memories to retrieve (default: 10, max: 100)',
            },
            threshold: {
              type: 'number',
              description: 'Minimum similarity threshold (0.0-1.0, default: 0.7)',
            },
            authToken: {
              type: 'string',
              description: 'Authentication token (next-auth session token)',
            },
          },
          required: ['query', 'authToken'],
        },
      },
      {
        name: 'update_memory',
        description: 'Update an existing memory for a user. Requires authentication token.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The ID of the memory to update',
            },
            content: {
              type: 'string',
              description: 'The new memory content (max 8000 characters)',
            },
            metadata: {
              type: 'object',
              description: 'Optional metadata',
            },
            authToken: {
              type: 'string',
              description: 'Authentication token (next-auth session token)',
            },
          },
          required: ['id', 'content', 'authToken'],
        },
      },
      {
        name: 'delete_memory',
        description: 'Delete a memory for a user. Requires authentication token.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The ID of the memory to delete',
            },
            authToken: {
              type: 'string',
              description: 'Authentication token (next-auth session token)',
            },
          },
          required: ['id', 'authToken'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'get_status':
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: 'running',
              timestamp: new Date().toISOString(),
            }),
          },
        ],
      };

    case 'execute_task':
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              task: args?.task,
              status: 'completed',
              result: 'Task executed successfully',
            }),
          },
        ],
      };

    case 'store_memory':
      try {
        const { content, metadata, authToken } = args as {
          content: string;
          metadata?: Record<string, unknown>;
          authToken: string;
        };

        const result = await callChatAppAPI(
          '/api/memory',
          'POST',
          { content, metadata },
          { Cookie: `next-auth.session-token=${authToken}` }
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                memory: result.memory,
                message: 'Memory stored successfully',
              }),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to store memory',
              }),
            },
          ],
        };
      }

    case 'retrieve_memories':
      try {
        const { query, limit, threshold, authToken } = args as {
          query: string;
          limit?: number;
          threshold?: number;
          authToken: string;
        };

        const params = new URLSearchParams({ query });
        if (limit) params.append('limit', String(limit));
        if (threshold) params.append('threshold', String(threshold));

        const result = await callChatAppAPI(
          `/api/memory?${params.toString()}`,
          'GET',
          undefined,
          { Cookie: `next-auth.session-token=${authToken}` }
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                memories: result.memories,
                count: result.count,
              }),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to retrieve memories',
              }),
            },
          ],
        };
      }

    case 'update_memory':
      try {
        const { id, content, metadata, authToken } = args as {
          id: string;
          content: string;
          metadata?: Record<string, unknown>;
          authToken: string;
        };

        const result = await callChatAppAPI(
          '/api/memory',
          'PUT',
          { id, content, metadata },
          { Cookie: `next-auth.session-token=${authToken}` }
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                memory: result.memory,
                message: 'Memory updated successfully',
              }),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update memory',
              }),
            },
          ],
        };
      }

    case 'delete_memory':
      try {
        const { id, authToken } = args as {
          id: string;
          authToken: string;
        };

        const result = await callChatAppAPI(
          `/api/memory?id=${id}`,
          'DELETE',
          undefined,
          { Cookie: `next-auth.session-token=${authToken}` }
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: result.message || 'Memory deleted successfully',
              }),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete memory',
              }),
            },
          ],
        };
      }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Busy MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});

