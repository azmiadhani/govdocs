import { readFile } from 'fs/promises'

export interface ExtractedPDF {
  text: string
  pageCount: number
  info: Record<string, unknown>
}

export async function extractPdfText(filePath: string): Promise<ExtractedPDF> {
  // Dynamic import to avoid esbuild bundling issues with pdf-parse
  const pdfParse = (await import('pdf-parse')).default

  const buffer = await readFile(filePath)
  const data = await pdfParse(buffer)

  return {
    text: data.text,
    pageCount: data.numpages,
    info: data.info as Record<string, unknown>,
  }
}
