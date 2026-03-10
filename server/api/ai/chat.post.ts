import { ChatSession, ChatMessage, getSequelize } from '~/server/models'
import { requireAuth } from '~/server/utils/auth'
import { embedText } from '~/server/utils/embeddings'
import { vectorSearch } from '~/server/utils/vectorSearch'
import { streamClaude, buildRAGSystemPrompt } from '~/server/utils/claude'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'
import type { ChatRequestBody } from '~/types'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  getSequelize()

  const { query, sessionId, documentIds } = await readBody<ChatRequestBody>(event)

  if (!query?.trim()) throw createError({ statusCode: 400, message: 'Query is required' })
  if (!sessionId) throw createError({ statusCode: 400, message: 'sessionId is required' })

  // Verify session belongs to user
  const session = await ChatSession.findOne({ where: { id: sessionId, userId: user.id } })
  if (!session) throw createError({ statusCode: 404, message: 'Session not found' })

  // 1. Embed user query
  const queryEmbedding = await embedText(query)

  // 2. Vector search — scoped to documentIds if provided
  const chunks = await vectorSearch({
    embedding: queryEmbedding,
    documentIds: documentIds ?? null,
    topK: 6,
  })

  // 3. Build context
  const context = chunks
    .map((c) => `[Doc: ${c.documentTitle}, Page ${c.pageNumber}]\n${c.content}`)
    .join('\n\n---\n\n')

  // 4. Fetch chat history
  const history = await ChatMessage.findAll({
    where: { sessionId },
    order: [['createdAt', 'ASC']],
    limit: 20,
  })

  const messages: MessageParam[] = [
    ...history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: query },
  ]

  // 5. Save user message
  await ChatMessage.create({
    sessionId,
    role: 'user',
    content: query,
    sources: [],
  })

  // 6. Stream response
  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  })

  const sources = chunks.map((c) => ({
    chunkId: c.id,
    documentId: c.documentId,
    documentTitle: c.documentTitle,
    pageNumber: c.pageNumber,
    content: c.content.slice(0, 200),
  }))

  const stream = await streamClaude({
    systemPrompt: buildRAGSystemPrompt(context || 'No relevant document context found.'),
    messages,
    cacheSystemPrompt: true,
  })

  // Collect full response text to save to DB after streaming
  let fullResponse = ''
  const [streamForClient, streamForSaving] = stream.tee()

  // Save assistant message after stream completes (non-blocking)
  ;(async () => {
    const reader = streamForSaving.getReader()
    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')
      for (const line of lines) {
        if (line.startsWith('data: ') && !line.includes('[DONE]')) {
          try {
            const parsed = JSON.parse(line.slice(6))
            if (parsed.text) fullResponse += parsed.text
          } catch {}
        }
      }
    }
    if (fullResponse) {
      await ChatMessage.create({ sessionId, role: 'assistant', content: fullResponse, sources })
    }
  })().catch(console.error)

  return sendStream(event, streamForClient)
})
