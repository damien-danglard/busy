import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage, SystemMessage } from 'langchain/schema';

export async function chatWithLangChain(messages: Array<{ role: string; content: string }>) {
  const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0.7,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const formattedMessages = messages.map((msg) => {
    if (msg.role === 'user') {
      return new HumanMessage(msg.content);
    } else if (msg.role === 'assistant') {
      return new AIMessage(msg.content);
    } else {
      return new SystemMessage(msg.content);
    }
  });

  const response = await model.invoke(formattedMessages);
  return response.content;
}
