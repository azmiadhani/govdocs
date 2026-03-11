import { requireRole } from '~/server/utils/auth'
import { Document, DocumentChunk, getSequelize } from '~/server/models'
import { extractPdfText } from '~/server/utils/pdf'
import { saveFile, sanitizeFilename } from '~/server/utils/storage'
import { chunkText } from '~/server/utils/chunker'
import { embedTexts } from '~/server/utils/embeddings'
import { cacheDelPattern } from '~/server/utils/redis'

const EMBED_BATCH_SIZE = 100 // OpenAI limit is 2048 but 100 keeps request sizes safe

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, 'editor')
  getSequelize()

  const formData = await readMultipartFormData(event)
  if (!formData) throw createError({ statusCode: 400, message: 'No form data' })

  const file = formData.find((f) => f.name === 'file')
  if (!file?.data) throw createError({ statusCode: 400, message: 'No file uploaded' })

  const title = formData.find((f) => f.name === 'title')?.data?.toString()
  if (!title) throw createError({ statusCode: 400, message: 'Title is required' })

  const type = formData.find((f) => f.name === 'type')?.data?.toString() || 'other'
  const ministry = formData.find((f) => f.name === 'ministry')?.data?.toString() || ''
  const publishedAt = formData.find((f) => f.name === 'publishedAt')?.data?.toString() || null
  const tags = JSON.parse(formData.find((f) => f.name === 'tags')?.data?.toString() || '[]') as string[]

  const filename = sanitizeFilename(file.filename || 'document.pdf')
  const filePath = await saveFile(Buffer.from(file.data), filename)

  const doc = await Document.create({
    title,
    type,
    ministry,
    filePath,
    fileSize: file.data.length,
    publishedAt: publishedAt || null,
    tags,
    uploadedBy: user.id,
    status: 'pending',
  })

  // Fire-and-forget ingestion — response returns immediately
  ingestDocument(doc.id, filePath).catch((err) => {
    console.error(`[Ingest] Failed for doc ${doc.id}:`, err)
    Document.update({ status: 'error' }, { where: { id: doc.id } })
  })

  await cacheDelPattern('docs:list:*')

  return { document: doc }
})

async function ingestDocument(docId: string, filePath: string) {
  const { text, pageCount } = await extractPdfText(filePath)

  await Document.update({ pageCount }, { where: { id: docId } })

  const chunks = chunkText(text)
  if (chunks.length === 0) {
    await Document.update({ status: 'error' }, { where: { id: docId } })
    throw new Error('No text could be extracted from the PDF')
  }

  // Embed in batches to respect OpenAI rate limits
  const allEmbeddings: number[][] = []
  for (let i = 0; i < chunks.length; i += EMBED_BATCH_SIZE) {
    const batch = chunks.slice(i, i + EMBED_BATCH_SIZE).map((c) => c.content)
    const batchEmbeddings = await embedTexts(batch)
    allEmbeddings.push(...batchEmbeddings)
  }

  await DocumentChunk.bulkCreate(
    chunks.map((chunk, i) => ({
      documentId: docId,
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      embedding: `[${allEmbeddings[i].join(',')}]` as any,
    })),
  )

  await Document.update({ status: 'indexed' }, { where: { id: docId } })
  await cacheDelPattern('docs:list:*')
  console.log(`[Ingest] Completed doc ${docId} — ${chunks.length} chunks`)
}
