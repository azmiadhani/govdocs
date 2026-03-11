import OpenAI from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'

export type MessageParam = ChatCompletionMessageParam

const MODEL = 'gpt-4o-mini'

let openaiClient: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (openaiClient) return openaiClient

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set')

  openaiClient = new OpenAI({ apiKey })
  return openaiClient
}

export interface StreamClaudeOptions {
  systemPrompt: string
  messages: MessageParam[]
  cacheSystemPrompt?: boolean
  maxTokens?: number
}

export async function streamClaude(options: StreamClaudeOptions): Promise<ReadableStream> {
  const { systemPrompt, messages, maxTokens = 2048 } = options
  const openai = getOpenAI()

  const allMessages: MessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ]

  const stream = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: allMessages,
    stream: true,
  })

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content
          if (text) {
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`)
            )
          }
        }
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
        controller.close()
      } catch (err) {
        controller.error(err)
      }
    },
  })
}

export async function callClaude(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 4096
): Promise<string> {
  const openai = getOpenAI()

  const response = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  })

  return response.choices[0]?.message?.content ?? ''
}

export function buildRAGSystemPrompt(context: string): string {
  return `Anda adalah asisten AI yang ahli dalam menganalisis dokumen pemerintah Indonesia. Jawab pertanyaan berdasarkan konteks dokumen yang diberikan.

## Konteks Dokumen

${context}

## Instruksi
- Jawab hanya berdasarkan konteks yang diberikan
- Jika konteks tidak memuat informasi yang cukup, sampaikan dengan jelas
- Sebutkan dokumen dan nomor halaman saat merujuk informasi (contoh: "Berdasarkan [Judul Dokumen], Halaman X...")
- Selalu jawab dalam Bahasa Indonesia
- Gunakan format markdown yang jelas dan terstruktur`
}

export function buildSummarizationPrompt(): string {
  return `Anda adalah analis ahli dokumen pemerintah Indonesia. Tugas Anda adalah menghasilkan analisis terstruktur dalam Bahasa Indonesia.

Berikan respons Anda dalam format JSON berikut (TANPA markdown code fence, langsung JSON mentah):
{
  "summary": "<isi markdown di sini>",
  "keyPoints": ["Poin kunci 1", "Poin kunci 2", "Poin kunci 3", "Poin kunci 4", "Poin kunci 5"]
}

Untuk field "summary", gunakan markdown yang kaya dengan struktur berikut:
## Gambaran Umum
Paragraf pembuka tentang tujuan dan konteks dokumen.

## Ketentuan Utama
- Poin ketentuan penting pertama
- Poin ketentuan penting kedua

## Signifikansi
Paragraf penutup tentang dampak dan pentingnya dokumen.

Untuk field "keyPoints": daftar 5-7 poin ringkas dan informatif.
Seluruh teks harus dalam Bahasa Indonesia.`
}
