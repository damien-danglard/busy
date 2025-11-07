import { prisma } from './prisma';
import { OpenAIEmbeddings } from '@langchain/openai';

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'text-embedding-ada-002',
});

export interface Memory {
  id: string;
  userId: string;
  content: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemorySearchResult extends Memory {
  similarity?: number;
}

/**
 * Store a new memory with vector embedding
 */
export async function storeMemory(
  userId: string,
  content: string,
  metadata?: any
): Promise<Memory> {
  // Generate embedding for the content
  const embedding = await embeddings.embedQuery(content);
  const embeddingString = `[${embedding.join(',')}]`;

  // Store in database
  const memory = await prisma.$queryRaw<Memory[]>`
    INSERT INTO "Memory" (id, "userId", content, embedding, metadata, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), ${userId}, ${content}, ${embeddingString}::vector, ${JSON.stringify(metadata || {})}::jsonb, NOW(), NOW())
    RETURNING id, "userId", content, metadata, "createdAt", "updatedAt"
  `;

  return memory[0];
}

/**
 * Retrieve relevant memories using semantic search
 */
export async function retrieveMemories(
  userId: string,
  query: string,
  limit: number = 5,
  similarityThreshold: number = 0.7
): Promise<MemorySearchResult[]> {
  // Generate embedding for the query
  const queryEmbedding = await embeddings.embedQuery(query);
  const embeddingString = `[${queryEmbedding.join(',')}]`;

  // Perform vector similarity search
  const memories = await prisma.$queryRaw<MemorySearchResult[]>`
    SELECT 
      id, 
      "userId", 
      content, 
      metadata, 
      "createdAt", 
      "updatedAt",
      1 - (embedding <=> ${embeddingString}::vector) as similarity
    FROM "Memory"
    WHERE "userId" = ${userId}
    AND 1 - (embedding <=> ${embeddingString}::vector) > ${similarityThreshold}
    ORDER BY embedding <=> ${embeddingString}::vector
    LIMIT ${limit}
  `;

  return memories;
}

/**
 * Update an existing memory
 */
export async function updateMemory(
  memoryId: string,
  userId: string,
  content: string,
  metadata?: any
): Promise<Memory | null> {
  // Verify the memory belongs to the user
  const existing = await prisma.memory.findFirst({
    where: { id: memoryId, userId },
  });

  if (!existing) {
    return null;
  }

  // Generate new embedding for updated content
  const embedding = await embeddings.embedQuery(content);
  const embeddingString = `[${embedding.join(',')}]`;

  // Update the memory
  const updated = await prisma.$queryRaw<Memory[]>`
    UPDATE "Memory"
    SET content = ${content},
        embedding = ${embeddingString}::vector,
        metadata = ${JSON.stringify(metadata || {})}::jsonb,
        "updatedAt" = NOW()
    WHERE id = ${memoryId} AND "userId" = ${userId}
    RETURNING id, "userId", content, metadata, "createdAt", "updatedAt"
  `;

  return updated[0] || null;
}

/**
 * Delete a memory
 */
export async function deleteMemory(
  memoryId: string,
  userId: string
): Promise<boolean> {
  const result = await prisma.memory.deleteMany({
    where: { id: memoryId, userId },
  });

  return result.count > 0;
}

/**
 * List all memories for a user (without similarity scoring)
 */
export async function listMemories(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Memory[]> {
  return prisma.memory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
    select: {
      id: true,
      userId: true,
      content: true,
      metadata: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
