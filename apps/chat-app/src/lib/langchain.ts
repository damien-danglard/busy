import { AzureChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { storeMemory, retrieveMemories } from './memory';

/**
 * Create memory tools for the agent
 */
export function createMemoryTools(userId: string) {
  const storeMemoryTool = new DynamicStructuredTool({
    name: 'store_memory',
    description: `Store an important piece of information about the user for future reference. 
Use this when the user shares personal information, preferences, goals, important dates, 
or anything they might want you to remember in future conversations. 
Always reformulate the information in a clear, concise way that will be useful later.
Example: If user says "I love playing guitar on weekends", store as "User enjoys playing guitar as a weekend hobby".`,
    schema: z.object({
      content: z.string().describe('The information to remember, reformulated clearly'),
      category: z.string().optional().describe('Optional category like "personal", "work", "preferences", etc.'),
    }),
    func: async ({ content, category }) => {
      try {
        const metadata = category ? { category } : undefined;
        await storeMemory(userId, content, metadata);
        return `Memory stored successfully: "${content}"`;
      } catch (error) {
        console.error('Error storing memory:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return `Failed to store memory: ${errorMessage}`;
      }
    },
  });

  const retrieveMemoriesTool = new DynamicStructuredTool({
    name: 'retrieve_memories',
    description: `Search for relevant memories about the user based on the current conversation context.
Use this when you need to recall information about the user to provide personalized responses.
This performs semantic search to find the most relevant memories.`,
    schema: z.object({
      query: z.string().describe('What to search for in the memories'),
      limit: z.number().optional().describe('Maximum number of memories to retrieve'),
    }),
    func: async ({ query, limit = 5 }) => {
      try {
        const memories = await retrieveMemories(userId, query, limit);
        if (memories.length === 0) {
          return 'No relevant memories found.';
        }
        const memoryTexts = memories.map((m, i) => 
          `${i + 1}. ${m.content} (similarity: ${((m.similarity ?? 0) * 100).toFixed(1)}%)`
        ).join('\n');
        return `Found ${memories.length} relevant memories:\n${memoryTexts}`;
      } catch (error) {
        console.error('Error retrieving memories:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return `Failed to retrieve memories: ${errorMessage}`;
      }
    },
  });

  return [storeMemoryTool, retrieveMemoriesTool];
}

/**
 * Chat with LangChain using an agent that has access to memory tools
 */
export async function chatWithLangChain(
  messages: Array<{ role: string; content: string }>,
  userId: string
) {
  // Validate userId
  if (typeof userId !== 'string' || userId.trim().length === 0) {
    throw new Error('Invalid userId: must be a non-empty string');
  }
  const model = new AzureChatOpenAI({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_INSTANCE_NAME || 'oaixrpdev001',
    azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o',
    azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
    temperature: 0.7,
  });

  const tools = createMemoryTools(userId);

  // Convert messages to chat history
  const chatHistory = messages.map((msg) => {
    if (msg.role === 'user') {
      return new HumanMessage(msg.content);
    } else if (msg.role === 'assistant') {
      return new AIMessage(msg.content);
    } else {
      return new SystemMessage(msg.content);
    }
  });

  // Add system message at the beginning
  const systemMessage = new SystemMessage(`You are a helpful AI assistant with the ability to remember information about users.

IMPORTANT CAPABILITIES:
- You can store important information about users using the "store_memory" tool
- You can recall relevant information using the "retrieve_memories" tool
- Always check memories when answering questions that might benefit from personalized context

WHEN TO STORE MEMORIES:
- Personal information (name, preferences, hobbies, family)
- Work-related information (job, projects, colleagues)
- Goals and aspirations
- Important dates or events
- Recurring tasks or procedures
- Anything the user explicitly asks you to remember

HOW TO STORE MEMORIES:
- Reformulate information clearly and concisely
- Use third-person perspective (e.g., "User prefers..." instead of "I prefer...")
- Extract the key information without unnecessary context
- Store each distinct piece of information separately

WHEN TO RETRIEVE MEMORIES:
- At the start of conversations to understand user context
- When answering questions that could benefit from personal context
- When user asks about something they mentioned before

Be proactive in using these tools to provide a personalized experience.`);

  const allMessages = [systemMessage, ...chatHistory];

  // Execute the model
  const result = await model.invoke(allMessages);

  return result.content.toString();
}
