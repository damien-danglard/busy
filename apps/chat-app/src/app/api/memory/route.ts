import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storeMemory, retrieveMemories, updateMemory, deleteMemory, listMemories } from '@/lib/memory';

/**
 * POST /api/memory - Store a new memory
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { content, metadata } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string' },
        { status: 400 }
      );
    }
    // Enforce maximum content length (e.g., 8000 characters)
    if (content.length > 8000) {
      return NextResponse.json(
        { error: 'Content must not exceed 8000 characters' },
        { status: 400 }
      );
    }

    const memory = await storeMemory(session.user.id, content, metadata);

    return NextResponse.json({
      success: true,
      memory: {
        id: memory.id,
        content: memory.content,
        metadata: memory.metadata,
        createdAt: memory.createdAt,
      },
    });
  } catch (error) {
    console.error('Memory store error:', error);
    return NextResponse.json(
      { error: 'Failed to store memory' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/memory - List or search memories
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10')));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'));
    
    // Validate similarity threshold (must be between 0.0 and 1.0)
    const thresholdParam = parseFloat(searchParams.get('threshold') || '0.7');
    const similarityThreshold = Math.max(0.0, Math.min(1.0, isNaN(thresholdParam) ? 0.7 : thresholdParam));

    let memories;

    if (query) {
      // Semantic search
      memories = await retrieveMemories(
        session.user.id,
        query,
        limit,
        similarityThreshold
      );
    } else {
      // List all memories
      memories = await listMemories(session.user.id, limit, offset);
    }

    return NextResponse.json({
      success: true,
      memories,
      count: memories.length,
    });
  } catch (error) {
    console.error('Memory retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve memories' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/memory - Update an existing memory
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id, content, metadata } = await request.json();

    if (!id || !content) {
      return NextResponse.json(
        { error: 'Memory ID and content are required' },
        { status: 400 }
      );
    }

    const memory = await updateMemory(id, session.user.id, content, metadata);

    if (!memory) {
      return NextResponse.json(
        { error: 'Memory not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      memory: {
        id: memory.id,
        content: memory.content,
        metadata: memory.metadata,
        updatedAt: memory.updatedAt,
      },
    });
  } catch (error) {
    console.error('Memory update error:', error);
    return NextResponse.json(
      { error: 'Failed to update memory' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/memory - Delete a memory
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Memory ID is required' },
        { status: 400 }
      );
    }

    const success = await deleteMemory(id, session.user.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Memory not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Memory deleted successfully',
    });
  } catch (error) {
    console.error('Memory delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete memory' },
      { status: 500 }
    );
  }
}
