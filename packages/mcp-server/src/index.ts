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
