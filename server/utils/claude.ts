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
  return `You are an AI assistant specialized in analyzing Indonesian government documents. You answer questions based strictly on the provided document context.

## Document Context

${context}

## Instructions
- Answer based only on the provided context
- If the context doesn't contain enough information, say so clearly
- Cite specific documents and page numbers when referencing information (e.g., "According to [Document Title], Page X...")
- Respond in the same language as the user's question
- Format responses with clear markdown structure when appropriate`
}

export function buildSummarizationPrompt(): string {
  return `You are an expert analyst of Indonesian government documents. Your task is to produce a structured analysis.

Provide your response in the following JSON format:
{
  "summary": "A comprehensive markdown-formatted summary of 3-5 paragraphs covering the document's purpose, key provisions, and significance",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3", "Key point 4", "Key point 5"]
}

The summary should be thorough but accessible. Key points should be concise, actionable bullet points (5-7 items max).`
}
