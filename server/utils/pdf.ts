import { readFile } from 'fs/promises'
import { join } from 'path'

export interface ExtractedPDF {
  text: string
  pageCount: number
  info: Record<string, unknown>
}

export async function extractPdfText(filePath: string): Promise<ExtractedPDF> {
  // Dynamic import to avoid issues with Nuxt's SSR bundling
  const pdfParse = (await import('pdf-parse')).default

  const buffer = await readFile(filePath)
  const data = await pdfParse(buffer)

  return {
    text: data.text,
    pageCount: data.numpages,
    info: data.info as Record<string, unknown>,
  }
}

export function getUploadPath(): string {
  return process.env.STORAGE_PATH || join(process.cwd(), 'uploads')
}

export function buildFilePath(filename: string): string {
  return join(getUploadPath(), filename)
}

export function sanitizeFilename(original: string): string {
  const ext = original.split('.').pop()?.toLowerCase() || 'pdf'
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 8)
  return `${timestamp}-${random}.${ext}`
}
