import Anthropic from '@anthropic-ai/sdk'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'

const MODEL = 'claude-sonnet-4-5'

let anthropicClient: Anthropic | null = null

function getAnthropic(): Anthropic {
  if (anthropicClient) return anthropicClient

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')

  anthropicClient = new Anthropic({ apiKey })
  return anthropicClient
}

export interface StreamClaudeOptions {
  systemPrompt: string
  messages: MessageParam[]
  cacheSystemPrompt?: boolean
  maxTokens?: number
}

export async function streamClaude(options: StreamClaudeOptions): Promise<ReadableStream> {
  const { systemPrompt, messages, cacheSystemPrompt = true, maxTokens = 2048 } = options
  const anthropic = getAnthropic()

  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: maxTokens,
    system: cacheSystemPrompt
      ? [
          {
            type: 'text',
            text: systemPrompt,
            cache_control: { type: 'ephemeral' },
          },
        ]
      : systemPrompt,
    messages,
  })

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
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
  const anthropic = getAnthropic()

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude')
  return content.text
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
