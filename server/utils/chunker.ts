const CHUNK_SIZE = 800  // tokens (approximated as chars / 4)
const CHUNK_OVERLAP = 100
const CHARS_PER_TOKEN = 4

const CHUNK_SIZE_CHARS = CHUNK_SIZE * CHARS_PER_TOKEN      // ~3200 chars
const OVERLAP_CHARS = CHUNK_OVERLAP * CHARS_PER_TOKEN       // ~400 chars

export interface TextChunk {
  content: string
  chunkIndex: number
  pageNumber: number
}

/**
 * Recursive character text splitter that preserves paragraph boundaries.
 * Splits on: paragraphs → sentences → words → characters
 */
export function chunkText(text: string, startPage = 1): TextChunk[] {
  const chunks: TextChunk[] = []
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim().length > 0)

  let buffer = ''
  let chunkIndex = 0
  let currentPage = startPage

  const flushBuffer = () => {
    if (buffer.trim().length === 0) return
    chunks.push({
      content: buffer.trim(),
      chunkIndex: chunkIndex++,
      pageNumber: currentPage,
    })
    // Keep overlap at the end of the buffer
    buffer = buffer.slice(-OVERLAP_CHARS)
  }

  for (const para of paragraphs) {
    // Track approximate page by looking for form-feed or page markers
    if (para.includes('\f') || /^page\s+\d+/i.test(para)) {
      currentPage++
    }

    if (buffer.length + para.length + 2 > CHUNK_SIZE_CHARS && buffer.length > 0) {
      flushBuffer()
    }

    buffer += (buffer ? '\n\n' : '') + para

    // If a single paragraph is too large, split it further by sentences
    while (buffer.length > CHUNK_SIZE_CHARS) {
      const splitAt = findSplitPoint(buffer, CHUNK_SIZE_CHARS)
      chunks.push({
        content: buffer.slice(0, splitAt).trim(),
        chunkIndex: chunkIndex++,
        pageNumber: currentPage,
      })
      buffer = buffer.slice(splitAt - OVERLAP_CHARS)
    }
  }

  if (buffer.trim().length > 0) {
    flushBuffer()
  }

  return chunks
}

function findSplitPoint(text: string, maxLength: number): number {
  // Try to split on sentence boundary
  const sentenceEnd = text.lastIndexOf('. ', maxLength)
  if (sentenceEnd > maxLength * 0.5) return sentenceEnd + 1

  // Fall back to word boundary
  const wordEnd = text.lastIndexOf(' ', maxLength)
  if (wordEnd > 0) return wordEnd

  return maxLength
}
