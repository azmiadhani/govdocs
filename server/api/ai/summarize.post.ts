import { Document, AiSummary, getSequelize } from '~/server/models'
import { requireAuth } from '~/server/utils/auth'
import { extractPdfText } from '~/server/utils/pdf'
import { callClaude, buildSummarizationPrompt } from '~/server/utils/claude'
import { cacheGet, cacheSet } from '~/server/utils/redis'

const MODEL = 'gpt-4o-mini'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  getSequelize()

  const { documentId } = await readBody(event)
  if (!documentId) throw createError({ statusCode: 400, message: 'documentId is required' })

  // Check Redis cache first
  const cacheKey = `summary:${documentId}`
  const cached = await cacheGet(cacheKey)
  if (cached) return { summary: cached, cached: true }

  // Check DB cache
  const existing = await AiSummary.findOne({ where: { documentId } })
  if (existing) {
    await cacheSet(cacheKey, existing, 3600)
    return { summary: existing, cached: true }
  }

  const doc = await Document.findByPk(documentId)
  if (!doc) throw createError({ statusCode: 404, message: 'Document not found' })
  if (doc.status !== 'indexed') {
    throw createError({ statusCode: 400, message: 'Document is not yet indexed' })
  }

  // Extract text and call Claude
  const { text } = await extractPdfText(doc.filePath)
  const truncatedText = text.slice(0, 100_000) // ~25k tokens max

  const systemPrompt = buildSummarizationPrompt()
  const response = await callClaude(systemPrompt, `Please analyze this document:\n\n${truncatedText}`, 4096)

  let summary: string
  let keyPoints: string[]

  try {
    const parsed = JSON.parse(response)
    summary = parsed.summary
    keyPoints = parsed.keyPoints
  } catch {
    // Fallback if Claude didn't return valid JSON
    summary = response
    keyPoints = []
  }

  const aiSummary = await AiSummary.create({
    documentId,
    summary,
    keyPoints,
    modelUsed: MODEL,
  })

  await cacheSet(cacheKey, aiSummary, 3600)

  return { summary: aiSummary, cached: false }
})
