-- CreateExtension
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
-- Note: Vector dimension (1536) matches OpenAI's text-embedding-ada-002 model
-- If changing embedding models, update this dimension accordingly
CREATE TABLE "Memory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(1536),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Memory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Memory_userId_idx" ON "Memory"("userId");

-- CreateIndex
CREATE INDEX "Memory_createdAt_idx" ON "Memory"("createdAt");

-- CreateIndex (Vector similarity search using HNSW)
-- This improves performance for semantic search queries
CREATE INDEX "Memory_embedding_hnsw_idx" ON "Memory" USING hnsw ("embedding" vector_cosine_ops);

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
