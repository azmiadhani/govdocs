import { createReadStream, statSync, existsSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const filename = getRouterParam(event, 'filename')!
  const download = getQuery(event).download === 'true'

  const storagePath = process.env.STORAGE_PATH || './uploads'
  const filePath = join(storagePath, filename)

  if (!existsSync(filePath)) {
    throw createError({ statusCode: 404, message: 'File tidak ditemukan' })
  }

  const stat = statSync(filePath)

  setResponseHeaders(event, {
    'Content-Type': 'application/pdf',
    'Content-Length': String(stat.size),
    'Content-Disposition': download
      ? `attachment; filename="${filename}"`
      : `inline; filename="${filename}"`,
    'Cache-Control': 'public, max-age=3600',
  })

  return sendStream(event, createReadStream(filePath))
})
