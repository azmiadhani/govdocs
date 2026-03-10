import { getSequelize } from '../models'
import type { ChunkSearchResult } from '~/types'

interface VectorSearchOptions {
  embedding: number[]
  documentIds?: string[] | null
  topK?: number
}

export async function vectorSearch({
  embedding,
  documentIds,
  topK = 6,
}: VectorSearchOptions): Promise<ChunkSearchResult[]> {
  const sequelize = getSequelize()

  // pgvector expects the literal format: '[0.1,0.2,...]'
  const vectorLiteral = `[${embedding.join(',')}]`

  const whereClause =
    documentIds && documentIds.length > 0
      ? `AND dc.document_id = ANY(ARRAY[:documentIds]::uuid[])`
      : ''

  const [chunks] = await sequelize.query(
    `
    SELECT
      dc.id,
      dc.content,
      dc.page_number AS "pageNumber",
      dc.chunk_index AS "chunkIndex",
      dc.document_id AS "documentId",
      d.title AS "documentTitle",
      (dc.embedding <=> :vector::vector) AS distance
    FROM document_chunks dc
    JOIN documents d ON d.id = dc.document_id
    WHERE d.status = 'indexed'
    ${whereClause}
    ORDER BY distance ASC
    LIMIT :topK
    `,
    {
      replacements: { vector: vectorLiteral, documentIds: documentIds ?? [], topK },
    }
  )

  return chunks as ChunkSearchResult[]
}
