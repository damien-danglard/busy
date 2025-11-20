import { StateGraph, MessagesAnnotation, START, END } from '@langchain/langgraph';
import { AzureChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { createMemoryTools } from './langchain';

/**
 * System prompt for the AI assistant
 */
const SYSTEM_PROMPT = `You are a helpful AI assistant with the ability to remember information about users.

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

Be proactive in using these tools to provide a personalized experience.`;

/**
 * Create the LangGraph agent with memory capabilities
 */
export function createLangGraphAgent(userId: string) {
  // Validate userId
  if (typeof userId !== 'string' || userId.trim().length === 0) {
    throw new Error('Invalid userId: must be a non-empty string');
  }

  // Initialize the model
  const model = new AzureChatOpenAI({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_INSTANCE_NAME || 'oaixrpdev001',
    azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o',
    azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
    temperature: 0.7,
  });

  // Create memory tools for the user
  const tools = createMemoryTools(userId);

  // Bind tools to the model
  const modelWithTools = model.bindTools(tools);

  // Create the tool node for executing tools
  const toolNode = new ToolNode(tools);

  /**
   * Function to determine if the agent should continue or end
   */
  function shouldContinue(state: typeof MessagesAnnotation.State) {
    const messages = state.messages;
    const lastMessage = messages[messages.length - 1];

    // If the last message has tool calls, continue to tools
    if ('tool_calls' in lastMessage && Array.isArray(lastMessage.tool_calls) && lastMessage.tool_calls.length > 0) {
      return 'tools';
    }
    // Otherwise, end
    return END;
  }

  /**
   * Call the model with the current state
   */
  async function callModel(state: typeof MessagesAnnotation.State) {
    const messages = state.messages;
    
    // Add system message if not present
    const hasSystemMessage = messages.some(msg => msg._getType() === 'system');
    const messagesToSend = hasSystemMessage 
      ? messages 
      : [new SystemMessage(SYSTEM_PROMPT), ...messages];

    const response = await modelWithTools.invoke(messagesToSend);
    
    // Return the response to add to state
    return { messages: [response] };
  }

  // Create the state graph
  const workflow = new StateGraph(MessagesAnnotation)
    // Add nodes
    .addNode('agent', callModel)
    .addNode('tools', toolNode)
    // Add edges
    .addEdge(START, 'agent')
    .addConditionalEdges('agent', shouldContinue)
    .addEdge('tools', 'agent');

  // Compile the graph
  return workflow.compile();
}

/**
 * Chat with LangGraph agent
 */
export async function chatWithLangGraph(
  messages: Array<{ role: string; content: string }>,
  userId: string
): Promise<string> {
  // Validate userId
  if (typeof userId !== 'string' || userId.trim().length === 0) {
    throw new Error('Invalid userId: must be a non-empty string');
  }

  // Convert messages to LangChain format
  const chatHistory: BaseMessage[] = messages.map((msg) => {
    if (msg.role === 'user') {
      return new HumanMessage(msg.content);
    } else if (msg.role === 'assistant') {
      return new AIMessage(msg.content);
    } else {
      return new SystemMessage(msg.content);
    }
  });

  // Create the agent
  const agent = createLangGraphAgent(userId);

  // Execute the agent
  const result = await agent.invoke({
    messages: chatHistory,
  });

  // Extract the final response
  const finalMessages = result.messages;
  const lastMessage = finalMessages[finalMessages.length - 1];
  
  return lastMessage.content.toString();
}
