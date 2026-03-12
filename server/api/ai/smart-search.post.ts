import { createHash } from 'node:crypto'
import { embedText } from '~/server/utils/embeddings'
import { vectorSearch } from '~/server/utils/vectorSearch'
import { callClaude, buildSmartSearchSystemPrompt } from '~/server/utils/claude'
import { cacheGet, cacheSet } from '~/server/utils/redis'
import { Document } from '~/server/models/Document'
import { getSequelize } from '~/server/models'
import type { ChunkSearchResult } from '~/types'

// Public — no auth required (documents are publicly accessible).

const MAX_QUERY_LENGTH = 500
const TOP_K_VECTOR = 30
const TOP_K_KEYWORD = 20
const MAX_DOCS = 8
const MAX_CHUNKS_PER_DOC = 3
const CACHE_TTL = 300 // 5 minutes
const SNIPPET_MAX_LEN = 300

// Additive score boosts applied on top of vector similarity for keyword hits
const BOOST_TITLE = 0.25
const BOOST_CONTENT = 0.15

// Common Indonesian stopwords — excluded from keyword search patterns
const STOPWORDS = new Set([
  'dan', 'yang', 'untuk', 'dengan', 'dalam', 'atau', 'dari', 'tidak',
  'ini', 'itu', 'ada', 'adalah', 'pada', 'oleh', 'juga', 'akan',
  'atas', 'bagi', 'telah', 'bahwa', 'serta', 'dapat', 'lebih',
])

// ─── Types ───────────────────────────────────────────────────────────────────

interface RankedChunk {
  chunk: ChunkSearchResult
  finalScore: number
  matchType: 'vector' | 'keyword' | 'hybrid'
}

interface DocEntry {
  chunks: RankedChunk[]
  bestScore: number
  totalChunks: number
}

// ─── Handler ─────────────────────────────────────────────────────────────────

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

  const normalizedQuery = rawQuery.toLowerCase().replace(/\s+/g, ' ')
  const cacheKey = `smart-search:${createHash('sha256').update(normalizedQuery).digest('hex')}`

  const cached = await cacheGet(cacheKey)
  if (cached) return cached

  // ── Step 1: Embed query ───────────────────────────────────────────────────
  const queryEmbedding = await embedText(rawQuery)

  // ── Step 2: Hybrid retrieval — vector + keyword in parallel ──────────────
  const [vectorChunks, keywordChunks] = await Promise.all([
    vectorSearch({ embedding: queryEmbedding, topK: TOP_K_VECTOR }),
    keywordSearch(normalizedQuery, TOP_K_KEYWORD),
  ])

  // ── Step 3: Merge with hybrid scoring ────────────────────────────────────
  const merged = mergeResults(vectorChunks, keywordChunks)

  if (merged.size === 0) {
    const empty = {
      answer: 'Tidak ditemukan dokumen yang relevan dengan pertanyaan Anda.',
      documents: [],
      confidence: { supportingChunks: 0, topScore: 0, rerankScore: 0 },
    }
    await cacheSet(cacheKey, empty, CACHE_TTL)
    return empty
  }

  // ── Step 4: Group by document, rank, take top MAX_DOCS ───────────────────
  const docMap = new Map<string, DocEntry>()

  for (const ranked of merged.values()) {
    const docId = ranked.chunk.documentId
    const entry = docMap.get(docId)
    if (!entry) {
      docMap.set(docId, {
        chunks: [ranked],
        bestScore: ranked.finalScore,
        totalChunks: 1,
      })
    } else {
      entry.totalChunks++
      if (ranked.finalScore > entry.bestScore) entry.bestScore = ranked.finalScore
      if (entry.chunks.length < MAX_CHUNKS_PER_DOC) entry.chunks.push(ranked)
    }
  }

  const sortedEntries = [...docMap.entries()]
    .sort((a, b) => b[1].bestScore - a[1].bestScore)
    .slice(0, MAX_DOCS)

  const topDocIds = sortedEntries.map(([id]) => id)

  // ── Step 5: Fetch document metadata (batched) ─────────────────────────────
  const docRecords = await Document.findAll({
    where: { id: topDocIds },
    attributes: ['id', 'title', 'ministry', 'type', 'publishedAt'],
  })
  const docMeta = new Map(docRecords.map((d) => [d.id as string, d]))

  // ── Step 6: Build AI context block ───────────────────────────────────────
  const contextParts: string[] = []
  for (const [, { chunks }] of sortedEntries) {
    for (const { chunk } of chunks) {
      contextParts.push(
        `Dokumen: ${chunk.documentTitle}\nHalaman: ${chunk.pageNumber ?? '-'}\nKonten: ${chunk.content}`,
      )
    }
  }
  const context = contextParts.join('\n\n---\n\n')

  // ── Step 7: AI answer — non-streaming ────────────────────────────────────
  const answer = await callClaude(buildSmartSearchSystemPrompt(context), rawQuery, 2048)

  // ── Step 8: Build result documents with sentence-level snippets ───────────
  const totalSupportingChunks = [...docMap.values()].reduce(
    (sum, e) => sum + e.totalChunks,
    0,
  )

  const documents = sortedEntries.map(([documentId, { chunks, bestScore }]) => {
    const meta = docMeta.get(documentId)
    const year = meta?.publishedAt
      ? new Date(meta.publishedAt as string).getFullYear().toString()
      : null

    const highlights = chunks.map(({ chunk }) => ({
      chunkId: chunk.id,
      snippet: extractBestSnippet(chunk.content, normalizedQuery, SNIPPET_MAX_LEN),
      pageNumber: chunk.pageNumber,
    }))

    return {
      id: documentId,
      title: chunks[0].chunk.documentTitle,
      ministry: (meta?.ministry as string) ?? '',
      type: (meta?.type as string) ?? '',
      year,
      score: Math.round(bestScore * 1000) / 1000,
      highlights,
    }
  })

  // ── Step 9: Compute confidence metric ─────────────────────────────────────
  // rerankScore = harmonic mean of evidence breadth and top-document similarity.
  // Harmonic mean penalises if either dimension is weak:
  //   h(a, b) = 2ab / (a + b)
  // breadth   = min(totalSupportingChunks / 5, 1.0)
  // quality   = topScore
  const topScore = sortedEntries[0]?.[1].bestScore ?? 0
  const breadth = Math.min(totalSupportingChunks / 5, 1.0)
  const rerankScore =
    breadth + topScore > 0
      ? (2 * breadth * topScore) / (breadth + topScore)
      : 0

  const result = {
    answer,
    documents,
    confidence: {
      supportingChunks: totalSupportingChunks,
      topScore: Math.round(topScore * 1000) / 1000,
      rerankScore: Math.round(rerankScore * 1000) / 1000,
    },
  }

  await cacheSet(cacheKey, result, CACHE_TTL)
  return result
})

// ─── Keyword Search ──────────────────────────────────────────────────────────

/**
 * PostgreSQL ILIKE search over chunk content and document titles.
 * Uses per-word patterns (each significant word independently) ORed together
 * so partial multi-word queries still surface relevant chunks.
 * Returns chunks with a synthetic `_titleMatch` flag for scoring.
 */
async function keywordSearch(
  normalizedQuery: string,
  limit: number,
): Promise<Array<ChunkSearchResult & { _titleMatch: boolean }>> {
  const sequelize = getSequelize()

  const words = normalizedQuery
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ''))
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w))
    .sort((a, b) => b.length - a.length) // longest (most specific) words first
    .slice(0, 5)

  if (!words.length) return []

  // Build parameterized per-word ILIKE conditions
  const contentConditions = words.map((_, i) => `dc.content ILIKE :w${i}`).join(' OR ')
  const titleConditions = words.map((_, i) => `d.title ILIKE :w${i}`).join(' OR ')

  const replacements: Record<string, unknown> = { limit }
  words.forEach((w, i) => {
    replacements[`w${i}`] = `%${w}%`
  })

  const [rows] = await sequelize.query(
    `
    SELECT
      dc.id,
      dc.content,
      dc.page_number    AS "pageNumber",
      dc.chunk_index    AS "chunkIndex",
      dc.document_id    AS "documentId",
      d.title           AS "documentTitle",
      0.0               AS distance,
      (${titleConditions}) AS "titleMatch"
    FROM document_chunks dc
    JOIN documents d ON d.id = dc.document_id
    WHERE d.status = 'indexed'
      AND (${contentConditions} OR ${titleConditions})
    ORDER BY (${titleConditions}) DESC, dc.id
    LIMIT :limit
    `,
    { replacements },
  )

  return rows as Array<ChunkSearchResult & { _titleMatch: boolean }>
}

// ─── Hybrid Merge ────────────────────────────────────────────────────────────

/**
 * Merge vector and keyword result sets.
 *
 * Scoring rules:
 *   vector-only  → finalScore = 1 - cosineDistance
 *   keyword-only → finalScore = BOOST_TITLE | BOOST_CONTENT
 *   hybrid       → finalScore = vectorScore + boost  (capped at 1.0)
 *
 * Using chunk ID as deduplication key means a chunk appearing in both sets
 * is counted once with its combined score.
 */
function mergeResults(
  vectorChunks: ChunkSearchResult[],
  keywordChunks: Array<ChunkSearchResult & { _titleMatch: boolean }>,
): Map<string, RankedChunk> {
  const merged = new Map<string, RankedChunk>()

  for (const chunk of vectorChunks) {
    merged.set(chunk.id, {
      chunk,
      finalScore: 1 - chunk.distance,
      matchType: 'vector',
    })
  }

  for (const chunk of keywordChunks) {
    const boost = chunk._titleMatch ? BOOST_TITLE : BOOST_CONTENT
    const existing = merged.get(chunk.id)
    if (existing) {
      existing.finalScore = Math.min(1.0, existing.finalScore + boost)
      existing.matchType = 'hybrid'
    } else {
      merged.set(chunk.id, {
        chunk,
        finalScore: boost,
        matchType: 'keyword',
      })
    }
  }

  return merged
}

// ─── Snippet Extraction ───────────────────────────────────────────────────────

/**
 * Find the most query-relevant sentence in a chunk and return it with
 * ±1 surrounding sentences for readability context.
 *
 * Scoring: TF-style — query word hits per sqrt(sentence word count).
 * This rewards dense, on-topic sentences without penalising longer ones too harshly.
 * Falls back to character-based extraction when no query word matches.
 */
function extractBestSnippet(text: string, normalizedQuery: string, maxLen: number): string {
  const queryWords = normalizedQuery
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w))

  // Split chunk into sentences on common terminators
  const sentences = text
    .replace(/([.!?])\s+/g, '$1\n')
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length >= 10) // discard very short fragments

  if (sentences.length <= 1 || !queryWords.length) {
    return fallbackSnippet(text, maxLen)
  }

  const scored = sentences.map((sentence, index) => {
    const lower = sentence.toLowerCase()
    const wordCount = sentence.split(/\s+/).length
    const matchCount = queryWords.filter((w) => lower.includes(w)).length
    // TF-style: penalise very long sentences that dilute hits
    const score = wordCount > 0 ? matchCount / Math.sqrt(wordCount) : 0
    return { sentence, score, index }
  })

  const best = scored.reduce((a, b) => (a.score >= b.score ? a : b))

  // No query term found — fall back to character-based
  if (best.score === 0) return fallbackSnippet(text, maxLen)

  // Include ±1 surrounding sentences for context
  const start = Math.max(0, best.index - 1)
  const end = Math.min(sentences.length - 1, best.index + 1)
  const snippet = sentences.slice(start, end + 1).join(' ').trim()

  return snippet.length > maxLen ? snippet.slice(0, maxLen).trim() + '…' : snippet
}

/** Character-boundary snippet — sentence-aware fallback. */
function fallbackSnippet(text: string, maxLen: number): string {
  const trimmed = text.trim()
  if (trimmed.length <= maxLen) return trimmed
  const slice = trimmed.slice(0, maxLen)
  const lastStop = Math.max(
    slice.lastIndexOf('. '),
    slice.lastIndexOf('.\n'),
    slice.lastIndexOf('! '),
    slice.lastIndexOf('? '),
  )
  if (lastStop > maxLen * 0.5) return slice.slice(0, lastStop + 1).trim()
  return slice.trim() + '…'
}
