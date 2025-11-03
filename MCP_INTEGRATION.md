# Model Context Protocol (MCP) Integration

> **Note**: This is currently a stub implementation. The MCP server provides a basic stdio-based JSON-RPC interface for tool discovery and execution. A full Model Context Protocol SDK implementation can be integrated in the future.

## Overview

This monorepo uses the Model Context Protocol (MCP) to enable communication between different applications and services. The MCP server acts as a central hub for tool discovery and execution.

## Architecture

```
┌─────────────┐         ┌─────────────┐
│  Chat App   │────────▶│ MCP Server  │
└─────────────┘         └─────────────┘
                              ▲
                              │
┌─────────────┐               │
│     n8n     │───────────────┘
└─────────────┘
```

## MCP Server

Located in `packages/mcp-server/`, the MCP server provides:

- **Tool Discovery**: List available tools and their schemas
- **Tool Execution**: Execute tools with typed parameters
- **Standardized Communication**: JSON-RPC based protocol

### Available Tools

1. **get_status**
   - Description: Get the current status of the busy assistant
   - Parameters: None
   - Returns: Status object with timestamp

2. **execute_task**
   - Description: Execute a task with the busy assistant
   - Parameters:
     - `task` (string): The task to execute
   - Returns: Task execution result

### Adding New Tools

To add a new tool to the MCP server:

1. Update the `ListToolsRequestSchema` handler in `packages/mcp-server/src/index.ts`
2. Add the tool definition with name, description, and input schema
3. Implement the tool logic in the `CallToolRequestSchema` handler

Example:

```typescript
// In ListToolsRequestSchema handler
{
  name: 'my_new_tool',
  description: 'Description of what the tool does',
  inputSchema: {
    type: 'object',
    properties: {
      param1: {
        type: 'string',
        description: 'Description of parameter',
      },
    },
    required: ['param1'],
  },
}

// In CallToolRequestSchema handler
case 'my_new_tool':
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          result: 'Tool execution result',
        }),
      },
    ],
  };
```

## MCP Client Integration

### Chat App

The chat app includes an MCP client in `apps/chat-app/src/lib/mcp.ts`:

```typescript
import { getMCPClient, callMCPTool } from '@/lib/mcp';

// Get the MCP client instance
const client = await getMCPClient();

// Call a tool
const result = await callMCPTool('get_status', {});
```

### n8n

n8n can integrate with the MCP server through:

1. **HTTP Request nodes**: Make requests to MCP server endpoints
2. **Custom nodes**: Create custom n8n nodes that communicate with MCP
3. **Webhooks**: Receive events from MCP server

## Transport Mechanisms

The MCP SDK supports multiple transport mechanisms:

### 1. Standard I/O (stdio)
Used by the current MCP server implementation for process-based communication.

### 2. HTTP/SSE (Server-Sent Events)
Can be implemented for web-based communication between services.

### 3. WebSocket
For real-time bidirectional communication.

## Configuration

### MCP Server

The MCP server is configured via environment variables:
- `NODE_ENV`: Environment (development/production)
- Port: 3001 (configurable in docker-compose.yml)

### Clients

Client applications connect to the MCP server using the configured endpoint:
- Development: `http://localhost:3001`
- Production (Docker): `http://mcp-server:3001`

## Security Considerations

1. **Authentication**: Implement authentication for production deployments
2. **Authorization**: Add role-based access control for tools
3. **Input Validation**: Validate all tool inputs using the defined schemas
4. **Rate Limiting**: Implement rate limiting to prevent abuse

## Testing MCP Tools

You can test MCP tools using the SDK's test utilities or by making direct requests:

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

const client = new Client({
  name: 'test-client',
  version: '1.0.0',
}, {
  capabilities: {},
});

// List tools
const tools = await client.request({
  method: 'tools/list',
}, ListToolsRequestSchema);

// Call a tool
const result = await client.request({
  method: 'tools/call',
  params: {
    name: 'get_status',
    arguments: {},
  },
}, CallToolRequestSchema);
```

## Future Enhancements

1. **MCP Gateway**: Implement a gateway for routing between multiple MCP servers
2. **Tool Versioning**: Add versioning support for tools
3. **Async Tools**: Support for long-running tool execution
4. **Tool Streaming**: Stream results for tools that produce incremental output
5. **Tool Composition**: Chain multiple tools together

## Resources

- [MCP SDK Documentation](https://github.com/modelcontextprotocol/sdk)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [Official MCP Servers](https://github.com/modelcontextprotocol/servers)
