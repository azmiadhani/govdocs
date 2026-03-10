import { Document, DocumentChunk, AiSummary, getSequelize } from '~/server/models'
import { requireRole } from '~/server/utils/auth'
import { extractPdfText } from '~/server/utils/pdf'
import { chunkText } from '~/server/utils/chunker'
import { embedTexts } from '~/server/utils/embeddings'
import { cacheDel } from '~/server/utils/redis'

export default defineEventHandler(async (event) => {
  await requireRole(event, 'admin')
  getSequelize()

  const { documentId } = await readBody(event)
  if (!documentId) throw createError({ statusCode: 400, message: 'documentId is required' })

  const doc = await Document.findByPk(documentId)
  if (!doc) throw createError({ statusCode: 404, message: 'Document not found' })

  // Reset status
  await doc.update({ status: 'pending' })

  // Delete existing chunks and summary
  await DocumentChunk.destroy({ where: { documentId } })
  await AiSummary.destroy({ where: { documentId } })
  await cacheDel(`summary:${documentId}`)

  // Re-ingest
  const { text, pageCount } = await extractPdfText(doc.filePath)
  await doc.update({ pageCount })

  const chunks = chunkText(text)
  const contents = chunks.map((c) => c.content)
  const embeddings = await embedTexts(contents)

  await DocumentChunk.bulkCreate(
    chunks.map((chunk, i) => ({
      documentId,
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      embedding: `[${embeddings[i].join(',')}]` as any,
    }))
  )

  await doc.update({ status: 'indexed' })

  return { ok: true, chunks: chunks.length }
})
