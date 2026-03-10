import { mkdir, writeFile } from 'fs/promises'
import { requireRole } from '~/server/utils/auth'
import { Document, DocumentChunk, getSequelize } from '~/server/models'
import { extractPdfText, sanitizeFilename, buildFilePath, getUploadPath } from '~/server/utils/pdf'
import { chunkText } from '~/server/utils/chunker'
import { embedTexts } from '~/server/utils/embeddings'
import { cacheDelPattern } from '~/server/utils/redis'

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, 'editor')
  getSequelize()

  const formData = await readMultipartFormData(event)
  if (!formData) throw createError({ statusCode: 400, message: 'No form data' })

  const file = formData.find((f) => f.name === 'file')
  if (!file || !file.data) throw createError({ statusCode: 400, message: 'No file uploaded' })

  const title = formData.find((f) => f.name === 'title')?.data?.toString()
  const type = (formData.find((f) => f.name === 'type')?.data?.toString() || 'other') as string
  const ministry = formData.find((f) => f.name === 'ministry')?.data?.toString() || ''
  const publishedAt = formData.find((f) => f.name === 'publishedAt')?.data?.toString() || null
  const tagsRaw = formData.find((f) => f.name === 'tags')?.data?.toString() || '[]'

  if (!title) throw createError({ statusCode: 400, message: 'Title is required' })

  const tags = JSON.parse(tagsRaw) as string[]
  const filename = sanitizeFilename(file.filename || 'document.pdf')
  const uploadDir = getUploadPath()
  const filePath = buildFilePath(filename)

  // Save file to disk
  await mkdir(uploadDir, { recursive: true })
  await writeFile(filePath, file.data)

  // Create document record (status: pending)
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

  // Ingest asynchronously — don't await so the response returns fast
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

  // Batch embed all chunks
  const contents = chunks.map((c) => c.content)
  const embeddings = await embedTexts(contents)

  // Insert all chunks
  await DocumentChunk.bulkCreate(
    chunks.map((chunk, i) => ({
      documentId: docId,
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      embedding: `[${embeddings[i].join(',')}]` as any,
    }))
  )

  await Document.update({ status: 'indexed' }, { where: { id: docId } })
}
