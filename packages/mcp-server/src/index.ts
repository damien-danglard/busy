import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

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
        description: 'Store a personal memory for a user. This creates a vector embedding for semantic search.',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'The user ID to store the memory for',
            },
            content: {
              type: 'string',
              description: 'The memory content to store',
            },
            metadata: {
              type: 'object',
              description: 'Optional metadata (category, tags, etc.)',
            },
          },
          required: ['userId', 'content'],
        },
      },
      {
        name: 'retrieve_memories',
        description: 'Retrieve relevant memories for a user using semantic search',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'The user ID to retrieve memories for',
            },
            query: {
              type: 'string',
              description: 'The search query to find relevant memories',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of memories to retrieve (default: 5)',
            },
          },
          required: ['userId', 'query'],
        },
      },
      {
        name: 'update_memory',
        description: 'Update an existing memory for a user',
        inputSchema: {
          type: 'object',
          properties: {
            memoryId: {
              type: 'string',
              description: 'The ID of the memory to update',
            },
            userId: {
              type: 'string',
              description: 'The user ID (for authorization)',
            },
            content: {
              type: 'string',
              description: 'The new memory content',
            },
            metadata: {
              type: 'object',
              description: 'Optional metadata',
            },
          },
          required: ['memoryId', 'userId', 'content'],
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
    case 'retrieve_memories':
    case 'update_memory':
      // These tools proxy to the chat-app API
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              tool: name,
              message: 'Memory tools are available via the chat-app API at /api/memory',
              note: 'Call the chat-app API directly for memory operations',
              args,
            }),
          },
        ],
      };

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

