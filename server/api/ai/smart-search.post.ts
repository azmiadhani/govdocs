import { createHash } from 'node:crypto'
import { embedText } from '~/server/utils/embeddings'
import { vectorSearch } from '~/server/utils/vectorSearch'
import { callClaude, buildSmartSearchSystemPrompt } from '~/server/utils/claude'
import { cacheGet, cacheSet } from '~/server/utils/redis'
import { Document } from '~/server/models/Document'

// Public — no auth required. Documents are publicly accessible;
// semantic search over them follows the same policy.

const MAX_QUERY_LENGTH = 500
const TOP_K = 30
const MAX_DOCS = 8
const MAX_CHUNKS_PER_DOC = 3
const CACHE_TTL = 300 // 5 minutes
const SNIPPET_LENGTH = 200

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const rawQuery = String(body?.query ?? '').trim()

  if (!rawQuery) {
    throw createError({ statusCode: 400, message: 'Query tidak boleh kosong' })
  }
  if (rawQuery.length > MAX_QUERY_LENGTH) {
    throw createError({
      statusCode: 400,
      message: `Query terlalu panjang (maksimal ${MAX_QUERY_LENGTH} karakter)`,
    })
  }

  // Deterministic, KEYS-free cache key
  const normalizedQuery = rawQuery.toLowerCase().replace(/\s+/g, ' ')
  const cacheKey = `smart-search:${createHash('sha256').update(normalizedQuery).digest('hex')}`

  const cached = await cacheGet(cacheKey)
  if (cached) return cached

  // 1. Embed query
  const embedding = await embedText(rawQuery)

  // 2. Global vector search — topK=30 across all indexed docs
  const chunks = await vectorSearch({ embedding, topK: TOP_K })

  if (chunks.length === 0) {
    const empty = {
      answer: 'Tidak ditemukan dokumen yang relevan dengan pertanyaan Anda.',
      documents: [],
    }
    await cacheSet(cacheKey, empty, CACHE_TTL)
    return empty
  }

  // 3. Group chunks by documentId
  //    score = 1 - cosine_distance (higher is more similar)
  //    keep top MAX_CHUNKS_PER_DOC chunks per document
  type DocEntry = { chunks: typeof chunks; bestScore: number }
  const docMap = new Map<string, DocEntry>()

  for (const chunk of chunks) {
    const score = 1 - chunk.distance
    const entry = docMap.get(chunk.documentId)
    if (!entry) {
      docMap.set(chunk.documentId, { chunks: [chunk], bestScore: score })
    } else {
      if (score > entry.bestScore) entry.bestScore = score
      if (entry.chunks.length < MAX_CHUNKS_PER_DOC) entry.chunks.push(chunk)
    }
  }

  // Sort documents by best chunk score desc, take top MAX_DOCS
  const sortedEntries = [...docMap.entries()]
    .sort((a, b) => b[1].bestScore - a[1].bestScore)
    .slice(0, MAX_DOCS)

  const topDocIds = sortedEntries.map(([id]) => id)

  // 4. Fetch document metadata (ministry, type, publishedAt) for top docs
  //    One batched query — does not change vectorSearch utility
  const docRecords = await Document.findAll({
    where: { id: topDocIds },
    attributes: ['id', 'title', 'ministry', 'type', 'publishedAt'],
  })
  const docMeta = new Map(docRecords.map((d) => [d.id as string, d]))

  // 5. Build AI context block
  const contextParts: string[] = []
  for (const [, { chunks: docChunks }] of sortedEntries) {
    for (const chunk of docChunks) {
      contextParts.push(
        `Dokumen: ${chunk.documentTitle}\nHalaman: ${chunk.pageNumber ?? '-'}\nKonten: ${chunk.content}`,
      )
    }
  }
  const context = contextParts.join('\n\n---\n\n')

  // 6. AI answer — non-streaming (this is search, not chat)
  const systemPrompt = buildSmartSearchSystemPrompt(context)
  const answer = await callClaude(systemPrompt, rawQuery, 2048)

  // 7. Build structured result with highlight snippets
  const documents = sortedEntries.map(([documentId, { chunks: docChunks, bestScore }]) => {
    const meta = docMeta.get(documentId)
    const year = meta?.publishedAt
      ? new Date(meta.publishedAt as string).getFullYear().toString()
      : null

    const highlights = docChunks.map((chunk) => ({
      chunkId: chunk.id,
      snippet: extractSnippet(chunk.content, SNIPPET_LENGTH),
      pageNumber: chunk.pageNumber,
    }))

    return {
      id: documentId,
      title: docChunks[0].documentTitle,
      ministry: (meta?.ministry as string) ?? '',
      type: (meta?.type as string) ?? '',
      year,
      score: Math.round(bestScore * 1000) / 1000,
      highlights,
    }
  })

  const result = { answer, documents }
  await cacheSet(cacheKey, result, CACHE_TTL)
  return result
})

/**
 * Extract a ~maxLen character snippet from text.
 * Prefers ending at a sentence boundary when possible.
 */
function extractSnippet(text: string, maxLen: number): string {
  const trimmed = text.trim()
  if (trimmed.length <= maxLen) return trimmed

  const slice = trimmed.slice(0, maxLen)
  // Try to end at a clean sentence boundary
  const lastStop = Math.max(
    slice.lastIndexOf('. '),
    slice.lastIndexOf('.\n'),
    slice.lastIndexOf('! '),
    slice.lastIndexOf('? '),
  )
  if (lastStop > maxLen * 0.5) {
    return slice.slice(0, lastStop + 1).trim()
  }
  return slice.trim() + '…'
}
