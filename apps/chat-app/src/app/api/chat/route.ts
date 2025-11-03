import { NextRequest, NextResponse } from 'next/server';
import { chatWithLangChain } from '@/lib/langchain';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Get response from LangChain
    const response = await chatWithLangChain(messages);

    // Store messages in database
    await prisma.message.create({
      data: {
        content: messages[messages.length - 1].content,
        role: 'user',
      },
    });

    await prisma.message.create({
      data: {
        content: response as string,
        role: 'assistant',
      },
    });

    return NextResponse.json({ 
      message: response,
      success: true 
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
