import { prisma } from './prisma';
import { Prisma } from '@prisma/client';
import { AzureOpenAIEmbeddings } from '@langchain/openai';

// Lazy initialize embeddings to avoid build-time errors
let embeddings: AzureOpenAIEmbeddings | null = null;

function getEmbeddings(): AzureOpenAIEmbeddings {
  if (!embeddings) {
    if (!process.env.AZURE_OPENAI_API_KEY) {
      throw new Error('AZURE_OPENAI_API_KEY environment variable is required for memory embeddings');
    }
    embeddings = new AzureOpenAIEmbeddings({
      azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
      azureOpenAIApiInstanceName: 'oaixrpdev001',
      azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME || 'text-embedding-3-large',
      azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
    });
  }
  return embeddings;
}

export interface Memory {
  id: string;
  userId: string;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemorySearchResult extends Memory {
  similarity?: number;
}

/**
 * Validate that embedding values are finite numbers
 */
function validateEmbedding(embedding: number[]): void {
  if (!embedding.every(val => Number.isFinite(val))) {
    throw new Error('Invalid embedding: contains non-finite values (NaN or Infinity)');
  }
}

/**
 * Store a new memory with vector embedding
 */
export async function storeMemory(
  userId: string,
  content: string,
  metadata?: Record<string, unknown>
): Promise<Memory> {
  // Generate embedding for the content
  const embedding = await getEmbeddings().embedQuery(content);
  
  // Validate embedding before constructing SQL
  validateEmbedding(embedding);
  // Store in database using Prisma.sql for safe query
  const memory = await prisma.$queryRaw<Memory[]>(
    Prisma.sql`INSERT INTO "Memory" (id, "userId", content, embedding, metadata, "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), ${userId}, ${content}, ${JSON.stringify(embedding)}::vector, ${JSON.stringify(metadata || {})}::jsonb, NOW(), NOW())
     RETURNING id, "userId", content, metadata, "createdAt", "updatedAt"`
  );
  return memory[0];
}

/**
 * Retrieve relevant memories using semantic search
 * @param userId - The user ID to retrieve memories for
 * @param query - The search query text
 * @param limit - Maximum number of memories to return (default: 5)
 * @param similarityThreshold - Minimum cosine similarity score (0.0-1.0) for results (default: 0.7)
 *                              Higher values = more strict matching, lower values = broader results
 */
export async function retrieveMemories(
  userId: string,
  query: string,
  limit: number = 5,
  similarityThreshold: number = 0.7
): Promise<MemorySearchResult[]> {
  // Generate embedding for the query
  const queryEmbedding = await getEmbeddings().embedQuery(query);
  
  // Validate embedding before constructing SQL
  validateEmbedding(queryEmbedding);

  // Perform vector similarity search using Prisma.sql
  const memories = await prisma.$queryRaw<MemorySearchResult[]>(
    Prisma.sql`
    WITH memory_sim AS (
      SELECT 
        id, 
        "userId", 
        content, 
        metadata, 
        "createdAt", 
        "updatedAt",
        1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) as similarity
      FROM "Memory"
      WHERE "userId" = ${userId}
    )
    SELECT *
    FROM memory_sim
    WHERE similarity > ${similarityThreshold}
    ORDER BY similarity DESC
    LIMIT ${limit}
  `
  );

  return memories;
}

/**
 * Update an existing memory
 */
export async function updateMemory(
  memoryId: string,
  userId: string,
  content: string,
  metadata?: Record<string, unknown>
): Promise<Memory | null> {
  // Generate new embedding for updated content
  const embedding = await getEmbeddings().embedQuery(content);
  
  // Validate embedding before constructing SQL
  validateEmbedding(embedding);

  // Update the memory atomically using proper parameterization
  const updated = await prisma.$queryRaw<Memory[]>`
    UPDATE "Memory"
    SET content = ${content},
        embedding = ${embedding}::vector,
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
  const results = await prisma.memory.findMany({
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

  return results.map(r => ({
    ...r,
    metadata: (r.metadata as Record<string, unknown>) || undefined,
  }));
}
