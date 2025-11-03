// Simple MCP Server stub implementation
// This is a placeholder for future MCP integration

interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

const tools: Tool[] = [
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
];

function handleToolCall(name: string, args: Record<string, unknown>) {
  switch (name) {
    case 'get_status':
      return {
        status: 'running',
        timestamp: new Date().toISOString(),
      };

    case 'execute_task':
      return {
        task: args?.task,
        status: 'completed',
        result: 'Task executed successfully',
      };

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// Simple stdio-based server
process.stdin.setEncoding('utf8');

let buffer = '';

process.stdin.on('data', (chunk: string) => {
  buffer += chunk;
  
  const lines = buffer.split('\n');
  buffer = lines.pop() || '';
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    try {
      const request = JSON.parse(line);
      let response;
      
      if (request.method === 'tools/list') {
        response = { tools };
      } else if (request.method === 'tools/call') {
        const result = handleToolCall(request.params.name, request.params.arguments || {});
        response = { result };
      } else {
        response = { error: 'Unknown method' };
      }
      
      console.log(JSON.stringify(response));
    } catch (error) {
      console.error('Error processing request:', error);
    }
  }
});

console.error('Busy MCP Server running on stdio');

